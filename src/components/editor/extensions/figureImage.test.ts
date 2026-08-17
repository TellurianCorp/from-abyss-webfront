import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { buildEditorExtensions } from './index'
import { normalizeLegacyHtml } from '../html/normalizeLegacyHtml'

const extensions = buildEditorExtensions()
const CDN = 'https://cdn.fromabyss.com'

function roundTrip(html: string): string {
  const editor = new Editor({ extensions, content: html })
  try {
    return editor.getHTML()
  } finally {
    editor.destroy()
  }
}

/**
 * The regression this node exists for. Before it, the schema had no way to
 * represent a picture, and ProseMirror deletes what it cannot represent — so
 * opening a legacy article and saving it removed every image, silently.
 */
describe('images are not deleted', () => {
  it('keeps a bare image between paragraphs', () => {
    const result = roundTrip(`<p>antes</p><img src="${CDN}/a.png" alt="capela"><p>depois</p>`)

    expect(result).toContain('<img')
    expect(result).toContain(`${CDN}/a.png`)
    expect(result).toContain('antes')
    expect(result).toContain('depois')
  })

  it('keeps an image that was the only content', () => {
    expect(roundTrip(`<img src="${CDN}/a.png">`)).toContain('<img')
  })

  it('keeps an image wrapped in a paragraph, as Quill wrote them', () => {
    const legacy = normalizeLegacyHtml(`<p><img src="${CDN}/a.png" alt="x"></p>`).html

    expect(roundTrip(legacy)).toContain('<img')
  })

  it('keeps a base64 image, which legacy articles are full of', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgo='

    const result = roundTrip(`<p>a</p><img src="${dataUri}">`)

    expect(result).toContain('data:image/png')
  })

  it('keeps several images in one document', () => {
    const result = roundTrip(
      `<img src="${CDN}/a.png"><p>x</p><img src="${CDN}/b.png"><img src="${CDN}/c.png"`.concat('>'),
    )

    expect(result.match(/<img/g) ?? []).toHaveLength(3)
  })
})

describe('a bare image is promoted to a figure', () => {
  it('wraps it and gives it the default alignment', () => {
    const result = roundTrip(`<img src="${CDN}/a.png" alt="capela">`)

    expect(result).toContain('<figure')
    expect(result).toContain('data-fa-figure')
    expect(result).toContain('fa-align-center')
    expect(result).toContain('alt="capela"')
  })

  it('carries the width over', () => {
    expect(roundTrip(`<img src="${CDN}/a.png" width="800">`)).toContain('width="800"')
  })

  it('ignores a width that is not a positive number', () => {
    const result = roundTrip(`<img src="${CDN}/a.png" width="not-a-number">`)

    expect(result).not.toContain('width=')
  })
})

describe('the figure form round-trips', () => {
  const figure = (align: string, caption = 'Névoa') =>
    `<figure data-fa-figure="" data-align="${align}" class="fa-figure fa-align-${align}">` +
    `<img src="${CDN}/a.png" alt="capela" width="1200" loading="lazy" decoding="async">` +
    `<figcaption class="fa-figcaption">${caption}</figcaption></figure>`

  it.each(['left', 'center', 'right', 'wide', 'full'])('keeps %s alignment', (align) => {
    const result = roundTrip(figure(align))

    expect(result).toContain(`fa-align-${align}`)
    expect(result).toContain(`data-align="${align}"`)
  })

  it('keeps the caption as editable content, not as part of the image', () => {
    const result = roundTrip(figure('center'))

    expect(result).toContain('<figcaption')
    expect(result).toContain('Névoa')
    // The image must not have been swallowed into the caption.
    expect(result).toMatch(/<img[^>]*>\s*<figcaption/)
  })

  it('survives an empty caption', () => {
    const result = roundTrip(
      `<figure data-fa-figure="" class="fa-figure fa-align-center"><img src="${CDN}/a.png"><figcaption class="fa-figcaption"></figcaption></figure>`,
    )

    expect(result).toContain('<img')
    expect(result).toContain('<figcaption')
  })

  it('keeps the library id when there is one', () => {
    const id = '11111111-1111-1111-1111-111111111111'
    const result = roundTrip(
      `<figure data-fa-figure="" data-media-id="${id}" class="fa-figure fa-align-center"><img src="${CDN}/a.png"><figcaption class="fa-figcaption">x</figcaption></figure>`,
    )

    expect(result).toContain(`data-media-id="${id}"`)
  })

  it('omits the library id when there is none', () => {
    expect(roundTrip(`<img src="${CDN}/a.png">`)).not.toContain('data-media-id')
  })

  it('is stable across a second pass', () => {
    const once = roundTrip(figure('wide'))

    expect(roundTrip(once)).toBe(once)
  })

  it('falls back to the default for an unknown alignment', () => {
    const result = roundTrip(
      `<figure data-fa-figure="" data-align="sideways" class="fa-figure"><img src="${CDN}/a.png"><figcaption class="fa-figcaption">x</figcaption></figure>`,
    )

    expect(result).toContain('fa-align-center')
    expect(result).not.toContain('sideways')
  })
})

describe('a figure without an image is not a figure', () => {
  it('is not parsed as one', () => {
    const result = roundTrip(
      '<figure data-fa-figure="" class="fa-figure"><figcaption>orphan caption</figcaption></figure>',
    )

    expect(result).not.toContain('<img')
    expect(result).toContain('orphan caption')
  })
})
