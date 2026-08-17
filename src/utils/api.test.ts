import { describe, expect, it } from 'vitest'

import { apiUrl } from './api'

/**
 * These are the first tests in the repository, so they double as proof the
 * harness runs. They are deliberately real tests rather than a smoke assertion:
 * apiUrl is called on every request the app makes, and its whole job is joining
 * a base and a path without producing a double slash or losing one.
 *
 * Note API_BASE_URL is resolved once at module load from import.meta.env, so
 * these cover the development case (empty base, relative paths through the Vite
 * proxy), which is what the test environment provides.
 */
describe('apiUrl', () => {
  it('keeps a leading slash on relative paths', () => {
    expect(apiUrl('/v1/articles')).toBe('/v1/articles')
  })

  it('adds the leading slash when the caller omits it', () => {
    expect(apiUrl('v1/articles')).toBe('/v1/articles')
  })

  it('does not double the slash', () => {
    expect(apiUrl('/v1/media')).not.toContain('//')
  })

  it('preserves query strings', () => {
    expect(apiUrl('/v1/media?media_type=image&limit=24')).toBe('/v1/media?media_type=image&limit=24')
  })

  it('preserves path segments that contain an id', () => {
    const id = '11111111-1111-1111-1111-111111111111'
    expect(apiUrl(`/v1/media/${id}`)).toBe(`/v1/media/${id}`)
  })
})

describe('test environment', () => {
  it('provides a DOM, which DOMPurify and ProseMirror both require', () => {
    const el = document.createElement('div')
    el.innerHTML = '<p>fog</p>'

    expect(el.querySelector('p')?.textContent).toBe('fog')
  })
})
