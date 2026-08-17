import { describe, expect, it } from 'vitest'

import { normalizeLegacyHtml } from './normalizeLegacyHtml'

describe('bullet lists', () => {
  /**
   * The most damaging legacy quirk. Quill 2 serialises bullet and ordered lists
   * both as <ol>, telling them apart only by data-list on the items, so without
   * this every bullet list in every published article silently becomes numbered.
   */
  it('converts a Quill bullet list into a real unordered list', () => {
    const quill = '<ol><li data-list="bullet">one</li><li data-list="bullet">two</li></ol>'

    const { html } = normalizeLegacyHtml(quill)

    expect(html).toContain('<ul>')
    expect(html).not.toContain('<ol>')
    expect(html).toContain('one')
    expect(html).toContain('two')
  })

  it('leaves a genuine ordered list alone', () => {
    const quill = '<ol><li data-list="ordered">first</li><li data-list="ordered">second</li></ol>'

    const { html } = normalizeLegacyHtml(quill)

    expect(html).toContain('<ol>')
    expect(html).not.toContain('<ul>')
  })

  it('handles both list kinds in one document', () => {
    const quill =
      '<ol><li data-list="bullet">bullet</li></ol><ol><li data-list="ordered">numbered</li></ol>'

    const { html } = normalizeLegacyHtml(quill)

    expect(html).toContain('<ul>')
    expect(html).toContain('<ol>')
  })

  it('removes the data-list bookkeeping once the type is structural', () => {
    const { html } = normalizeLegacyHtml('<ol><li data-list="bullet">x</li></ol>')

    expect(html).not.toContain('data-list')
  })

  it('does not touch a plain list that never came from Quill', () => {
    const plain = '<ul><li>a</li></ul><ol><li>b</li></ol>'

    const { html, changed } = normalizeLegacyHtml(plain)

    expect(changed).toBe(false)
    expect(html).toBe(plain)
  })
})

describe('alignment classes', () => {
  it('maps Quill alignment onto ours', () => {
    const { html } = normalizeLegacyHtml('<p class="ql-align-center">centred</p>')

    expect(html).toContain('fa-align-center')
    expect(html).not.toContain('ql-align')
  })

  it.each(['left', 'center', 'right', 'justify'])('maps ql-align-%s', (alignment) => {
    const { html } = normalizeLegacyHtml(`<p class="ql-align-${alignment}">x</p>`)

    expect(html).toContain(`fa-align-${alignment}`)
  })

  it('drops Quill classes with no schema support', () => {
    const { html } = normalizeLegacyHtml(
      '<p class="ql-indent-2 ql-size-large ql-font-monospace">x</p>',
    )

    expect(html).not.toContain('ql-')
    expect(html).toContain('x')
  })

  it('removes the class attribute entirely when nothing survives', () => {
    const { html } = normalizeLegacyHtml('<p class="ql-indent-1">x</p>')

    expect(html).not.toContain('class')
  })

  it('keeps classes that are not Quill’s', () => {
    const { html } = normalizeLegacyHtml('<p class="ql-indent-1 fa-align-right">x</p>')

    expect(html).toContain('fa-align-right')
    expect(html).not.toContain('ql-indent')
  })
})

describe('structural cleanups', () => {
  it('removes Quill cursor-affordance spans', () => {
    const { html } = normalizeLegacyHtml('<ol><li><span class="ql-ui"></span>item</li></ol>')

    expect(html).not.toContain('ql-ui')
    expect(html).toContain('item')
  })

  it('lifts a lone image out of its paragraph', () => {
    const { html } = normalizeLegacyHtml('<p><img src="https://cdn.example/a.png"></p>')

    expect(html).not.toContain('<p>')
    expect(html).toContain('<img')
  })

  it('leaves an image that shares its paragraph with text', () => {
    const withText = '<p>caption <img src="https://cdn.example/a.png"></p>'

    const { html } = normalizeLegacyHtml(withText)

    expect(html).toContain('<p>')
    expect(html).toContain('caption')
  })
})

describe('inline images', () => {
  const dataUri = 'data:image/png;base64,iVBORw0KGgo='

  it('counts embedded images without rewriting them', () => {
    const { html, inlineImageCount } = normalizeLegacyHtml(
      `<p>a</p><img src="${dataUri}"><img src="${dataUri}">`,
    )

    expect(inlineImageCount).toBe(2)
    expect(html).toContain('data:image/png')
  })

  it('reports none for clean content', () => {
    const { inlineImageCount } = normalizeLegacyHtml('<img src="https://cdn.example/a.png">')

    expect(inlineImageCount).toBe(0)
  })
})

describe('safety', () => {
  it('handles empty content', () => {
    expect(normalizeLegacyHtml('')).toEqual({ html: '', inlineImageCount: 0, changed: false })
  })

  it('does not wrap the fragment in html or body', () => {
    const { html } = normalizeLegacyHtml('<ol><li data-list="bullet">x</li></ol>')

    expect(html).not.toContain('<body')
    expect(html).not.toContain('<html')
  })

  it('preserves editorial markup it has no business touching', () => {
    const content =
      '<h2>Chapter</h2><p><strong>bold</strong> <em>italic</em></p><blockquote><p>quote</p></blockquote>'

    const { html, changed } = normalizeLegacyHtml(content)

    expect(changed).toBe(false)
    expect(html).toBe(content)
  })
})
