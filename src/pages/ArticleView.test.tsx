import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ArticleView } from './ArticleView'
import i18n from '../i18n/config'
import articleService, { type Article } from '../services/articleService'
import type { ArticleType } from '../services/articleTypeService'

afterEach(cleanup)

const news: ArticleType = {
  id: 'id-news',
  slug: 'news',
  name: { 'pt-BR': 'Notícia', 'en-GB': 'News' },
  description: {},
  display_order: 10,
  created_at: '2026-08-18T00:00:00Z',
  updated_at: '2026-08-18T00:00:00Z',
}

function article(overrides: Partial<Article> = {}): Article {
  return {
    id: 'article-1',
    slug: 'capela-na-nevoa',
    author_id: 1,
    status: 'published',
    published_at: '2026-08-10T12:00:00Z',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-11T00:00:00Z',
    translations: {
      'en-GB': {
        id: 't1',
        article_id: 'article-1',
        language_code: 'en-GB',
        title: 'Chapel in the mist',
        excerpt: 'A short summary',
        content: '<p>body</p>',
        meta_title: 'Chapel in the mist, revisited',
        meta_description: 'What the chapel meant',
        meta_keywords: ['horror', 'folk'],
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-11T00:00:00Z',
      },
    },
    ...overrides,
  }
}

function head(selector: string): string | null {
  return document.querySelector(selector)?.getAttribute('content') ?? null
}

function structuredData(type: string): Record<string, unknown> | undefined {
  return Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .map((script) => JSON.parse(script.textContent || '{}'))
    .find((entry) => entry['@type'] === type)
}

beforeEach(async () => {
  await i18n.changeLanguage('en-GB')
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove())
})

afterEach(() => {
  vi.restoreAllMocks()
})

function renderArticle() {
  return render(
    <MemoryRouter initialEntries={['/articles/capela-na-nevoa']}>
      <Routes>
        <Route path="/articles/:slug" element={<ArticleView />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ArticleView SEO', () => {
  // This page emitted no SEO at all before: every published article served the
  // site's default title and description, even though the editor had been
  // collecting meta_title and meta_description all along.
  it('uses the article meta title rather than the site default', async () => {
    vi.spyOn(articleService, 'getPublicArticle').mockResolvedValue(article())
    renderArticle()

    await waitFor(() => expect(document.title).toBe('Chapel in the mist, revisited - From Abyss Media'))
    expect(head('meta[name="description"]')).toBe('What the chapel meant')
    expect(head('meta[name="keywords"]')).toBe('horror, folk')
  })

  it('falls back to the title and excerpt when no meta was written', async () => {
    const translation = article().translations!['en-GB']
    vi.spyOn(articleService, 'getPublicArticle').mockResolvedValue(
      article({
        translations: {
          'en-GB': { ...translation, meta_title: undefined, meta_description: undefined },
        },
      }),
    )
    renderArticle()

    await waitFor(() => expect(document.title).toBe('Chapel in the mist - From Abyss Media'))
    expect(head('meta[name="description"]')).toBe('A short summary')
  })

  it('points og:image at the image the editor chose', async () => {
    vi.spyOn(articleService, 'getPublicArticle').mockResolvedValue(
      article({ og_image_url: 'https://cdn.fromabyss.com/media/1/capa.png' }),
    )
    renderArticle()

    await waitFor(() =>
      expect(head('meta[property="og:image"]')).toBe('https://cdn.fromabyss.com/media/1/capa.png'),
    )
  })

  // articleSection is schema.org's field for the section of a publication a
  // piece belongs to, which is exactly what an editorial type is. It is where
  // the classification pays for itself beyond the badge.
  it('publishes the type as articleSection', async () => {
    vi.spyOn(articleService, 'getPublicArticle').mockResolvedValue(article({ type: news }))
    renderArticle()

    await waitFor(() => expect(structuredData('Article')?.articleSection).toBe('News'))
  })

  it('omits articleSection for an untyped article rather than inventing one', async () => {
    vi.spyOn(articleService, 'getPublicArticle').mockResolvedValue(article())
    renderArticle()

    await waitFor(() => expect(structuredData('Article')?.headline).toBe('Chapel in the mist'))
    expect(structuredData('Article')?.articleSection).toBeUndefined()
  })

  it('shows the type badge in the header', async () => {
    vi.spyOn(articleService, 'getPublicArticle').mockResolvedValue(article({ type: news }))
    renderArticle()

    await waitFor(() => expect(screen.getByRole('link', { name: 'News' })).toBeTruthy())
  })
})
