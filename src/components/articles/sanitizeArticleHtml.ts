import createDOMPurify from 'dompurify'

/**
 * Client-side sanitizing for article HTML, mirroring the bluemonday policy the
 * API applies on write.
 *
 * The server is the control; this is defence in depth, and it earns its place
 * for two concrete reasons. Rows written before server-side sanitization
 * shipped are still unsanitized until the backfill runs, and this is the one
 * place in the app where being wrong means executing a stranger's script on our
 * own origin.
 *
 * The two allowlists have to agree. Where the server strips something this keeps,
 * the page renders differently from the editor; where this strips something the
 * server keeps, the safety is illusory. Both are exercised against the same
 * fixtures.
 */

/** Tags the API's policy permits in article content. */
const ALLOWED_TAGS = [
  'p',
  'br',
  'hr',
  'h2',
  'h3',
  'h4',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'sub',
  'sup',
  'mark',
  'code',
  'pre',
  'ul',
  'ol',
  'li',
  'blockquote',
  'figure',
  'figcaption',
  'span',
  'div',
  'a',
  'img',
  'audio',
  'video',
  'source',
]

const ALLOWED_ATTR = [
  'href',
  'title',
  'target',
  'rel',
  'src',
  'alt',
  'width',
  'height',
  'loading',
  'decoding',
  'class',
  'controls',
  'preload',
  'poster',
  'playsinline',
  'type',
  'start',
  'reversed',
  'data-media-id',
  'data-embed-provider',
  'data-embed-id',
]

/**
 * Only our own class vocabulary survives.
 *
 * DOMPurify allows or forbids the class attribute wholesale, so the filtering
 * happens in a hook. Without it, injected markup could borrow the site's own
 * layout utilities to cover the page — allowing `class` is not the same as
 * allowing any class.
 */
const ALLOWED_CLASS_PATTERN = /^(?:fa-[a-z0-9-]+|language-[a-z0-9+#.-]+)$/

/** Embed providers the renderer knows how to frame. Mirrors the API's list. */
const ALLOWED_EMBED_PROVIDERS = new Set(['youtube', 'vimeo', 'spotify'])

const EMBED_ID_PATTERN = /^[A-Za-z0-9_/-]{1,64}$/

/** The only data-* attributes article content may carry. */
const ALLOWED_DATA_ATTRS = new Set(['data-media-id', 'data-embed-provider', 'data-embed-id'])

/** Attributes that carry a URL and therefore need scheme checking. */
const URL_ATTRS = ['src', 'href', 'poster']

const INLINE_IMAGE_PATTERN = /^data:image\/(?:png|jpeg|gif|webp|avif);base64,/i

/**
 * Whether the current sanitize call permits base64 images.
 *
 * A module-level flag because DOMPurify hooks are registered on the instance and
 * do not receive our options. sanitize() is synchronous and JavaScript is
 * single-threaded, so there is no call to interleave with this one.
 */
let allowInlineImagesForCall = true

let purifier: ReturnType<typeof createDOMPurify> | null = null

/**
 * Builds an isolated DOMPurify instance.
 *
 * Deliberately not the shared default export: hooks register on the instance,
 * so using the singleton would impose ours on any other consumer, and theirs on
 * us.
 */
function getPurifier(): ReturnType<typeof createDOMPurify> {
  if (purifier) return purifier

  const instance = createDOMPurify(window)

  instance.addHook('afterSanitizeAttributes', (node) => {
    if (!(node instanceof Element)) return

    // Drop every data-* attribute we did not name.
    //
    // DOMPurify's ALLOW_DATA_ATTR is all-or-nothing: setting it false strips
    // even the ones listed in ALLOWED_ATTR, which silently breaks embeds. So it
    // stays true and the filtering happens here.
    for (const attr of Array.from(node.attributes)) {
      if (attr.name.startsWith('data-') && !ALLOWED_DATA_ATTRS.has(attr.name)) {
        node.removeAttribute(attr.name)
      }
    }

    // Enforce the data: URI policy ourselves.
    //
    // ALLOWED_URI_REGEXP does not cover this: DOMPurify permits data: URIs on
    // img, audio, video and source by default, so data:text/html would otherwise
    // survive here while the server strips it — a divergence between the two
    // allowlists, which is the one thing this file must not have.
    for (const name of URL_ATTRS) {
      const value = node.getAttribute(name)
      if (value === null || !/^data:/i.test(value.trim())) continue

      const permitted = allowInlineImagesForCall && INLINE_IMAGE_PATTERN.test(value.trim())
      if (!permitted) node.removeAttribute(name)
    }

    // Keep only our own classes.
    const className = node.getAttribute('class')
    if (className !== null) {
      const kept = className.split(/\s+/).filter((token) => ALLOWED_CLASS_PATTERN.test(token))
      if (kept.length > 0) {
        node.setAttribute('class', kept.join(' '))
      } else {
        node.removeAttribute('class')
      }
    }

    // Embed markers must name a provider we can frame, with a plausible id.
    const provider = node.getAttribute('data-embed-provider')
    if (provider !== null) {
      const id = node.getAttribute('data-embed-id') ?? ''
      if (!ALLOWED_EMBED_PROVIDERS.has(provider) || !EMBED_ID_PATTERN.test(id)) {
        node.removeAttribute('data-embed-provider')
        node.removeAttribute('data-embed-id')
      }
    }

    // Harden outbound links. target="_blank" without noopener hands the opened
    // page a handle on ours.
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      const href = node.getAttribute('href') ?? ''
      if (/^https?:/i.test(href)) {
        node.setAttribute('rel', 'noopener noreferrer nofollow')
        node.setAttribute('target', '_blank')
      }
    }

    // Media never plays on its own, whatever the markup asked for.
    if (node.tagName === 'AUDIO' || node.tagName === 'VIDEO') {
      node.removeAttribute('autoplay')
      node.setAttribute('preload', 'metadata')
    }
  })

  purifier = instance
  return instance
}

export interface SanitizeArticleHtmlOptions {
  /**
   * Permit base64 images. Content written in the old editor embedded pictures
   * that way, and they stay valid until the extraction migration has run
   * everywhere; stripping them early would blank out published articles.
   */
  allowInlineImages?: boolean
}

export function sanitizeArticleHtml(
  html: string,
  { allowInlineImages = true }: SanitizeArticleHtmlOptions = {},
): string {
  if (!html) return ''

  allowInlineImagesForCall = allowInlineImages

  return getPurifier().sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Kept true so the three data-* attributes we do use survive; the hook drops
    // every other one. Setting it false strips them all, including the ones in
    // ALLOWED_ATTR.
    ALLOW_DATA_ATTR: true,
    // style is forbidden on both sides. It would reintroduce inline positioning
    // and, through url(), a request to an arbitrary host. Alignment is a class
    // for exactly this reason.
    FORBID_ATTR: ['style'],
    FORBID_TAGS: ['style', 'iframe', 'script', 'object', 'embed', 'form'],
    // Covers href and any attribute DOMPurify does not treat as a data-URI
    // target; the hook handles the data: cases this regexp cannot reach.
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|data:image\/)/i,
  })
}

export default sanitizeArticleHtml
