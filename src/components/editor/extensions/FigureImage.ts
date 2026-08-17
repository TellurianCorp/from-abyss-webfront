import { Node, mergeAttributes } from '@tiptap/core'

import { alignmentFromClass } from './TextAlign'

/**
 * A figure wrapping an image, with an editable caption.
 *
 * The schema must be able to represent every shape article content can hold,
 * because ProseMirror silently drops what it cannot. Before this node existed,
 * opening a legacy article deleted its images outright — no error, just a
 * shorter document.
 *
 * The markup mirrors what the API's sanitizer allows, so a round trip through
 * the server changes nothing.
 */

export const FIGURE_ALIGNMENTS = ['left', 'center', 'right', 'wide', 'full'] as const

export type FigureAlignment = (typeof FIGURE_ALIGNMENTS)[number]

const DEFAULT_ALIGNMENT: FigureAlignment = 'center'

export interface FigureImageAttributes {
  src: string
  alt: string | null
  width: number | null
  align: FigureAlignment
  mediaId: string | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figureImage: {
      setFigureImage: (attributes: Partial<FigureImageAttributes> & { src: string }) => ReturnType
      setFigureAlignment: (align: FigureAlignment) => ReturnType
    }
  }
}

function isFigureAlignment(value: string | null): value is FigureAlignment {
  return value !== null && (FIGURE_ALIGNMENTS as readonly string[]).includes(value)
}

function parseWidth(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export const FigureImage = Node.create({
  name: 'figureImage',
  group: 'block',
  // Inline content rather than an atom, so the caption is edited in place the
  // way an author expects.
  content: 'inline*',
  draggable: true,
  isolating: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      // Validated here rather than only in getAttrs: TipTap parses attributes
      // from the element as well, and that pass would otherwise reinstate a
      // junk value such as width="not-a-number" over the checked one.
      width: {
        default: null,
        parseHTML: (element) =>
          parseWidth(element.getAttribute('width') ?? element.querySelector('img')?.getAttribute('width') ?? null),
        renderHTML: () => ({}),
      },
      align: { default: DEFAULT_ALIGNMENT },
      mediaId: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-fa-figure]',
        // Without this the <img> would be parsed as caption content and the
        // figure would come back holding its own image as text.
        contentElement: 'figcaption',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false

          const image = element.querySelector('img')
          const src = image?.getAttribute('src')
          if (!src) return false

          // Alignment is stored twice, as a class for CSS and as a data
          // attribute for robustness; either one is enough to read it back.
          const align =
            alignmentFromClass(element.getAttribute('class')) ??
            element.getAttribute('data-align')

          return {
            src,
            alt: image?.getAttribute('alt') ?? null,
            width: parseWidth(image?.getAttribute('width') ?? null),
            align: isFigureAlignment(align) ? align : DEFAULT_ALIGNMENT,
            mediaId: element.getAttribute('data-media-id'),
          }
        },
      },
      {
        // The rule that stops legacy images being deleted: a bare <img>, from
        // an article written in the old editor or from pasted content, is
        // promoted to a figure without a caption.
        tag: 'img[src]',
        priority: 40,
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false

          const src = element.getAttribute('src')
          if (!src) return false

          return {
            src,
            alt: element.getAttribute('alt') ?? null,
            width: parseWidth(element.getAttribute('width')),
            align: DEFAULT_ALIGNMENT,
            mediaId: null,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const align = isFigureAlignment(node.attrs.align as string)
      ? (node.attrs.align as FigureAlignment)
      : DEFAULT_ALIGNMENT

    const width = node.attrs.width as number | null
    const mediaId = node.attrs.mediaId as string | null

    return [
      'figure',
      mergeAttributes(
        {
          'data-fa-figure': '',
          'data-align': align,
          class: `fa-figure fa-align-${align}`,
        },
        mediaId ? { 'data-media-id': mediaId } : {},
      ),
      [
        'img',
        {
          src: HTMLAttributes.src,
          alt: (node.attrs.alt as string | null) ?? '',
          ...(width ? { width: String(width) } : {}),
          loading: 'lazy',
          decoding: 'async',
        },
      ],
      // Position 0 is the content hole: the editable caption.
      ['figcaption', { class: 'fa-figcaption' }, 0],
    ]
  },

  addCommands() {
    return {
      setFigureImage:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { align: DEFAULT_ALIGNMENT, ...attributes },
          }),

      setFigureAlignment:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { align }),
    }
  },
})

export default FigureImage
