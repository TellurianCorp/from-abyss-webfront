import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { buildEditorExtensions } from './index'

const extensions = buildEditorExtensions()
const CDN = 'https://cdn.fromabyss.com'

function roundTrip(html: string): string {
  const editor = new Editor({ extensions, content: html })
  try {
    return editor.getHTML()
  } finally {
    editor.destroy()
  }
}

describe('audio', () => {
  it('survives as a figure with a player', () => {
    const result = roundTrip(
      `<figure data-fa-audio="" class="fa-audio"><audio src="${CDN}/a.mp3" controls preload="metadata" class="fa-audio-player"></audio></figure>`,
    )

    expect(result).toContain('<audio')
    expect(result).toContain(`${CDN}/a.mp3`)
    expect(result).toContain('data-fa-audio')
  })

  it('keeps its caption', () => {
    const result = roundTrip(
      `<figure data-fa-audio="" class="fa-audio"><audio src="${CDN}/a.mp3" controls></audio><figcaption class="fa-figcaption">Trilha</figcaption></figure>`,
    )

    expect(result).toContain('Trilha')
  })

  it('promotes a bare player rather than deleting it', () => {
    const result = roundTrip(`<p>a</p><audio src="${CDN}/a.mp3" controls></audio>`)

    expect(result).toContain('<audio')
    expect(result).toContain('data-fa-audio')
  })

  it('never preloads the whole track', () => {
    const result = roundTrip(`<audio src="${CDN}/a.mp3" preload="auto" controls></audio>`)

    expect(result).toContain('preload="metadata"')
    expect(result).not.toContain('preload="auto"')
  })

  it('is stable across a second pass', () => {
    const once = roundTrip(`<audio src="${CDN}/a.mp3" controls></audio>`)

    expect(roundTrip(once)).toBe(once)
  })
})

describe('video', () => {
  it('survives with its poster', () => {
    const result = roundTrip(
      `<figure data-fa-video="" class="fa-video"><video src="${CDN}/v.mp4" poster="${CDN}/p.png" controls playsinline></video></figure>`,
    )

    expect(result).toContain('<video')
    expect(result).toContain(`${CDN}/v.mp4`)
    expect(result).toContain(`poster="${CDN}/p.png"`)
  })

  it('promotes a bare player rather than deleting it', () => {
    expect(roundTrip(`<video src="${CDN}/v.mp4" controls></video>`)).toContain('<video')
  })

  it('plays inline rather than going fullscreen on a phone', () => {
    expect(roundTrip(`<video src="${CDN}/v.mp4" controls></video>`)).toContain('playsinline')
  })

  it('is stable across a second pass', () => {
    const once = roundTrip(`<video src="${CDN}/v.mp4" controls></video>`)

    expect(roundTrip(once)).toBe(once)
  })
})

describe('embeds', () => {
  it.each([
    ['youtube', 'dQw4w9WgXcQ'],
    ['vimeo', '123456789'],
    ['spotify', 'track/6rqhFgbbKwnb9MLmUQDhG6'],
  ])('round-trips a %s marker', (provider, id) => {
    const result = roundTrip(
      `<div class="fa-embed" data-embed-provider="${provider}" data-embed-id="${id}"></div>`,
    )

    expect(result).toContain(`data-embed-provider="${provider}"`)
    expect(result).toContain(`data-embed-id="${id}"`)
  })

  /**
   * The stored document must never contain a frame. That is what lets the API's
   * sanitizer allow embeds at all while stripping iframe outright, and what
   * keeps every frame attribute a render-time decision.
   */
  it('never serialises an iframe', () => {
    const result = roundTrip(
      '<div class="fa-embed" data-embed-provider="youtube" data-embed-id="dQw4w9WgXcQ"></div>',
    )

    expect(result).not.toContain('<iframe')
    expect(result).not.toContain('youtube.com')
  })

  it('drops a marker naming an unknown provider', () => {
    const result = roundTrip(
      '<div class="fa-embed" data-embed-provider="evil" data-embed-id="abc"></div>',
    )

    expect(result).not.toContain('evil')
  })

  it('drops a marker with a malformed id', () => {
    const result = roundTrip(
      '<div class="fa-embed" data-embed-provider="youtube" data-embed-id="no"></div>',
    )

    expect(result).not.toContain('data-embed-id')
  })

  it('refuses an id belonging to a different provider', () => {
    const result = roundTrip(
      '<div class="fa-embed" data-embed-provider="vimeo" data-embed-id="dQw4w9WgXcQ"></div>',
    )

    expect(result).not.toContain('data-embed-id')
  })

  it('carries the aspect so the player can be sized before it loads', () => {
    expect(
      roundTrip('<div class="fa-embed" data-embed-provider="spotify" data-embed-id="track/6rqhFgbbKwnb9MLmUQDhG6"></div>'),
    ).toContain('fa-embed-audio')
  })

  it('is stable across a second pass', () => {
    const once = roundTrip(
      '<div class="fa-embed" data-embed-provider="youtube" data-embed-id="dQw4w9WgXcQ"></div>',
    )

    expect(roundTrip(once)).toBe(once)
  })
})

describe('a whole article with every media kind', () => {
  it('loses nothing', () => {
    const article =
      '<h2>O Farol</h2>' +
      `<figure data-fa-figure="" class="fa-figure fa-align-wide"><img src="${CDN}/a.png" alt="capela"><figcaption class="fa-figcaption">Névoa</figcaption></figure>` +
      '<p>Texto.</p>' +
      `<figure data-fa-audio="" class="fa-audio"><audio src="${CDN}/a.mp3" controls></audio></figure>` +
      `<figure data-fa-video="" class="fa-video"><video src="${CDN}/v.mp4" controls></video></figure>` +
      '<div class="fa-embed" data-embed-provider="youtube" data-embed-id="dQw4w9WgXcQ"></div>' +
      '<blockquote><p>Ninguém volta.</p></blockquote>'

    const result = roundTrip(article)

    for (const expected of [
      'O Farol',
      '<img',
      'Névoa',
      'Texto.',
      '<audio',
      '<video',
      'data-embed-provider="youtube"',
      'Ninguém volta.',
    ]) {
      expect(result).toContain(expected)
    }
  })
})
