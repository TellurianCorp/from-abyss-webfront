/**
 * The embed provider allowlist.
 *
 * Mirrors internal/sanitize/embed.go in the API, id patterns included. Anything
 * this accepts that the server does not will be stripped on save, so the two
 * lists have to move together.
 *
 * No network call anywhere here. Resolving through a provider's oEmbed endpoint
 * would put an outbound request on the save path, add a hard dependency on a
 * third party being up, and open an SSRF surface — all to establish a property
 * that a compiled pattern settles offline and deterministically.
 */

export const EMBED_PROVIDERS = ['youtube', 'vimeo', 'spotify'] as const

export type EmbedProvider = (typeof EMBED_PROVIDERS)[number]

export type EmbedAspect = 'video' | 'audio'

export interface EmbedDescriptor {
  provider: EmbedProvider
  id: string
  aspect: EmbedAspect
}

/** Per-provider id shapes, identical to the server's. */
const ID_PATTERNS: Record<EmbedProvider, RegExp> = {
  youtube: /^[A-Za-z0-9_-]{6,20}$/,
  vimeo: /^[0-9]{5,12}$/,
  spotify: /^(?:track|album|episode|show|playlist)\/[A-Za-z0-9]{16,32}$/,
}

const ASPECTS: Record<EmbedProvider, EmbedAspect> = {
  youtube: 'video',
  vimeo: 'video',
  spotify: 'audio',
}

/** Bounds what may sit in data-embed-id, whatever the provider. */
const EMBED_ID_PATTERN = /^[A-Za-z0-9_/-]{1,64}$/

export function isEmbedProvider(value: string | null | undefined): value is EmbedProvider {
  return typeof value === 'string' && (EMBED_PROVIDERS as readonly string[]).includes(value)
}

/**
 * Whether an id is well formed for its provider.
 *
 * Both checks matter: the generic pattern keeps anything exotic out of the
 * attribute, and the per-provider one keeps an id from one host being passed off
 * as another's.
 */
export function isValidEmbedId(provider: string, id: string): boolean {
  if (!EMBED_ID_PATTERN.test(id)) return false
  if (!isEmbedProvider(provider)) return false
  return ID_PATTERNS[provider].test(id)
}

export function aspectFor(provider: EmbedProvider): EmbedAspect {
  return ASPECTS[provider]
}

function describe(provider: EmbedProvider, rawId: string): EmbedDescriptor | null {
  const id = rawId.trim().replace(/^\/+|\/+$/g, '')
  if (!isValidEmbedId(provider, id)) return null
  return { provider, id, aspect: aspectFor(provider) }
}

function parseYouTube(url: URL, path: string): EmbedDescriptor | null {
  const fromQuery = url.searchParams.get('v')
  if (fromQuery) return describe('youtube', fromQuery)

  for (const prefix of ['embed/', 'shorts/', 'live/', 'v/']) {
    if (path.startsWith(prefix)) return describe('youtube', path.slice(prefix.length))
  }

  return null
}

function parseSpotify(path: string): EmbedDescriptor | null {
  let rest = path.startsWith('embed/') ? path.slice('embed/'.length) : path

  // Locale-prefixed links such as /intl-pt/track/ID.
  if (rest.startsWith('intl-')) {
    const slash = rest.indexOf('/')
    if (slash >= 0) rest = rest.slice(slash + 1)
  }

  return describe('spotify', rest)
}

/**
 * Turns a URL a writer pasted into a normalised embed, or null.
 */
export function parseEmbedUrl(raw: string): EmbedDescriptor | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  // Refused rather than upgraded: an embed is a third-party frame, and guessing
  // at the writer's intent is not our job.
  if (url.protocol !== 'https:') return null

  const host = url.hostname.toLowerCase()
  const path = url.pathname.replace(/^\/+|\/+$/g, '')

  // Exact host match. Never a suffix test, or youtube.com.evil.example passes.
  switch (host) {
    case 'youtube.com':
    case 'www.youtube.com':
    case 'm.youtube.com':
    case 'youtube-nocookie.com':
    case 'www.youtube-nocookie.com':
      return parseYouTube(url, path)
    case 'youtu.be':
      return describe('youtube', path)
    case 'vimeo.com':
    case 'www.vimeo.com':
      return describe('vimeo', path.split('/').pop() ?? '')
    case 'player.vimeo.com':
      return describe('vimeo', path.startsWith('video/') ? path.slice('video/'.length) : path)
    case 'open.spotify.com':
      return parseSpotify(path)
    default:
      return null
  }
}

/**
 * The URL the player iframe is pointed at.
 *
 * Built at render time from the stored provider and id, which is the whole
 * reason no iframe is persisted: these choices — the privacy-preserving YouTube
 * host, the parameters — can be changed later for content already published.
 */
export function embedSrc({ provider, id }: EmbedDescriptor): string {
  switch (provider) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${id}`
    case 'vimeo':
      return `https://player.vimeo.com/video/${id}`
    case 'spotify':
      return `https://open.spotify.com/embed/${id}`
  }
}

/** The iframe `allow` attribute, kept as narrow as each player needs. */
export function embedAllow(provider: EmbedProvider): string {
  switch (provider) {
    case 'youtube':
    case 'vimeo':
      return 'accelerometer; clipboard-write; encrypted-media; picture-in-picture; fullscreen'
    case 'spotify':
      return 'clipboard-write; encrypted-media'
  }
}

/** A human-readable name, for the accessible title on the frame. */
export function providerLabel(provider: EmbedProvider): string {
  switch (provider) {
    case 'youtube':
      return 'YouTube'
    case 'vimeo':
      return 'Vimeo'
    case 'spotify':
      return 'Spotify'
  }
}
