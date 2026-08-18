import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ArticleTypeFilter } from './ArticleTypeFilter'
import i18n from '../../i18n/config'
import articleTypeService, { type ArticleType } from '../../services/articleTypeService'
import { invalidateArticleTypes } from '../../hooks/useArticleTypes'

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

function CurrentPath() {
  const location = useLocation()
  return <span data-testid="path">{location.pathname}</span>
}

beforeEach(async () => {
  invalidateArticleTypes()
  await i18n.changeLanguage('en-GB')
  vi.spyOn(articleTypeService, 'listTypes').mockResolvedValue([news])
})

afterEach(() => {
  invalidateArticleTypes()
  vi.restoreAllMocks()
})

function renderFilter(value?: string, at = '/articles') {
  return render(
    <MemoryRouter initialEntries={[at]}>
      <ArticleTypeFilter value={value} />
      <Routes>
        <Route path="*" element={<CurrentPath />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function choose(slug: string) {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: slug } })
  })
}

describe('ArticleTypeFilter', () => {
  // Filtering navigates instead of holding state of its own, so the URL is the
  // one source of truth and a filtered view is shareable.
  it('navigates to the type page when a type is picked', async () => {
    renderFilter()
    await waitFor(() => expect(screen.getByRole('option', { name: 'News' })).toBeTruthy())

    await choose('news')

    expect(screen.getByTestId('path').textContent).toBe('/articles/type/news')
  })

  it('goes back to all articles when the filter is cleared', async () => {
    renderFilter('news', '/articles/type/news')
    await waitFor(() => expect(screen.getByRole('option', { name: 'News' })).toBeTruthy())

    await choose('')

    expect(screen.getByTestId('path').textContent).toBe('/articles')
  })

  it('reflects the type from the route rather than its own memory', async () => {
    renderFilter('news', '/articles/type/news')

    await waitFor(() =>
      expect((screen.getByLabelText(/type/i) as HTMLSelectElement).value).toBe('news'),
    )
  })

  // An empty vocabulary would otherwise render a select whose only option is
  // "All types", which is a control that does nothing.
  it('stays out of the way when there are no types', async () => {
    vi.spyOn(articleTypeService, 'listTypes').mockResolvedValue([])
    const { container } = renderFilter()

    await waitFor(() => expect(container.querySelector('select')).toBeNull())
  })
})
