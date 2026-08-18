import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Articles } from './Articles'

const mockUseUser = vi.hoisted(() => vi.fn())
vi.mock('../hooks/useUser', () => ({ useUser: mockUseUser }))

// @testing-library/react normally self-registers `afterEach(cleanup)`, but
// that registration only fires when it detects a global `afterEach` — this
// project runs Vitest with globals: false, so nothing does that detection and
// renders from earlier tests leak into later ones without this.
afterEach(cleanup)

function jsonResponse(body: unknown = {}, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  // Articles renders ArticleList, which fetches on mount. Stub fetch so the
  // test does not hit the network and flake.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => jsonResponse({ articles: [], total: 0 })),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderPage() {
  return render(
    <MemoryRouter>
      <Articles />
    </MemoryRouter>
  )
}

describe('Articles page', () => {
  it('offers the new article action to a writer', () => {
    mockUseUser.mockReturnValue({ userInfo: { id: '1' }, isLoading: false, canWriteArticles: true })
    renderPage()
    expect(screen.getByRole('link', { name: /new article/i })).toBeTruthy()
  })

  it('hides the action from a non-writer', () => {
    mockUseUser.mockReturnValue({ userInfo: { id: '1' }, isLoading: false, canWriteArticles: false })
    renderPage()
    expect(screen.queryByRole('link', { name: /new article/i })).toBeNull()
  })
})
