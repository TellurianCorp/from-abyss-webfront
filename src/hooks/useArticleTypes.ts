import { useCallback, useEffect, useState } from 'react'

import articleTypeService, { type ArticleType } from '../services/articleTypeService'

/**
 * The vocabulary is small, changes rarely, and is needed by the badge, the
 * filter, the editor's selector and the per-type pages at once. Caching the
 * promise -- not the result -- means several components mounting in the same
 * frame share a single request rather than racing four identical ones.
 */
let pending: Promise<ArticleType[]> | null = null

function load(): Promise<ArticleType[]> {
  if (!pending) {
    pending = articleTypeService.listTypes().catch((error: unknown) => {
      // A failure must not be cached: the next component to mount, or the next
      // refresh, has to be able to try again. Caching a rejection would leave
      // the whole site typeless until a reload.
      pending = null
      throw error
    })
  }
  return pending
}

/** Drops the cache so the next read hits the network. Call after admin edits. */
export function invalidateArticleTypes(): void {
  pending = null
}

export interface UseArticleTypesResult {
  types: ArticleType[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useArticleTypes(): UseArticleTypesResult {
  const [types, setTypes] = useState<ArticleType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const read = useCallback(async (active: () => boolean) => {
    setLoading(true)
    try {
      const loaded = await load()
      if (active()) {
        setTypes(loaded)
        setError(null)
      }
    } catch (err) {
      if (active()) {
        setTypes([])
        setError(err instanceof Error ? err.message : 'Could not load article types')
      }
    } finally {
      if (active()) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    void read(() => mounted)
    return () => {
      mounted = false
    }
  }, [read])

  const refresh = useCallback(async () => {
    invalidateArticleTypes()
    await read(() => true)
  }, [read])

  return { types, loading, error, refresh }
}
