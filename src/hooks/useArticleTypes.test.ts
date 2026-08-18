import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { invalidateArticleTypes, useArticleTypes } from './useArticleTypes'
import articleTypeService, { type ArticleType } from '../services/articleTypeService'

function type(slug: string): ArticleType {
  return {
    id: `id-${slug}`,
    slug,
    name: { 'pt-BR': slug, 'en-GB': slug },
    description: {},
    display_order: 0,
    created_at: '2026-08-18T00:00:00Z',
    updated_at: '2026-08-18T00:00:00Z',
  }
}

beforeEach(() => {
  invalidateArticleTypes()
})

afterEach(() => {
  invalidateArticleTypes()
  vi.restoreAllMocks()
})

describe('useArticleTypes', () => {
  it('exposes the vocabulary once it arrives', async () => {
    vi.spyOn(articleTypeService, 'listTypes').mockResolvedValue([type('news')])

    const { result } = renderHook(() => useArticleTypes())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.types.map((t) => t.slug)).toEqual(['news'])
    expect(result.current.error).toBeNull()
  })

  // The badge, the filter, the editor selector and the type page all want this
  // list. Four mounts must not mean four requests.
  it('shares one request across simultaneous consumers', async () => {
    const listTypes = vi.spyOn(articleTypeService, 'listTypes').mockResolvedValue([type('news')])

    const first = renderHook(() => useArticleTypes())
    const second = renderHook(() => useArticleTypes())

    await waitFor(() => expect(first.result.current.loading).toBe(false))
    await waitFor(() => expect(second.result.current.loading).toBe(false))

    expect(listTypes).toHaveBeenCalledTimes(1)
  })

  // A cached rejection would leave the site typeless until someone reloads.
  it('does not cache a failure', async () => {
    const listTypes = vi
      .spyOn(articleTypeService, 'listTypes')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([type('news')])

    const failed = renderHook(() => useArticleTypes())
    await waitFor(() => expect(failed.result.current.error).toBe('offline'))

    const retried = renderHook(() => useArticleTypes())
    await waitFor(() => expect(retried.result.current.types.length).toBe(1))
    expect(listTypes).toHaveBeenCalledTimes(2)
  })

  // The acceptance criterion for the admin screen: a type created there has to
  // appear without a deploy, which means without a page reload either.
  it('picks up a newly created type after refresh', async () => {
    const listTypes = vi
      .spyOn(articleTypeService, 'listTypes')
      .mockResolvedValueOnce([type('news')])
      .mockResolvedValueOnce([type('news'), type('obituary')])

    const { result } = renderHook(() => useArticleTypes())
    await waitFor(() => expect(result.current.types.length).toBe(1))

    await result.current.refresh()

    await waitFor(() => expect(result.current.types.map((t) => t.slug)).toEqual(['news', 'obituary']))
    expect(listTypes).toHaveBeenCalledTimes(2)
  })
})
