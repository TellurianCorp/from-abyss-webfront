import { describe, expect, it } from 'vitest'

import { sanitizeArticleHtml } from './sanitizeArticleHtml'

/**
 * These mirror internal/sanitize/policy_test.go in the API.
 *
 * The two allowlists have to agree: where the server strips something this
 * keeps, the page renders differently from the editor; where this strips
 * something the server keeps, the client's safety is illusory. Keeping the cases
 * recognisably the same on both sides is what makes a divergence visible.
 */

const CDN = 'https://cdn.fromabyss.com'

describe('injection', () => {
  it.each([
    ['script tag', '<p>a</p><script>alert(1)</script>', 'alert'],
    ['img onerror', '<img src="x" onerror="alert(1)">', 'onerror'],
    ['div onload', '<div onload="alert(1)">x</div>', 'onload'],
    ['onmouseover', '<p onmouseover="alert(1)">x</p>', 'onmouseover'],
    ['javascript href', '<a href="javascript:alert(1)">x</a>', 'javascript:'],
    ['data html href', '<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>', 'data:text/html'],
    ['svg foreignObject', '<svg><foreignObject><script>alert(1)</script></foreignObject></svg>', 'script'],
    ['object', '<object data="evil.swf"></object>', '<object'],
    ['embed', '<embed src="evil.swf">', '<embed'],
    ['form', '<form action="https://evil.example"><input name="p"></form>', '<form'],
    ['iframe', '<iframe src="https://evil.example"></iframe>', '<iframe'],
  ])('strips %s', (_name, input, forbidden) => {
    expect(sanitizeArticleHtml(input).toLowerCase()).not.toContain(forbidden.toLowerCase())
  })

  it('strips an iframe even for an allowlisted provider', () => {
    const result = sanitizeArticleHtml(
      '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>',
    )

    expect(result).not.toContain('<iframe')
  })
})

describe('the style-versus-class contract', () => {
  it('drops the style attribute', () => {
    const result = sanitizeArticleHtml('<p style="text-align: center">centred</p>')

    expect(result).not.toContain('style')
    expect(result).toContain('centred')
  })

  it.each(['fa-align-left', 'fa-align-center', 'fa-align-right', 'fa-align-justify'])(
    'keeps %s',
    (className) => {
      expect(sanitizeArticleHtml(`<p class="${className}">x</p>`)).toContain(className)
    },
  )

  it('drops classes that are not ours', () => {
    const result = sanitizeArticleHtml('<div class="position-fixed vh-100">overlay</div>')

    expect(result).not.toContain('position-fixed')
    expect(result).toContain('overlay')
  })

  it('keeps ours and drops foreign ones from the same list', () => {
    const result = sanitizeArticleHtml('<p class="fa-align-center position-fixed">x</p>')

    expect(result).toContain('fa-align-center')
    expect(result).not.toContain('position-fixed')
  })

  it('keeps a code block language hint', () => {
    expect(sanitizeArticleHtml('<pre><code class="language-go">x</code></pre>')).toContain(
      'language-go',
    )
  })
})

describe('editorial markup survives', () => {
  it('keeps a figure whole', () => {
    const input = `<figure class="fa-figure fa-align-wide"><img src="${CDN}/media/1/a.png" alt="chapel" width="1200"><figcaption>Fog</figcaption></figure>`

    const result = sanitizeArticleHtml(input)

    expect(result).toContain(`${CDN}/media/1/a.png`)
    expect(result).toContain('alt="chapel"')
    expect(result).toContain('<figcaption')
    expect(result).toContain('fa-figure')
  })

  it('keeps the block vocabulary', () => {
    const input =
      '<h2>Chapter</h2><h3>Scene</h3><p><strong>b</strong><em>i</em><u>u</u><s>s</s><code>c</code></p>' +
      '<ul><li>one</li></ul><ol><li>first</li></ol><blockquote><p>quoted</p></blockquote><pre><code>x</code></pre><hr>'

    const result = sanitizeArticleHtml(input)

    for (const tag of ['<h2', '<h3', '<strong', '<em', '<u', '<s', '<code', '<ul', '<ol', '<li', '<blockquote', '<pre', '<hr']) {
      expect(result).toContain(tag)
    }
  })

  it('keeps CDN audio and video', () => {
    const input =
      `<figure class="fa-audio"><audio controls src="${CDN}/a.mp3"></audio></figure>` +
      `<figure class="fa-video"><video controls playsinline src="${CDN}/v.mp4"></video></figure>`

    const result = sanitizeArticleHtml(input)

    expect(result).toContain('<audio')
    expect(result).toContain('<video')
  })
})

describe('embeds', () => {
  it.each(['youtube', 'vimeo', 'spotify'])('keeps a %s marker', (provider) => {
    const input = `<div class="fa-embed" data-embed-provider="${provider}" data-embed-id="abc123"></div>`

    const result = sanitizeArticleHtml(input)

    expect(result).toContain(`data-embed-provider="${provider}"`)
    expect(result).toContain('data-embed-id="abc123"')
  })

  it('drops an unknown provider', () => {
    const result = sanitizeArticleHtml(
      '<div class="fa-embed" data-embed-provider="evil" data-embed-id="abc"></div>',
    )

    expect(result).not.toContain('evil')
    expect(result).not.toContain('data-embed-id')
  })

  it('drops a malformed id', () => {
    const result = sanitizeArticleHtml(
      '<div class="fa-embed" data-embed-provider="youtube" data-embed-id="a b c<>"></div>',
    )

    expect(result).not.toContain('data-embed-id')
  })

  it('drops other data attributes entirely', () => {
    const result = sanitizeArticleHtml('<div data-tracking-id="abc">x</div>')

    expect(result).not.toContain('data-tracking-id')
  })
})

describe('links', () => {
  it('hardens outbound links', () => {
    const result = sanitizeArticleHtml('<a href="https://example.com/x">read</a>')

    expect(result).toContain('https://example.com/x')
    expect(result).toContain('noopener')
    expect(result).toContain('noreferrer')
  })

  it('keeps mailto links', () => {
    expect(sanitizeArticleHtml('<a href="mailto:a@b.c">mail</a>')).toContain('mailto:a@b.c')
  })
})

describe('media hardening', () => {
  it('removes autoplay', () => {
    const result = sanitizeArticleHtml(`<video autoplay controls src="${CDN}/v.mp4"></video>`)

    expect(result).not.toContain('autoplay')
  })

  it('forces metadata preloading', () => {
    const result = sanitizeArticleHtml(`<audio preload="auto" controls src="${CDN}/a.mp3"></audio>`)

    expect(result).toContain('preload="metadata"')
  })
})

describe('legacy inline images', () => {
  const dataUri = 'data:image/png;base64,iVBORw0KGgo='

  /**
   * Articles written in the old editor embedded pictures as data URIs. They stay
   * valid until the extraction migration has run everywhere; stripping them
   * early would blank out published articles.
   */
  it('keeps them by default', () => {
    expect(sanitizeArticleHtml(`<img src="${dataUri}">`)).toContain('data:image/png')
  })

  it('drops them when asked', () => {
    const result = sanitizeArticleHtml(`<img src="${dataUri}">`, { allowInlineImages: false })

    expect(result).not.toContain('data:image')
  })

  it('never allows a non-image data URI', () => {
    const result = sanitizeArticleHtml('<img src="data:text/html;base64,PHNjcmlwdD4=">')

    expect(result).not.toContain('data:text/html')
  })
})

describe('idempotence', () => {
  it.each([
    '<p class="fa-align-center">centred</p>',
    `<figure class="fa-figure"><img src="${CDN}/a.png" alt="x"><figcaption>cap</figcaption></figure>`,
    '<div class="fa-embed" data-embed-provider="youtube" data-embed-id="dQw4w9WgXcQ"></div>',
    '<a href="https://example.com">link</a>',
    '<ul><li>one</li></ul>',
    '<p>a<br>b</p><hr>',
  ])('%s', (input) => {
    const once = sanitizeArticleHtml(input)

    expect(sanitizeArticleHtml(once)).toBe(once)
  })
})

describe('empty input', () => {
  it('returns an empty string', () => {
    expect(sanitizeArticleHtml('')).toBe('')
  })
})
