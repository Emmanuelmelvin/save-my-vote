/** An error response from the API: `{ status, statusCode, message, errors? }`. */
export class ApiError extends Error {
  readonly status: number
  readonly errors: string[]

  constructor(status: number, message: string, errors: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  /** The message plus any per-field details, for showing to the user. */
  get details(): string {
    return this.errors.length ? `${this.message}: ${this.errors.join('; ')}` : this.message
  }
}

type Query = Record<string, string | number | boolean | undefined>

/**
 * Thin wrapper over fetch for the SaveMyVote API. Sends the auth cookie with every
 * request, unwraps the `{ status: 'success', data }` envelope, and turns error
 * responses into ApiError.
 */
export class ApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  /** Absolute URL for browser navigations (e.g. Google sign-in). */
  url(path: string, query?: Query): string {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== '') search.set(key, String(value))
    }
    const qs = search.toString()
    return `${this.baseUrl}${path}${qs ? `?${qs}` : ''}`
  }

  get<T>(path: string, query?: Query): Promise<T> {
    return this.request<T>('GET', this.url(path, query))
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', this.url(path), body)
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', this.url(path), body)
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', this.url(path), body)
  }

  delete<T = void>(path: string): Promise<T> {
    return this.request<T>('DELETE', this.url(path))
  }

  private async request<T>(method: string, url: string, body?: unknown): Promise<T> {
    let response: Response
    try {
      response = await fetch(url, {
        method,
        credentials: 'include',
        headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
    }

    if (response.status === 204) return undefined as T
    const payload = (await response.json().catch(() => null)) as
      | { data?: T; message?: string; errors?: string[] }
      | null

    if (!response.ok) {
      throw new ApiError(response.status, payload?.message ?? `Request failed (${response.status})`, payload?.errors ?? [])
    }
    return payload?.data as T
  }
}

export const http = new ApiClient(import.meta.env.VITE_API_URL ?? '/api/v1')
