import type { Editor } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

import articleService from '../../../services/articleService'

import { buildPlainText } from './buildPlainText'
import { mapMatchesToPositions, type SpellMatch } from './mapMatches'

export interface UseSpellcheckResult {
  matches: SpellMatch[]
  isChecking: boolean
  error: string | null
  /** True when the text has not changed since the last run. */
  isUpToDate: boolean
  run: () => Promise<void>
  apply: (id: string, replacement: string) => void
  dismiss: (id: string) => void
  clear: () => void
}

/**
 * The backend proxies the public LanguageTool endpoint, which has no API key and
 * is rate-limited by IP. Checking is therefore deliberate rather than
 * continuous, and a repeat run on unchanged text is skipped entirely.
 */
export function useSpellcheck(
  editor: Editor | null,
  language: 'pt-BR' | 'en-GB',
): UseSpellcheckResult {
  const [matches, setMatches] = useState<SpellMatch[]>([])
  const [isChecking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkedText, setCheckedText] = useState<string | null>(null)

  // Read at call time rather than tracked in state: it changes on every
  // keystroke and nothing renders from it.
  const currentTextRef = useRef<string>('')

  const run = useCallback(async () => {
    if (!editor) return

    const plain = buildPlainText(editor.state.doc)
    currentTextRef.current = plain.text

    if (!plain.text.trim()) {
      setMatches([])
      editor.commands.clearSpellMatches()
      setCheckedText(plain.text)
      return
    }

    if (plain.text === checkedText) return

    setChecking(true)
    setError(null)

    try {
      const response = await articleService.checkGrammar(plain.text, language)

      // Rebuilt from the document as it is now, not as it was when the request
      // went out: the writer may have kept typing while it was in flight.
      const current = buildPlainText(editor.state.doc)
      const placed = mapMatchesToPositions(
        current.text === plain.text ? plain : current,
        response.matches ?? [],
      )

      setMatches(placed)
      setCheckedText(plain.text)
      editor.commands.setSpellMatches(placed)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setChecking(false)
    }
  }, [editor, language, checkedText])

  const apply = useCallback(
    (id: string, replacement: string) => {
      if (!editor) return
      editor.chain().focus().applySpellReplacement(id, replacement).run()
      setMatches((current) => current.filter((match) => match.id !== id))
      // The text has changed, so the previous run no longer describes it.
      setCheckedText(null)
    },
    [editor],
  )

  const dismiss = useCallback(
    (id: string) => {
      editor?.commands.dismissSpellMatch(id)
      setMatches((current) => current.filter((match) => match.id !== id))
    },
    [editor],
  )

  const clear = useCallback(() => {
    editor?.commands.clearSpellMatches()
    setMatches([])
    setCheckedText(null)
  }, [editor])

  const isUpToDate =
    checkedText !== null && editor !== null && buildPlainText(editor.state.doc).text === checkedText

  return { matches, isChecking, error, isUpToDate, run, apply, dismiss, clear }
}
