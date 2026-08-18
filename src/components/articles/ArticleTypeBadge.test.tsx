import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import i18n from '../../i18n/config'
import { ArticleTypeBadge } from './ArticleTypeBadge'
import type { ArticleType } from '../../services/articleTypeService'

afterEach(cleanup)

// The real i18n instance rather than a mock: the language is the input this
// component is actually about, and a stub would prove nothing about the switch.
beforeEach(async () => {
  await i18n.changeLanguage('en-GB')
})

const news: ArticleType = {
  id: 'id-news',
  slug: 'news',
  name: { 'pt-BR': 'Notícia', 'en-GB': 'News' },
  description: {},
  display_order: 10,
  created_at: '2026-08-18T00:00:00Z',
  updated_at: '2026-08-18T00:00:00Z',
}

function renderBadge(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ArticleTypeBadge', () => {
  // Nothing was backfilled, so an untyped article is the common case. This is
  // the test that keeps every pre-existing article rendering cleanly.
  it('renders nothing without a type', () => {
    const { container } = renderBadge(<ArticleTypeBadge />)
    expect(container.innerHTML).toBe('')
  })

  it('shows the label for the current language', () => {
    renderBadge(<ArticleTypeBadge type={news} />)
    expect(screen.getByText('News')).toBeTruthy()
  })

  it('is plain text unless asked to link', () => {
    renderBadge(<ArticleTypeBadge type={news} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('points at the type page when linked', () => {
    renderBadge(<ArticleTypeBadge type={news} linked />)
    expect(screen.getByRole('link').getAttribute('href')).toBe('/articles/type/news')
  })

  it('follows a language change without refetching anything', async () => {
    renderBadge(<ArticleTypeBadge type={news} />)
    expect(screen.getByText('News')).toBeTruthy()

    await i18n.changeLanguage('pt-BR')
    expect(screen.getByText('Notícia')).toBeTruthy()
  })

  it('falls back to the slug rather than rendering an empty chip', () => {
    renderBadge(<ArticleTypeBadge type={{ ...news, name: {} }} />)
    expect(screen.getByText('news')).toBeTruthy()
  })
})
