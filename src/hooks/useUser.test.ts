import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUser } from './useUser'

/**
 * Pins the localStorage-caching gap fixed alongside the writer-route guard:
 * can_write_articles must reach the hook's live state but never the cached
 * blob, because a stale permission read back out of localStorage later would
 * be worse than a brief absence while the real check completes.
 */

function jsonResponse(body: unknown = {}, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

describe('useUser', () => {
  it('reports the writer capability without persisting it to localStorage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          id: 'user-1',
          name: 'Ripley',
          email: 'ripley@example.com',
          can_write_articles: true,
        }),
      ),
    )

    const { result } = renderHook(() => useUser())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.canWriteArticles).toBe(true)

    const persisted = JSON.parse(localStorage.getItem('userInfo') ?? 'null')
    expect(persisted).not.toBeNull()
    expect(persisted).not.toHaveProperty('can_write_articles')
    // The identity fields the brief says stay cached exactly as before.
    expect(persisted.id).toBe('user-1')
    expect(persisted.name).toBe('Ripley')
  })
})
