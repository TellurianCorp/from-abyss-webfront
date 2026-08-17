import type { GrammarMatch } from '../../../services/articleService'

import { plainToDoc, type PlainTextDoc } from './buildPlainText'

/** A LanguageTool match placed in the document. */
export interface SpellMatch {
  /** Stable within one check run, so a decoration can be found again. */
  id: string
  from: number
  to: number
  message: string
  shortMessage: string
  replacements: string[]
}

/**
 * Places LanguageTool's offsets in the document.
 *
 * A match can span more than one text node — `<strong>hello</strong> world` is
 * two — so the start and the end are mapped separately rather than assuming the
 * whole match sits in one run.
 *
 * Anything that cannot be placed is discarded rather than guessed at. A wrong
 * position here does not produce a wrong underline, it produces a suggestion
 * that overwrites the wrong text when applied.
 */
export function mapMatchesToPositions(plain: PlainTextDoc, matches: GrammarMatch[]): SpellMatch[] {
  const mapped: SpellMatch[] = []

  matches.forEach((match, index) => {
    if (match.length <= 0) return

    const from = plainToDoc(plain, match.offset)
    // The last character of the match, not the position after it: an offset one
    // past the end may fall in a separator, which has no document position.
    const lastCharacter = plainToDoc(plain, match.offset + match.length - 1)

    if (from === null || lastCharacter === null) return

    const to = lastCharacter + 1
    if (to <= from) return

    mapped.push({
      id: `${match.offset}:${match.length}:${index}`,
      from,
      to,
      message: match.message,
      shortMessage: match.shortMessage,
      replacements: match.replacements ?? [],
    })
  })

  return mapped
}
