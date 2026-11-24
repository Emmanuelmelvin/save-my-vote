import { MailDeliveryError, type OutgoingEmail } from './mail-transport.js';
import { SendByteMailTransport } from './sendbyte-mail.transport.js';

const email = (to: string): OutgoingEmail => ({
  from: '"Committee" <no-reply@savemyvote.example>',
  to,
  replyTo: 'help@savemyvote.example',
  subject: 'Your voting code',
  html: '<p>K7P2QX</p>',
  text: 'K7P2QX',
});

const created = () =>
  new Response(JSON.stringify({ id: 'em_1', status: 'queued' }), {
    status: 201,
  });

const apiError = (status: number, code: string, message: string) =>
  new Response(JSON.stringify({ error: { code, message } }), { status });

function transportWith(responses: Array<() => Response>) {
  const fetch = vi.fn<typeof globalThis.fetch>(() => {
    const next = responses.shift();
    if (!next) throw new Error('unexpected request');
    return Promise.resolve(next());
  });
  const transport = new SendByteMailTransport('sk_test_abc', {
    fetch,
    minIntervalMs: 0,
  });
  return { transport, fetch };
}

function bodyOf(fetch: ReturnType<typeof vi.fn>, call = 0) {
  const init = fetch.mock.calls[call][1] as RequestInit;
  return JSON.parse(init.body as string) as Record<string, unknown>;
}

describe('SendByteMailTransport', () => {
  it('posts one email with reply_to and an idempotency key', async () => {
    const { transport, fetch } = transportWith([created]);

    await transport.deliver(email('ada@example.com'));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      'https://api.sendbyte.africa/v1/emails',
    );
    const headers = (fetch.mock.calls[0][1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(headers.authorization).toBe('Bearer sk_test_abc');
    expect(bodyOf(fetch)).toMatchObject({
      from: '"Committee" <no-reply@savemyvote.example>',
      to: 'ada@example.com',
      reply_to: 'help@savemyvote.example',
      subject: 'Your voting code',
      html: '<p>K7P2QX</p>',
      text: 'K7P2QX',
    });
    expect(bodyOf(fetch).idempotency_key).toEqual(expect.any(String));
  });

  it('retries a rate-limited send under the same idempotency key', async () => {
    const limited = () =>
      new Response(
        JSON.stringify({
          error: { code: 'rate_limit_exceeded', message: 'Slow down' },
        }),
        { status: 429, headers: { 'retry-after': '0' } },
      );
    const { transport, fetch } = transportWith([limited, created]);

    await transport.deliver(email('ada@example.com'));

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(bodyOf(fetch, 1).idempotency_key).toBe(
      bodyOf(fetch, 0).idempotency_key,
    );
  });

  it('does not retry a rejected email and keeps the address out of the error', async () => {
    const { transport, fetch } = transportWith([
      () =>
        apiError(
          422,
          'suppressed_recipient',
          'ada@example.com is on the suppression list',
        ),
    ]);

    const error = await transport
      .deliver(email('ada@example.com'))
      .catch((e: unknown) => e);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(MailDeliveryError);
    expect((error as MailDeliveryError).retryable).toBe(false);
    expect((error as MailDeliveryError).message).toBe(
      'SendByte suppressed_recipient (422): <email> is on the suppression list',
    );
  });

  it('reports each email of a batch separately', async () => {
    const { transport } = transportWith([
      created,
      () => apiError(422, 'validation_error', 'Invalid recipient'),
      created,
    ]);

    const outcomes = await transport.deliverMany([
      email('a@example.com'),
      email('b@example.com'),
      email('c@example.com'),
    ]);

    expect(outcomes.map((outcome) => outcome.delivered)).toEqual([
      true,
      false,
      true,
    ]);
  });

  it('spaces requests out to stay under the rate limit', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(created()),
    );
    const transport = new SendByteMailTransport('sk_test_abc', {
      fetch,
      minIntervalMs: 40,
    });

    const started = Date.now();
    await transport.deliverMany([
      email('a@example.com'),
      email('b@example.com'),
      email('c@example.com'),
    ]);

    // Three sends need two gaps of 40 ms (allow a little timer slack).
    expect(Date.now() - started).toBeGreaterThanOrEqual(75);
  });
});
