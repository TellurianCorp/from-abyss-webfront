import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ArticlesByType } from './ArticlesByType'
import i18n from '../i18n/config'
import articleService from '../services/articleService'
import articleTypeService, { type ArticleType } from '../services/articleTypeService'
import { invalidateArticleTypes } from '../hooks/useArticleTypes'

afterEach(cleanup)

const news: ArticleType = {
  id: 'id-news',
  slug: 'news',
  name: { 'pt-BR': 'Notícia', 'en-GB': 'News' },
  description: { 'pt-BR': 'O que aconteceu', 'en-GB': 'What happened' },
  display_order: 10,
  created_at: '2026-08-18T00:00:00Z',
  updated_at: '2026-08-18T00:00:00Z',
}

beforeEach(async () => {
  invalidateArticleTypes()
  await i18n.changeLanguage('en-GB')
  vi.spyOn(articleTypeService, 'listTypes').mockResolvedValue([news])
  vi.spyOn(articleService, 'listPublicArticles').mockResolvedValue({
    articles: [],
    total: 0,
    limit: 20,
    offset: 0,
  })
})

afterEach(() => {
  invalidateArticleTypes()
  vi.restoreAllMocks()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/articles/type/:typeSlug" element={<ArticlesByType />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ArticlesByType', () => {
  it('heads the page with the type name and description', async () => {
    renderAt('/articles/type/news')

    await waitFor(() => expect(screen.getByRole('heading', { name: 'News' })).toBeTruthy())
    expect(screen.getByText('What happened')).toBeTruthy()
  })

  // The whole reason a type page costs nothing extra: it is the public listing
  // with one more query parameter, not a new endpoint.
  it('asks the public endpoint for that type only', async () => {
    renderAt('/articles/type/news')

    await waitFor(() =>
      expect(articleService.listPublicArticles).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'news' }),
      ),
    )
  })

  it('handles an address that matches no type', async () => {
    renderAt('/articles/type/nao-existe')

    await waitFor(() => expect(screen.getByText(/type not found/i)).toBeTruthy())
    expect(screen.getByRole('link', { name: /see all articles/i })).toBeTruthy()
  })

  // Showing "not found" before the vocabulary arrives would flash an error on
  // every single visit to a perfectly valid page.
  it('does not claim not-found while the vocabulary is still loading', async () => {
    let release: (types: ArticleType[]) => void = () => {}
    vi.spyOn(articleTypeService, 'listTypes').mockReturnValue(
      new Promise((resolve) => {
        release = resolve
      }),
    )

    renderAt('/articles/type/news')
    expect(screen.queryByText(/type not found/i)).toBeNull()

    release([news])
    await waitFor(() => expect(screen.getByRole('heading', { name: 'News' })).toBeTruthy())
  })

  it('sets the page title from the type', async () => {
    renderAt('/articles/type/news')
    await waitFor(() => expect(document.title).toBe('News - From Abyss Media'))
  })

  it('emits CollectionPage structured data rather than Article', async () => {
    renderAt('/articles/type/news')

    await waitFor(() => {
      const scripts = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      ).map((script) => JSON.parse(script.textContent || '{}'))
      const collection = scripts.find((entry) => entry['@type'] === 'CollectionPage')
      expect(collection).toBeTruthy()
      expect(collection.name).toBe('News')
    })
  })
})
