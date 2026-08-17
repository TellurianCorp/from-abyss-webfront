/**
 * Normalises HTML written by the previous Quill editor so it loads into the
 * TipTap schema without losing meaning.
 *
 * This runs against content that is already published, so every transform here
 * is either a correction of something Quill encoded in its own way, or the
 * removal of a class the new schema has no place for. Nothing else is touched.
 */

import { TEXT_ALIGNMENTS, type TextAlignment } from '../extensions/TextAlign'

export interface LegacyNormalizationResult {
  html: string
  /** Base64 images still embedded in the content, for the migration prompt. */
  inlineImageCount: number
  changed: boolean
}

/** Quill classes that carry no meaning in our schema. */
const DROPPED_CLASS_PREFIXES = ['ql-indent-', 'ql-size-', 'ql-font-']

const QL_ALIGN_PREFIX = 'ql-align-'

function isAlignment(value: string): value is TextAlignment {
  return (TEXT_ALIGNMENTS as readonly string[]).includes(value)
}

/**
 * Rewrites Quill's class vocabulary onto ours, and strips what has no schema
 * support. Returns the class list to keep, or null when nothing survives.
 */
function rewriteClassList(className: string): string | null {
  const kept: string[] = []

  for (const token of className.split(/\s+/).filter(Boolean)) {
    if (token.startsWith(QL_ALIGN_PREFIX)) {
      const alignment = token.slice(QL_ALIGN_PREFIX.length)
      if (isAlignment(alignment)) kept.push(`fa-align-${alignment}`)
      continue
    }

    if (DROPPED_CLASS_PREFIXES.some((prefix) => token.startsWith(prefix))) continue
    if (token === 'ql-ui' || token.startsWith('ql-')) continue

    kept.push(token)
  }

  return kept.length > 0 ? kept.join(' ') : null
}

/**
 * Converts Quill's bullet lists into real unordered lists.
 *
 * Quill 2 serialises bullet and ordered lists both as <ol>, telling them apart
 * only by `data-list` on the items. Left alone, every bullet list in every
 * published article silently becomes numbered the first time it is opened.
 */
function convertBulletLists(doc: Document): boolean {
  let changed = false

  for (const list of Array.from(doc.querySelectorAll('ol'))) {
    const firstItem = list.querySelector(':scope > li')
    if (firstItem?.getAttribute('data-list') !== 'bullet') continue

    const replacement = doc.createElement('ul')
    for (const attr of Array.from(list.attributes)) {
      replacement.setAttribute(attr.name, attr.value)
    }
    while (list.firstChild) replacement.appendChild(list.firstChild)

    list.replaceWith(replacement)
    changed = true
  }

  return changed
}

/** Removes the data-list bookkeeping once the list type is encoded structurally. */
function stripListMarkers(doc: Document): boolean {
  const items = Array.from(doc.querySelectorAll('li[data-list]'))
  for (const item of items) item.removeAttribute('data-list')
  return items.length > 0
}

/** Removes Quill's cursor-affordance spans, which carry no content. */
function removeUiSpans(doc: Document): boolean {
  const spans = Array.from(doc.querySelectorAll('span.ql-ui'))
  for (const span of spans) span.remove()
  return spans.length > 0
}

/**
 * Lifts an image out of a paragraph that contains nothing else, so it lands at
 * block level where the figure node can claim it rather than leaving an empty
 * paragraph behind.
 */
function unwrapLoneImages(doc: Document): boolean {
  let changed = false

  for (const image of Array.from(doc.querySelectorAll('p > img'))) {
    const paragraph = image.parentElement
    if (!paragraph) continue

    const hasOtherContent =
      paragraph.childNodes.length > 1 || (paragraph.textContent ?? '').trim() !== ''
    if (hasOtherContent) continue

    paragraph.replaceWith(image)
    changed = true
  }

  return changed
}

function rewriteClasses(doc: Document): boolean {
  let changed = false

  for (const element of Array.from(doc.querySelectorAll('[class]'))) {
    const original = element.getAttribute('class') ?? ''
    const rewritten = rewriteClassList(original)

    if (rewritten === original) continue

    if (rewritten === null) {
      element.removeAttribute('class')
    } else {
      element.setAttribute('class', rewritten)
    }
    changed = true
  }

  return changed
}

function countInlineImages(doc: Document): number {
  return doc.querySelectorAll('img[src^="data:"]').length
}

/**
 * Normalises one piece of legacy content.
 *
 * Parsed as a document rather than pattern-matched, because these transforms are
 * structural: turning an <ol> into a <ul> and moving an <img> out of its
 * paragraph are not things regular expressions do safely.
 */
export function normalizeLegacyHtml(html: string): LegacyNormalizationResult {
  if (!html.trim()) {
    return { html, inlineImageCount: 0, changed: false }
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Bullet lists first: stripListMarkers removes the attribute it reads.
  const listsConverted = convertBulletLists(doc)
  const markersStripped = stripListMarkers(doc)
  const spansRemoved = removeUiSpans(doc)
  const imagesUnwrapped = unwrapLoneImages(doc)
  const classesRewritten = rewriteClasses(doc)

  const changed =
    listsConverted || markersStripped || spansRemoved || imagesUnwrapped || classesRewritten

  return {
    // innerHTML of body rather than serialising the document, so the fragment
    // does not come back wrapped in <html> and <body>.
    html: changed ? doc.body.innerHTML : html,
    inlineImageCount: countInlineImages(doc),
    changed,
  }
}

export default normalizeLegacyHtml
