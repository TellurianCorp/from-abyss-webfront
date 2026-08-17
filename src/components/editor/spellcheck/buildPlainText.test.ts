import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { buildEditorExtensions } from '../extensions'
import { buildPlainText, plainToDoc } from './buildPlainText'
import { mapMatchesToPositions } from './mapMatches'

const extensions = buildEditorExtensions()
const CDN = 'https://cdn.fromabyss.com'

function docFor(html: string) {
  const editor = new Editor({ extensions, content: html })
  const { doc } = editor.state
  editor.destroy()
  return doc
}

/**
 * The cheapest correctness check available: doc.textBetween with the same
 * separator and leaf text is ProseMirror's own flattening, so if these ever
 * disagree the walker is wrong. Everything else here rests on this.
 *
 * Leaves stand in as a newline rather than nothing, so a hard break does not
 * join two words for the grammar checker.
 */
describe('the flattened text matches ProseMirror’s own', () => {
  it.each([
    ['single paragraph', '<p>A chapel in the fog.</p>'],
    ['two paragraphs', '<p>First.</p><p>Second.</p>'],
    ['heading and prose', '<h2>Chapter</h2><p>Body text.</p>'],
    ['marks split the text', '<p>plain <strong>bold</strong> plain</p>'],
    ['nested list', '<ul><li><p>one</p></li><li><p>two</p></li></ul>'],
    ['blockquote', '<blockquote><p>quoted</p></blockquote><p>after</p>'],
    ['hard break', '<p>a<br>b</p>'],
    ['everything', '<h2>T</h2><p>a <em>b</em> c</p><ul><li><p>x</p></li></ul><p>end</p>'],
  ])('%s', (_name, html) => {
    const doc = docFor(html)

    expect(buildPlainText(doc).text).toBe(doc.textBetween(0, doc.content.size, '\n\n', '\n'))
  })
})

describe('atoms contribute no text', () => {
  it('skips an image and its caption', () => {
    const doc = docFor(
      `<p>before</p><figure data-fa-figure="" class="fa-figure"><img src="${CDN}/a.png"><figcaption class="fa-figcaption">caption</figcaption></figure><p>after</p>`,
    )

    const { text } = buildPlainText(doc)

    expect(text).toContain('before')
    expect(text).toContain('after')
  })

  it('skips an embed entirely', () => {
    const doc = docFor(
      '<p>before</p><div class="fa-embed" data-embed-provider="youtube" data-embed-id="dQw4w9WgXcQ"></div><p>after</p>',
    )

    const { text } = buildPlainText(doc)

    expect(text).not.toContain('youtube')
    expect(text).not.toContain('dQw4w9WgXcQ')
  })
})

describe('offsets map back to the right characters', () => {
  /**
   * The property that matters: reading the document at the mapped position must
   * give back the very text the offset pointed at. Anything less and an applied
   * suggestion overwrites the wrong words.
   */
  function expectRoundTrip(html: string, needle: string) {
    const doc = docFor(html)
    const plain = buildPlainText(doc)
    const offset = plain.text.indexOf(needle)

    expect(offset, `"${needle}" should appear in the flattened text`).toBeGreaterThanOrEqual(0)

    const from = plainToDoc(plain, offset)
    const lastChar = plainToDoc(plain, offset + needle.length - 1)

    expect(from).not.toBeNull()
    expect(lastChar).not.toBeNull()
    expect(doc.textBetween(from as number, (lastChar as number) + 1)).toBe(needle)
  }

  it('in a single paragraph', () => {
    expectRoundTrip('<p>A chapel in the fog.</p>', 'chapel')
  })

  it('in the second paragraph, past a separator', () => {
    expectRoundTrip('<p>First one.</p><p>Second one.</p>', 'Second')
  })

  it('in the third block, where separators have accumulated', () => {
    expectRoundTrip('<h2>Title</h2><p>First.</p><p>Third block here.</p>', 'Third')
  })

  it('inside a list item', () => {
    expectRoundTrip('<p>intro</p><ul><li><p>needle here</p></li></ul>', 'needle')
  })

  it('after an image, whose figure contributes nothing', () => {
    expectRoundTrip(
      `<p>before</p><figure data-fa-figure="" class="fa-figure"><img src="${CDN}/a.png"><figcaption class="fa-figcaption"></figcaption></figure><p>target word</p>`,
      'target',
    )
  })

  it('when marks split the run', () => {
    expectRoundTrip('<p>plain <strong>bold</strong> tail</p>', 'tail')
  })

  it('across a mark boundary', () => {
    // "hello world" spans a <strong> and the text after it.
    expectRoundTrip('<p><strong>hello</strong> world</p>', 'hello world')
  })
})

describe('mapping is refused rather than guessed', () => {
  it('returns null past the end of the text', () => {
    const plain = buildPlainText(docFor('<p>short</p>'))

    expect(plainToDoc(plain, 9999)).toBeNull()
  })

  it('returns null inside a block separator', () => {
    const plain = buildPlainText(docFor('<p>a</p><p>b</p>'))
    const separatorOffset = plain.text.indexOf('\n')

    expect(separatorOffset).toBeGreaterThan(0)
    expect(plainToDoc(plain, separatorOffset)).toBeNull()
  })

  it('drops a match that cannot be placed', () => {
    const plain = buildPlainText(docFor('<p>short</p>'))

    const mapped = mapMatchesToPositions(plain, [
      { offset: 9999, length: 4, message: 'x', shortMessage: 'x', replacements: [], context: '' },
    ])

    expect(mapped).toHaveLength(0)
  })

  it('drops a zero-length match', () => {
    const plain = buildPlainText(docFor('<p>short</p>'))

    const mapped = mapMatchesToPositions(plain, [
      { offset: 0, length: 0, message: 'x', shortMessage: 'x', replacements: [], context: '' },
    ])

    expect(mapped).toHaveLength(0)
  })
})

describe('mapped matches cover exactly the reported text', () => {
  it('places a match on the word LanguageTool meant', () => {
    const doc = docFor('<h2>Chapter</h2><p>The fog was thikc that night.</p>')
    const plain = buildPlainText(doc)
    const offset = plain.text.indexOf('thikc')

    const [match] = mapMatchesToPositions(plain, [
      {
        offset,
        length: 'thikc'.length,
        message: 'Possible spelling mistake',
        shortMessage: 'Spelling',
        replacements: ['thick'],
        context: '',
      },
    ])

    expect(match).toBeDefined()
    expect(doc.textBetween(match.from, match.to)).toBe('thikc')
  })

  it('places a match that spans a mark boundary', () => {
    const doc = docFor('<p><strong>hello</strong> world</p>')
    const plain = buildPlainText(doc)
    const offset = plain.text.indexOf('hello world')

    const [match] = mapMatchesToPositions(plain, [
      { offset, length: 'hello world'.length, message: 'x', shortMessage: 'x', replacements: [], context: '' },
    ])

    expect(doc.textBetween(match.from, match.to)).toBe('hello world')
  })

  it('handles surrogate pairs, since both sides count UTF-16 units', () => {
    const doc = docFor('<p>fog 🕯 candle</p>')
    const plain = buildPlainText(doc)
    const offset = plain.text.indexOf('candle')

    const [match] = mapMatchesToPositions(plain, [
      { offset, length: 'candle'.length, message: 'x', shortMessage: 'x', replacements: [], context: '' },
    ])

    expect(doc.textBetween(match.from, match.to)).toBe('candle')
  })
})
