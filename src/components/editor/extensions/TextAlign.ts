import { Extension } from '@tiptap/core'

/**
 * Text alignment rendered as a class, never as inline style.
 *
 * This is a contract with the API, not a stylistic preference. The bluemonday
 * policy there does not permit the `style` attribute at all, so TipTap's
 * official text-align extension — which renders `style="text-align: center"` —
 * would have every alignment an author sets discarded on save, silently and
 * with no error anywhere.
 *
 * The classes emitted here are the ones that policy allowlists. Changing either
 * side alone breaks alignment.
 */

export const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'justify'] as const

export type TextAlignment = (typeof TEXT_ALIGNMENTS)[number]

export interface TextAlignOptions {
  /** Node types the attribute is added to. */
  types: string[]
  /** Alignment treated as the default, and therefore not written out. */
  defaultAlignment: TextAlignment
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    faTextAlign: {
      setTextAlign: (alignment: TextAlignment) => ReturnType
      unsetTextAlign: () => ReturnType
    }
  }
}

const ALIGN_CLASS_PREFIX = 'fa-align-'

function isAlignment(value: string): value is TextAlignment {
  return (TEXT_ALIGNMENTS as readonly string[]).includes(value)
}

/** Reads an alignment out of a class list, ignoring any other classes present. */
export function alignmentFromClass(className: string | null | undefined): TextAlignment | null {
  if (!className) return null

  for (const token of className.split(/\s+/)) {
    if (!token.startsWith(ALIGN_CLASS_PREFIX)) continue

    const candidate = token.slice(ALIGN_CLASS_PREFIX.length)
    if (isAlignment(candidate)) return candidate
  }

  return null
}

/** The class for an alignment, or null when it is the default. */
export function alignmentClass(
  alignment: TextAlignment | null,
  defaultAlignment: TextAlignment,
): string | null {
  if (!alignment || alignment === defaultAlignment) return null
  return `${ALIGN_CLASS_PREFIX}${alignment}`
}

export const TextAlign = Extension.create<TextAlignOptions>({
  name: 'faTextAlign',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      defaultAlignment: 'left',
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => {
              // The class form is ours. The inline style is what pasted Word and
              // Google Docs content carries, and what Quill wrote before this,
              // so it is read too even though it is never written.
              const fromClass = alignmentFromClass(element.getAttribute('class'))
              if (fromClass) return fromClass

              const fromStyle = element.style.textAlign?.trim().toLowerCase()
              return fromStyle && isAlignment(fromStyle) ? fromStyle : null
            },
            renderHTML: (attributes) => {
              const className = alignmentClass(
                attributes.textAlign as TextAlignment | null,
                this.options.defaultAlignment,
              )
              return className ? { class: className } : {}
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) =>
          this.options.types
            .map((type) => commands.updateAttributes(type, { textAlign: alignment }))
            .every(Boolean),

      unsetTextAlign:
        () =>
        ({ commands }) =>
          this.options.types
            .map((type) => commands.resetAttributes(type, 'textAlign'))
            .every(Boolean),
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-l': () => this.editor.commands.setTextAlign('left'),
      'Mod-Shift-e': () => this.editor.commands.setTextAlign('center'),
      'Mod-Shift-r': () => this.editor.commands.setTextAlign('right'),
      'Mod-Shift-j': () => this.editor.commands.setTextAlign('justify'),
    }
  },
})

export default TextAlign
