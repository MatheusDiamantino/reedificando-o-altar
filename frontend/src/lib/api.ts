export class ApiError extends Error {
  status: number
  code: string
  fields?: Record<string, string>

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }
}

function csrfToken(): string | undefined {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith('mra_csrf='))
    ?.split('=')[1]
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const method = (init.method ?? 'GET').toUpperCase()

  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (method !== 'GET') {
    const token = csrfToken()
    if (token) headers.set('X-CSRF-Token', token)
  }

  const res = await fetch(`/api${path}`, { ...init, headers, credentials: 'same-origin' })
  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const err = body?.error
    throw new ApiError(res.status, err?.code ?? 'erro', err?.message ?? 'Algo deu errado. Tente de novo.', err?.fields)
  }
  return body?.data as T
}
