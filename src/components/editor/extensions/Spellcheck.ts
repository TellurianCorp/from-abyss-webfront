import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import type { SpellMatch } from '../spellcheck/mapMatches'

/**
 * Renders grammar matches as decorations rather than marks.
 *
 * Decorations live outside the document, which is what makes this correct while
 * someone is typing: ProseMirror maps them through every transaction, so a
 * result stays attached to its text as the surrounding prose changes, and a
 * match whose text was deleted disappears on its own. Nothing about a check run
 * is ever persisted.
 */

export const spellcheckPluginKey = new PluginKey<SpellcheckState>('faSpellcheck')

interface SpellcheckState {
  decorations: DecorationSet
}

interface SpellcheckMeta {
  matches?: SpellMatch[]
  clear?: boolean
  removeId?: string
}

export interface SpellcheckOptions {
  /** Called when a reader clicks an underlined match. */
  onMatchClick?: (id: string, rect: DOMRect) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    faSpellcheck: {
      setSpellMatches: (matches: SpellMatch[]) => ReturnType
      clearSpellMatches: () => ReturnType
      applySpellReplacement: (id: string, replacement: string) => ReturnType
      dismissSpellMatch: (id: string) => ReturnType
    }
  }
}

function decorationsFor(doc: Parameters<typeof DecorationSet.create>[0], matches: SpellMatch[]) {
  return DecorationSet.create(
    doc,
    matches.map((match) =>
      Decoration.inline(
        match.from,
        match.to,
        { class: 'fa-spell-match', 'data-spell-id': match.id },
        { id: match.id },
      ),
    ),
  )
}

/** The decoration for an id, at whatever range it now occupies. */
function findDecoration(state: SpellcheckState | undefined, id: string) {
  if (!state) return null

  const [found] = state.decorations.find(
    undefined,
    undefined,
    (spec: Record<string, unknown>) => spec.id === id,
  )

  return found ?? null
}

export const Spellcheck = Extension.create<SpellcheckOptions>({
  name: 'faSpellcheck',

  addOptions() {
    return { onMatchClick: undefined }
  },

  addCommands() {
    return {
      setSpellMatches:
        (matches) =>
        ({ tr, dispatch }) => {
          dispatch?.(tr.setMeta(spellcheckPluginKey, { matches } satisfies SpellcheckMeta))
          return true
        },

      clearSpellMatches:
        () =>
        ({ tr, dispatch }) => {
          dispatch?.(tr.setMeta(spellcheckPluginKey, { clear: true } satisfies SpellcheckMeta))
          return true
        },

      dismissSpellMatch:
        (id) =>
        ({ tr, dispatch }) => {
          dispatch?.(tr.setMeta(spellcheckPluginKey, { removeId: id } satisfies SpellcheckMeta))
          return true
        },

      /**
       * Replaces the text the match now covers.
       *
       * Reads the decoration's current range rather than the offsets the check
       * returned. After any edit elsewhere in the document those offsets are
       * stale, and using them would overwrite whatever has since moved into
       * that position.
       */
      applySpellReplacement:
        (id, replacement) =>
        ({ state, tr, dispatch }) => {
          const decoration = findDecoration(spellcheckPluginKey.getState(state), id)
          if (!decoration) return false

          tr.replaceWith(decoration.from, decoration.to, state.schema.text(replacement))
          tr.setMeta(spellcheckPluginKey, { removeId: id } satisfies SpellcheckMeta)
          dispatch?.(tr)
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const options = this.options

    return [
      new Plugin<SpellcheckState>({
        key: spellcheckPluginKey,

        state: {
          init: () => ({ decorations: DecorationSet.empty }),

          apply(tr, previous) {
            const meta = tr.getMeta(spellcheckPluginKey) as SpellcheckMeta | undefined

            if (meta?.clear) return { decorations: DecorationSet.empty }

            if (meta?.matches) {
              return { decorations: decorationsFor(tr.doc, meta.matches) }
            }

            if (meta?.removeId) {
              const target = findDecoration(previous, meta.removeId)
              const remaining = target
                ? previous.decorations.remove([target])
                : previous.decorations

              return { decorations: remaining.map(tr.mapping, tr.doc) }
            }

            // The crux: existing decorations are carried through the edit rather
            // than rebuilt, so a check result stays correct while typing
            // continues and no further request is needed.
            return { decorations: previous.decorations.map(tr.mapping, tr.doc) }
          },
        },

        props: {
          decorations(state) {
            return spellcheckPluginKey.getState(state)?.decorations
          },

          handleDOMEvents: {
            mousedown: (_view, event) => {
              const target = event.target
              if (!(target instanceof Element)) return false

              const marked = target.closest('[data-spell-id]')
              if (!marked) return false

              options.onMatchClick?.(
                marked.getAttribute('data-spell-id') ?? '',
                marked.getBoundingClientRect(),
              )

              // Not handled: the caret should still move to where the writer
              // clicked.
              return false
            },
          },
        },
      }),
    ]
  },
})

export default Spellcheck
