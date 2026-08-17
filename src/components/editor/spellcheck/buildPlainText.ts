import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

/**
 * Flattens a document to the plain text LanguageTool expects, recording where
 * every run of it came from.
 *
 * LanguageTool answers with offsets into a flat string. ProseMirror addresses
 * content by document positions, which count node boundary tokens — an offset
 * and a position are not the same number, and they diverge further with every
 * heading, list item and image in the document. Without the map built here,
 * applying a suggestion writes over the wrong text.
 */

/** One contiguous run of plain text backed by exactly one text node. */
export interface TextSlice {
  /** Document position of the run's first character. */
  from: number
  /** Document position just past its last character. */
  to: number
  /** Index of the run's first character within the flattened text. */
  textStart: number
}

export interface PlainTextDoc {
  text: string
  /** Sorted by textStart, non-overlapping. */
  slices: TextSlice[]
}

/** Separator between blocks, matching what doc.textBetween produces. */
const BLOCK_SEPARATOR = '\n\n'

/** Stand-in for a leaf node, again matching textBetween's leafText. */
const LEAF_TEXT = '\n'

/**
 * Walks the document, accumulating text and slices.
 *
 * The invariant that makes the mapping work: the flattened text is a
 * concatenation of exactly two kinds of run — mapped runs, each backed by one
 * slice, and separator runs, which contain only newlines. Because separators
 * hold nothing but newlines, and LanguageTool never reports a match starting on
 * one, every offset it returns lands inside a mapped run.
 */
export function buildPlainText(doc: ProseMirrorNode): PlainTextDoc {
  let text = ''
  const slices: TextSlice[] = []

  // Held rather than written immediately, so nested containers collapse: a list
  // item inside a list inside a blockquote crosses three block boundaries but
  // still produces one separator, and a block with no text produces none. This
  // is what makes the result equal ProseMirror's own textBetween, which the
  // tests assert directly.
  let separatorPending = false

  doc.descendants((node, pos) => {
    if (node.isText) {
      if (separatorPending) {
        text += BLOCK_SEPARATOR
        separatorPending = false
      }

      const content = node.text ?? ''
      slices.push({ from: pos, to: pos + content.length, textStart: text.length })
      text += content
      return false
    }

    // Leaves and atoms — hard breaks, images, players, embeds — stand in as a
    // newline. It keeps a hard break from joining two words for the grammar
    // checker, and since the run contains only newlines it stays unmapped, which
    // the offset mapping relies on.
    if (node.isAtom || node.isLeaf) {
      if (separatorPending) {
        text += BLOCK_SEPARATOR
        separatorPending = false
      }
      text += LEAF_TEXT
      return false
    }

    if (node.isBlock && text.length > 0) separatorPending = true

    return true
  })

  return { text, slices }
}

/**
 * Translates an offset in the flattened text to a document position.
 *
 * Returns null when the offset lands in a separator or past the end, which can
 * only happen if the document changed under a stale result.
 */
export function plainToDoc(plain: PlainTextDoc, offset: number): number | null {
  const slice = findSlice(plain.slices, offset)
  if (!slice) return null

  return slice.from + (offset - slice.textStart)
}

/** Binary search for the slice containing an offset. */
function findSlice(slices: TextSlice[], offset: number): TextSlice | null {
  let low = 0
  let high = slices.length - 1

  while (low <= high) {
    const mid = (low + high) >> 1
    const slice = slices[mid]
    const length = slice.to - slice.from

    if (offset < slice.textStart) {
      high = mid - 1
    } else if (offset >= slice.textStart + length) {
      low = mid + 1
    } else {
      return slice
    }
  }

  return null
}
