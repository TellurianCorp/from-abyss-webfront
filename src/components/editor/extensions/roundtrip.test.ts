import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { buildEditorExtensions } from './index'
import { normalizeLegacyHtml } from '../html/normalizeLegacyHtml'

/**
 * The round trip is the contract that stops the editor eating people's articles.
 *
 * Every save runs content through the schema and back out as HTML. Anything the
 * schema cannot represent is dropped silently — no error, no warning, just a
 * shorter article. These tests pin what must survive.
 */

const extensions = buildEditorExtensions()

/**
 * html -> document -> html, which is exactly what opening and saving does.
 *
 * Driven through a real headless Editor rather than the generateHTML helpers,
 * so the test exercises the same parse and serialise path the application uses.
 */
function roundTrip(html: string): string {
  const editor = new Editor({ extensions, content: html })
  try {
    return editor.getHTML()
  } finally {
    editor.destroy()
  }
}

function expectStable(html: string): void {
  const once = roundTrip(html)
  const twice = roundTrip(once)

  expect(twice).toBe(once)
}

describe('editorial markup survives', () => {
  it.each([
    ['paragraph', '<p>A chapel in the fog.</p>'],
    ['heading 2', '<h2>Chapter</h2>'],
    ['heading 3', '<h3>Scene</h3>'],
    ['heading 4', '<h4>Beat</h4>'],
    ['bold', '<p><strong>bold</strong></p>'],
    ['italic', '<p><em>italic</em></p>'],
    ['underline', '<p><u>underlined</u></p>'],
    ['strike', '<p><s>struck</s></p>'],
    ['inline code', '<p><code>code</code></p>'],
    ['bullet list', '<ul><li><p>one</p></li><li><p>two</p></li></ul>'],
    ['ordered list', '<ol><li><p>first</p></li></ol>'],
    ['blockquote', '<blockquote><p>quoted</p></blockquote>'],
    ['horizontal rule', '<hr>'],
    ['hard break', '<p>a<br>b</p>'],
  ])('%s', (_name, html) => {
    const result = roundTrip(html)

    expect(result).not.toBe('')
    expectStable(html)
  })

  it('keeps the text of every block', () => {
    const html =
      '<h2>Chapter</h2><p>Body text.</p><ul><li><p>one</p></li></ul><blockquote><p>quoted</p></blockquote>'

    const result = roundTrip(html)

    for (const text of ['Chapter', 'Body text.', 'one', 'quoted']) {
      expect(result).toContain(text)
    }
  })

  it('keeps links with their href', () => {
    const result = roundTrip('<p><a href="https://example.com/x">read</a></p>')

    expect(result).toContain('href="https://example.com/x"')
    expect(result).toContain('read')
  })

  it('keeps a code block with its language hint', () => {
    const result = roundTrip('<pre><code class="language-go">x := 1</code></pre>')

    expect(result).toContain('<pre>')
    expect(result).toContain('x := 1')
  })
})

describe('alignment round-trips as a class', () => {
  /**
   * The cross-repo contract. The API's policy forbids the style attribute, so an
   * alignment emitted as inline style is discarded on save and the author's
   * choice vanishes with no error.
   */
  it.each(['center', 'right', 'justify'])('%s survives as fa-align-*', (alignment) => {
    const result = roundTrip(`<p class="fa-align-${alignment}">x</p>`)

    expect(result).toContain(`fa-align-${alignment}`)
    expect(result).not.toContain('style=')
  })

  it('never emits inline style, even when given one', () => {
    const result = roundTrip('<p style="text-align: center">x</p>')

    expect(result).not.toContain('style=')
    expect(result).toContain('fa-align-center')
  })

  it('does not write a class for the default alignment', () => {
    const result = roundTrip('<p class="fa-align-left">x</p>')

    expect(result).not.toContain('fa-align-left')
    expect(result).toContain('x')
  })

  it('aligns headings too', () => {
    const result = roundTrip('<h2 class="fa-align-center">Centred chapter</h2>')

    expect(result).toContain('fa-align-center')
  })
})

describe('legacy Quill content survives the full path', () => {
  /**
   * Normalisation and the schema have to work together: this is exactly what
   * happens when an author opens an article written in the old editor.
   */
  function openLegacy(html: string): string {
    return roundTrip(normalizeLegacyHtml(html).html)
  }

  it('keeps a bullet list a bullet list', () => {
    const result = openLegacy(
      '<ol><li data-list="bullet">one</li><li data-list="bullet">two</li></ol>',
    )

    expect(result).toContain('<ul>')
    expect(result).not.toContain('<ol>')
  })

  it('keeps a numbered list numbered', () => {
    const result = openLegacy('<ol><li data-list="ordered">first</li></ol>')

    expect(result).toContain('<ol>')
    expect(result).not.toContain('<ul>')
  })

  it('carries Quill alignment through to ours', () => {
    const result = openLegacy('<p class="ql-align-center">centred</p>')

    expect(result).toContain('fa-align-center')
  })

  it('preserves a realistic legacy article', () => {
    const legacy =
      '<h2>O Farol</h2>' +
      '<p class="ql-align-center">Uma capela na névoa.</p>' +
      '<ol><li data-list="bullet"><span class="ql-ui"></span>primeiro</li>' +
      '<li data-list="bullet"><span class="ql-ui"></span>segundo</li></ol>' +
      '<blockquote>Ninguém volta.</blockquote>' +
      '<p><strong>Fim</strong></p>'

    const result = openLegacy(legacy)

    expect(result).toContain('O Farol')
    expect(result).toContain('fa-align-center')
    expect(result).toContain('Uma capela na névoa.')
    expect(result).toContain('<ul>')
    expect(result).toContain('primeiro')
    expect(result).toContain('segundo')
    expect(result).toContain('Ninguém volta.')
    expect(result).toContain('<strong>Fim</strong>')
    expect(result).not.toContain('ql-')
  })
})

describe('idempotence', () => {
  /**
   * A second pass must not change the output again. If it did, every save would
   * come back different from what was sent and the editor would sit permanently
   * dirty, prompting to save content nobody edited.
   */
  it.each([
    '<h2>Chapter</h2><p>Body.</p>',
    '<p class="fa-align-center">centred</p>',
    '<ul><li><p>one</p></li><li><p>two</p></li></ul>',
    '<blockquote><p>quoted</p></blockquote>',
    '<p><a href="https://example.com">link</a></p>',
    '<p>a<br>b</p><hr>',
    '<pre><code>x := 1</code></pre>',
  ])('%s', (html) => {
    expectStable(html)
  })
})

describe('h1 is not part of the body schema', () => {
  /**
   * The article title is the page's h1. A second one breaks the document
   * outline, and the API's policy strips it anyway, so the schema should not
   * offer it in the first place.
   */
  it('demotes an h1 rather than losing its text', () => {
    const result = roundTrip('<h1>second title</h1><p>body</p>')

    expect(result).not.toContain('<h1')
    expect(result).toContain('second title')
    expect(result).toContain('body')
  })
})
