import { useEffect } from 'react'

import {
  embedAllow,
  embedSrc,
  isEmbedProvider,
  isValidEmbedId,
  providerLabel,
  type EmbedProvider,
} from '../editor/embeds/providers'

/**
 * Turns the stored embed markers into real players.
 *
 * Article content holds only a provider and an id, never an iframe, so
 * something has to build the frame at display time or a reader sees an empty
 * div. Doing it here is the point of that design: src, sandbox, allow and
 * referrerpolicy are decided now, for content published at any time in the past.
 *
 * The frame is created imperatively rather than rendered by React because the
 * surrounding article is set through dangerouslySetInnerHTML and React does not
 * own those nodes.
 */
export function useArticleEmbeds(container: HTMLElement | null, html: string): void {
  useEffect(() => {
    if (!container) return

    const placeholders = Array.from(
      container.querySelectorAll<HTMLElement>('.fa-embed[data-embed-provider]'),
    )

    for (const placeholder of placeholders) {
      // Already hydrated, for instance after a re-render with the same content.
      if (placeholder.querySelector('iframe')) continue

      const provider = placeholder.getAttribute('data-embed-provider')
      const id = placeholder.getAttribute('data-embed-id') ?? ''

      // Re-checked here even though the sanitizer checked already: this is the
      // step that decides what a browser connects to.
      if (!isEmbedProvider(provider) || !isValidEmbedId(provider, id)) {
        placeholder.remove()
        continue
      }

      placeholder.appendChild(buildFrame(provider, id))
    }

    return () => {
      for (const placeholder of placeholders) {
        placeholder.querySelector('iframe')?.remove()
      }
    }
  }, [container, html])
}

function buildFrame(provider: EmbedProvider, id: string): HTMLIFrameElement {
  const frame = document.createElement('iframe')

  frame.src = embedSrc({ provider, id, aspect: 'video' })
  frame.title = providerLabel(provider)
  frame.loading = 'lazy'
  frame.allow = embedAllow(provider)
  frame.referrerPolicy = 'strict-origin-when-cross-origin'
  frame.className = 'fa-embed-frame'
  frame.setAttribute('frameborder', '0')
  frame.setAttribute('allowfullscreen', 'true')

  return frame
}
