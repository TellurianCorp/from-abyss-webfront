import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { WriterRoute } from './WriterRoute'

const mockUseUser = vi.hoisted(() => vi.fn())
vi.mock('../hooks/useUser', () => ({ useUser: mockUseUser }))

// @testing-library/react normally self-registers `afterEach(cleanup)`, but
// that registration only fires when it detects a global `afterEach` — this
// project runs Vitest with globals: false, so nothing does that detection and
// renders from earlier tests leak into later ones without this.
afterEach(cleanup)

function renderGuard() {
  return render(
    <MemoryRouter>
      <WriterRoute>
        <p>the editor</p>
      </WriterRoute>
    </MemoryRouter>
  )
}

describe('WriterRoute', () => {
  it('renders the editor for a writer', () => {
    mockUseUser.mockReturnValue({
      userInfo: { id: '1' },
      isLoading: false,
      canWriteArticles: true,
    })
    renderGuard()
    expect(screen.getByText('the editor')).toBeTruthy()
  })

  it('withholds the editor from a signed-in non-writer', () => {
    mockUseUser.mockReturnValue({
      userInfo: { id: '1' },
      isLoading: false,
      canWriteArticles: false,
    })
    renderGuard()
    expect(screen.queryByText('the editor')).toBeNull()
  })

  it('withholds the editor while the session is still being checked', () => {
    // Rendering during the check would flash the editor at everyone.
    mockUseUser.mockReturnValue({
      userInfo: null,
      isLoading: true,
      canWriteArticles: false,
    })
    renderGuard()
    expect(screen.queryByText('the editor')).toBeNull()
  })
})
