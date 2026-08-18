import { describe, expect, it } from 'vitest'

import { articleTypeDescription, articleTypeLabel, localizedLabel } from './articleTypeLabel'
import type { ArticleType } from '../../services/articleTypeService'

function type(overrides: Partial<ArticleType> = {}): ArticleType {
  return {
    id: 'id-news',
    slug: 'news',
    name: { 'pt-BR': 'Notícia', 'en-GB': 'News' },
    description: { 'pt-BR': 'O que aconteceu', 'en-GB': 'What happened' },
    display_order: 10,
    created_at: '2026-08-18T00:00:00Z',
    updated_at: '2026-08-18T00:00:00Z',
    ...overrides,
  }
}

describe('articleTypeLabel', () => {
  it('uses the requested language', () => {
    expect(articleTypeLabel(type(), 'en-GB')).toBe('News')
    expect(articleTypeLabel(type(), 'pt-BR')).toBe('Notícia')
  })

  it('falls back to pt-BR when the requested language is missing', () => {
    expect(articleTypeLabel(type({ name: { 'pt-BR': 'Notícia' } }), 'en-GB')).toBe('Notícia')
  })

  // A badge that renders empty is worse than one showing a slug: the reader
  // sees a blank chip and no one notices the data is broken.
  it('falls back to the slug rather than rendering nothing', () => {
    expect(articleTypeLabel(type({ name: {} }), 'en-GB')).toBe('news')
    expect(articleTypeLabel(type({ name: { 'en-GB': '   ' } }), 'en-GB')).toBe('news')
  })

  it('treats an unknown language like a missing one', () => {
    expect(articleTypeLabel(type(), 'ja-JP')).toBe('Notícia')
  })

  // The label comes from the server on every render, which is the whole point:
  // renaming a type in the admin screen must change what readers see.
  it('reflects a renamed type without any locale change', () => {
    const renamed = type({ name: { 'pt-BR': 'Crítica de cinema', 'en-GB': 'Film review' } })
    expect(articleTypeLabel(renamed, 'pt-BR')).toBe('Crítica de cinema')
  })

  it('returns an empty description rather than a slug', () => {
    expect(articleTypeDescription(type({ description: {} }), 'en-GB')).toBe('')
    expect(articleTypeDescription(type(), 'en-GB')).toBe('What happened')
  })

  it('survives a type whose labels are absent entirely', () => {
    expect(localizedLabel(undefined, 'en-GB', 'fallback')).toBe('fallback')
  })
})
