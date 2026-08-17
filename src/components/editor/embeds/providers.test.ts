import { describe, expect, it } from 'vitest'

import { embedSrc, isValidEmbedId, parseEmbedUrl } from './providers'

/**
 * Mirrors internal/sanitize/embed_test.go in the API. Anything accepted here
 * that the server rejects gets stripped on save, so the two have to agree.
 */

describe('YouTube', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/live/dQw4w9WgXcQ',
  ])('parses %s', (url) => {
    expect(parseEmbedUrl(url)).toEqual({
      provider: 'youtube',
      id: 'dQw4w9WgXcQ',
      aspect: 'video',
    })
  })

  it('keeps extra query parameters out of the id', () => {
    const result = parseEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42&list=abc')

    expect(result?.id).toBe('dQw4w9WgXcQ')
  })

  it('frames through the privacy-preserving host', () => {
    expect(embedSrc({ provider: 'youtube', id: 'dQw4w9WgXcQ', aspect: 'video' })).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })
})

describe('Vimeo', () => {
  it.each([
    'https://vimeo.com/123456789',
    'https://www.vimeo.com/123456789',
    'https://player.vimeo.com/video/123456789',
  ])('parses %s', (url) => {
    expect(parseEmbedUrl(url)).toEqual({ provider: 'vimeo', id: '123456789', aspect: 'video' })
  })

  it('rejects a non-numeric id', () => {
    expect(parseEmbedUrl('https://vimeo.com/not-a-number')).toBeNull()
  })
})

describe('Spotify', () => {
  it.each([
    ['https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6', 'track/6rqhFgbbKwnb9MLmUQDhG6'],
    ['https://open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6', 'track/6rqhFgbbKwnb9MLmUQDhG6'],
    ['https://open.spotify.com/intl-pt/track/6rqhFgbbKwnb9MLmUQDhG6', 'track/6rqhFgbbKwnb9MLmUQDhG6'],
    ['https://open.spotify.com/episode/6rqhFgbbKwnb9MLmUQDhG6', 'episode/6rqhFgbbKwnb9MLmUQDhG6'],
  ])('parses %s', (url, id) => {
    const result = parseEmbedUrl(url)

    expect(result?.provider).toBe('spotify')
    expect(result?.id).toBe(id)
  })

  it('is an audio embed, not a video one', () => {
    expect(parseEmbedUrl('https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6')?.aspect).toBe(
      'audio',
    )
  })

  it('rejects an unknown kind', () => {
    expect(parseEmbedUrl('https://open.spotify.com/artist/6rqhFgbbKwnb9MLmUQDhG6')).toBeNull()
  })
})

describe('what must be refused', () => {
  it.each([
    ['a lookalike host', 'https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'],
    ['a subdomain trick', 'https://evil.example/youtube.com/watch?v=dQw4w9WgXcQ'],
    ['plain http', 'http://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['scheme-relative', '//www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['javascript', 'javascript:alert(1)'],
    ['a data URI', 'data:text/html;base64,PHNjcmlwdD4='],
    ['an unknown provider', 'https://dailymotion.com/video/x123'],
    ['a YouTube URL with no id', 'https://www.youtube.com/'],
    ['nonsense', 'not a url at all'],
    ['empty', ''],
  ])('refuses %s', (_name, url) => {
    expect(parseEmbedUrl(url)).toBeNull()
  })

  /**
   * The host check is an exact match rather than a suffix test on purpose. A
   * suffix test would accept youtube.com.evil.example, which is the classic way
   * this goes wrong.
   */
  it('never matches a host by suffix', () => {
    expect(parseEmbedUrl('https://notyoutube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(parseEmbedUrl('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ')).toBeNull()
  })
})

describe('id validation matches the server', () => {
  it.each([
    ['youtube', 'dQw4w9WgXcQ', true],
    ['youtube', 'short', false],
    ['youtube', 'way-too-long-an-identifier-here', false],
    ['youtube', 'has spaces', false],
    ['vimeo', '123456789', true],
    ['vimeo', '123', false],
    ['vimeo', 'abcdefghi', false],
    ['spotify', 'track/6rqhFgbbKwnb9MLmUQDhG6', true],
    ['spotify', 'artist/6rqhFgbbKwnb9MLmUQDhG6', false],
    ['spotify', '6rqhFgbbKwnb9MLmUQDhG6', false],
    ['evil', 'anything', false],
  ])('%s / %s', (provider, id, expected) => {
    expect(isValidEmbedId(provider, id)).toBe(expected)
  })

  it('refuses an id from one provider passed off as another', () => {
    expect(isValidEmbedId('vimeo', 'dQw4w9WgXcQ')).toBe(false)
    expect(isValidEmbedId('youtube', 'track/6rqhFgbbKwnb9MLmUQDhG6')).toBe(false)
  })
})
