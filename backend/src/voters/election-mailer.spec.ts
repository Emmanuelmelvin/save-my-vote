import { Election } from '../elections/entities/election.entity.js';
import { EmailTemplateType } from '../elections/entities/email-template.entity.js';
import { ElectionEmailComposer } from './election-mailer.js';

const election = Object.assign(new Election(), {
  id: 'e1',
  title: 'Union <Vote>',
  startAt: new Date('2027-03-01T09:00:00Z'),
  endAt: new Date('2027-03-01T17:00:00Z'),
  primaryColor: '#ff0000',
  logoUrl: null,
});

describe('ElectionEmailComposer', () => {
  it('fills the template, escapes HTML and includes the code and link', () => {
    const composer = new ElectionEmailComposer(
      election,
      {
        type: EmailTemplateType.Invitation,
        fromName: 'Committee',
        subject: 'Vote in {{electionTitle}}',
        body: 'Hi {{voterName}}, voting opens {{startAt}}.',
        isDefault: false,
      },
      'https://app.example.com/vote/e1',
    );

    const message = composer.compose(
      { email: 'ada@example.com', displayName: 'Ada' },
      'K7P2QX',
    );

    expect(message.to).toBe('ada@example.com');
    expect(message.fromName).toBe('Committee');
    expect(message.subject).toBe('Vote in Union <Vote>');
    expect(message.text).toContain(
      'Hi Ada, voting opens Monday, 1 March 2027 at 09:00 UTC.',
    );
    expect(message.text).toContain('UTC');
    expect(message.text).toContain('Your one-time code: K7P2QX');
    expect(message.text).toContain('https://app.example.com/vote/e1');
    expect(message.html).toContain('Union &lt;Vote&gt;');
    expect(message.html).not.toContain('<Vote>');
  });

  it('leaves the ballot link out of confirmations', () => {
    const composer = new ElectionEmailComposer(
      election,
      {
        type: EmailTemplateType.Confirmation,
        fromName: 'Committee',
        subject: 'Thanks',
        body: 'Recorded.',
        isDefault: true,
      },
      'https://app.example.com/vote/e1',
    );
    const message = composer.compose({
      email: 'ada@example.com',
      displayName: 'Ada',
    });
    expect(message.text).not.toContain('Vote here');
    expect(message.text).not.toContain('one-time code');
  });
});
