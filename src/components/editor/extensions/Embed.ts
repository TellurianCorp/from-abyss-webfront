import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

import {
  aspectFor,
  isEmbedProvider,
  isValidEmbedId,
  parseEmbedUrl,
  type EmbedAspect,
  type EmbedProvider,
} from '../embeds/providers'

/**
 * An embedded player, stored as a provider and an id rather than an iframe.
 *
 * Nothing framed is persisted. The renderer builds the iframe from this pair at
 * display time, which keeps every frame attribute — src, sandbox, allow,
 * referrerpolicy — under our control then, instead of frozen into markup an
 * editor saved years earlier. It also means the stored document contains
 * nothing that can execute, which is why the API's sanitizer can allow it at
 * all while stripping <iframe> outright.
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      /** Inserts an embed from a pasted URL. Returns false if unrecognised. */
      setEmbedFromUrl: (url: string) => ReturnType
    }
  }
}

export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      provider: { default: null },
      embedId: { default: null },
      aspect: { default: 'video' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed-provider]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false

          const provider = element.getAttribute('data-embed-provider')
          const embedId = element.getAttribute('data-embed-id') ?? ''

          // An unknown provider or a malformed id is refused outright rather
          // than stored and dealt with later. Returning false drops the node.
          if (!isEmbedProvider(provider) || !isValidEmbedId(provider, embedId)) return false

          return { provider, embedId, aspect: aspectFor(provider) }
        },
      },
    ]
  },

  renderHTML({ node }) {
    const provider = node.attrs.provider as EmbedProvider
    const aspect = (node.attrs.aspect as EmbedAspect) ?? 'video'

    return [
      'div',
      mergeAttributes({
        class: `fa-embed fa-embed-${aspect}`,
        'data-embed-provider': provider,
        'data-embed-id': node.attrs.embedId as string,
      }),
    ]
  },

  addCommands() {
    return {
      setEmbedFromUrl:
        (url) =>
        ({ commands }) => {
          const descriptor = parseEmbedUrl(url)
          if (!descriptor) return false

          return commands.insertContent({
            type: this.name,
            attrs: {
              provider: descriptor.provider,
              embedId: descriptor.id,
              aspect: descriptor.aspect,
            },
          })
        },
    }
  },

  addProseMirrorPlugins() {
    const type = this.type

    return [
      new Plugin({
        props: {
          /**
           * Pasting a bare provider URL on its own becomes a player, the way a
           * writer expects. Block nodes cannot use addPasteRules, hence the
           * plugin.
           */
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain')?.trim()
            // Only a URL pasted alone; anything with whitespace is prose that
            // happens to contain a link, and should stay prose.
            if (!text || /\s/.test(text)) return false

            const descriptor = parseEmbedUrl(text)
            if (!descriptor) return false

            view.dispatch(
              view.state.tr.replaceSelectionWith(
                type.create({
                  provider: descriptor.provider,
                  embedId: descriptor.id,
                  aspect: descriptor.aspect,
                }),
              ),
            )
            return true
          },
        },
      }),
    ]
  },
})

export default Embed
