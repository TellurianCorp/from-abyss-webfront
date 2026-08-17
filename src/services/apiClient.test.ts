import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import apiClient from './apiClient'

/**
 * These cover three defects that all failed silently and all looked like
 * backend problems from the browser, which is exactly why they survived.
 */

type FetchCall = { url: string; init: RequestInit }

let calls: FetchCall[] = []

function jsonResponse(body: unknown = {}, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function headersOf(init: RequestInit): Record<string, string> {
  return (init.headers ?? {}) as Record<string, string>
}

beforeEach(() => {
  calls = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init })
      return jsonResponse({ ok: true })
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('credentials', () => {
  it('sends the session cookie on every request', async () => {
    await apiClient.get('/v1/articles')

    expect(calls).toHaveLength(1)
    expect(calls[0].init.credentials).toBe('include')
  })

  it('sends the session cookie on uploads too', async () => {
    const form = new FormData()
    form.append('file', new Blob(['x']), 'a.png')

    await apiClient.upload('/v1/media/upload', form)

    expect(calls[0].init.credentials).toBe('include')
  })

  it('sends the session cookie on writes', async () => {
    await apiClient.post('/v1/articles', { title: 'x' })
    await apiClient.put('/v1/articles/1', { title: 'y' })
    await apiClient.delete('/v1/articles/1')

    for (const call of calls) {
      expect(call.init.credentials).toBe('include')
    }
  })
})

describe('multipart uploads', () => {
  /**
   * The regression that matters most. upload() removed Content-Type, but
   * request() merged the JSON default back over it, so every multipart body was
   * declared application/json with no boundary and the server could not parse
   * it. Image upload had never worked through this client.
   */
  it('does not declare a Content-Type, so the browser can set the boundary', async () => {
    const form = new FormData()
    form.append('file', new Blob(['x']), 'a.png')

    await apiClient.upload('/v1/media/upload', form)

    expect(headersOf(calls[0].init)['Content-Type']).toBeUndefined()
  })

  it('sends the FormData as the body untouched', async () => {
    const form = new FormData()
    form.append('file', new Blob(['x']), 'a.png')

    await apiClient.upload('/v1/media/upload', form)

    expect(calls[0].init.body).toBe(form)
  })

  it('still declares JSON for ordinary requests', async () => {
    await apiClient.post('/v1/articles', { title: 'x' })

    expect(headersOf(calls[0].init)['Content-Type']).toBe('application/json')
  })
})

describe('authentication headers', () => {
  /**
   * The client used to attach a bearer token read from localStorage.auth_token,
   * a key nothing in this codebase ever writes, against an API that has no
   * bearer-token path at all.
   */
  it('never sends an Authorization header', async () => {
    await apiClient.get('/v1/articles')

    expect(headersOf(calls[0].init).Authorization).toBeUndefined()
  })

  it('ignores a stale auth_token left in localStorage', async () => {
    localStorage.setItem('auth_token', 'stale-token-from-an-older-build')

    await apiClient.get('/v1/articles')

    const headers = headersOf(calls[0].init)
    expect(headers.Authorization).toBeUndefined()
    expect(JSON.stringify(headers)).not.toContain('stale-token')
  })
})
