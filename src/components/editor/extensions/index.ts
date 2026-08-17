import type { Extensions } from '@tiptap/core'
import { CharacterCount, Placeholder } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'

import { TextAlign } from './TextAlign'

export interface BuildExtensionsOptions {
  placeholder?: string
}

/**
 * Assembles the editor's schema.
 *
 * Kept free of React so the round-trip tests can exercise the schema directly,
 * without mounting anything. The schema is where content is silently lost, so it
 * needs to be testable on its own terms.
 *
 * StarterKit v3 already bundles Bold, Italic, Strike, Code, CodeBlock,
 * Underline, Link, Heading, Blockquote, the list extensions, HorizontalRule and
 * the cursors. Adding any of them separately registers a duplicate extension
 * name and TipTap throws at init.
 */
export function buildEditorExtensions(options: BuildExtensionsOptions = {}): Extensions {
  return [
    StarterKit.configure({
      // h1 belongs to the article title, not the body: a second one in the
      // document breaks the outline, and the API's policy strips it anyway.
      heading: { levels: [2, 3, 4] },
      link: {
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto'],
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      defaultAlignment: 'left',
    }),
    Placeholder.configure({
      placeholder: options.placeholder ?? '',
    }),
    CharacterCount,
  ]
}

export { TextAlign } from './TextAlign'
export type { TextAlignment, TextAlignOptions } from './TextAlign'
