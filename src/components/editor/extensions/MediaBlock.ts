import { Node, mergeAttributes } from '@tiptap/core'

/**
 * Native audio and video players.
 *
 * Both are atoms with a plain-text caption rather than editable content: a
 * caption on a track is rare enough that the extra schema complexity of inline
 * content is not worth it, and keeping it as text means it round-trips through
 * figcaption.textContent exactly.
 *
 * The markup mirrors what the API's sanitizer allows, so a round trip through
 * the server changes nothing.
 */

interface MediaBlockConfig {
  name: string
  tag: 'audio' | 'video'
  marker: string
  className: string
}

function createMediaBlock({ name, tag, marker, className }: MediaBlockConfig) {
  return Node.create({
    name,
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
      return {
        src: { default: null },
        title: { default: null },
        mediaId: { default: null },
        ...(tag === 'video' ? { poster: { default: null } } : {}),
      }
    },

    parseHTML() {
      return [
        {
          tag: `figure[${marker}]`,
          getAttrs: (element) => {
            if (!(element instanceof HTMLElement)) return false

            const media = element.querySelector(tag)
            const src = media?.getAttribute('src')
            if (!src) return false

            const caption = element.querySelector('figcaption')?.textContent?.trim()

            return {
              src,
              title: caption && caption.length > 0 ? caption : null,
              mediaId: element.getAttribute('data-media-id'),
              ...(tag === 'video' ? { poster: media?.getAttribute('poster') ?? null } : {}),
            }
          },
        },
        {
          // A bare player, from pasted content or an article written elsewhere.
          // Same reasoning as the bare <img> rule: content the schema cannot
          // represent is content ProseMirror deletes.
          tag: `${tag}[src]`,
          priority: 40,
          getAttrs: (element) => {
            if (!(element instanceof HTMLElement)) return false

            const src = element.getAttribute('src')
            if (!src) return false

            return {
              src,
              title: null,
              mediaId: null,
              ...(tag === 'video' ? { poster: element.getAttribute('poster') } : {}),
            }
          },
        },
      ]
    },

    renderHTML({ node }) {
      const mediaId = node.attrs.mediaId as string | null
      const title = node.attrs.title as string | null
      const poster = tag === 'video' ? (node.attrs.poster as string | null) : null

      const player = [
        tag,
        {
          src: node.attrs.src as string,
          controls: 'controls',
          // Never eager: an article can hold several tracks, and the reader
          // asked for none of them yet.
          preload: 'metadata',
          ...(tag === 'video' ? { playsinline: 'true' } : {}),
          ...(poster ? { poster } : {}),
          class: `fa-${tag}-player`,
        },
      ]

      const children: unknown[] = [player]
      if (title) children.push(['figcaption', { class: 'fa-figcaption' }, title])

      return [
        'figure',
        mergeAttributes(
          { [marker]: '', class: className },
          mediaId ? { 'data-media-id': mediaId } : {},
        ),
        ...children,
      ] as never
    },
  })
}

export const AudioBlock = createMediaBlock({
  name: 'audioBlock',
  tag: 'audio',
  marker: 'data-fa-audio',
  className: 'fa-audio',
})

export const VideoBlock = createMediaBlock({
  name: 'videoBlock',
  tag: 'video',
  marker: 'data-fa-video',
  className: 'fa-video',
})
