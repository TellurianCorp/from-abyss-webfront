import { describe, expect, it } from 'vitest'

import { MEDIA_LIMITS, mediaTypeFor, normalizeMimeType, validateFile } from './mediaService'

/**
 * The limits and MIME list mirror internal/storage/media.go. Checking here only
 * saves a round trip — the server enforces the same rules — but a client guard
 * that disagreed with the server would be worse than none, telling a writer a
 * file is fine and then failing after they waited for the upload.
 */

function fakeFile(type: string, size: number, name = 'file'): File {
  const file = new File([''], name, { type })
  // File size is read-only, and constructing a real 200 MB blob to test a limit
  // would be absurd.
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('normalizeMimeType', () => {
  it.each([
    ['image/png', 'image/png'],
    ['IMAGE/PNG', 'image/png'],
    ['image/jpg', 'image/jpeg'],
    ['image/pjpeg', 'image/jpeg'],
    ['audio/mp3', 'audio/mpeg'],
    ['audio/x-m4a', 'audio/mp4'],
    ['video/mp4; codecs="avc1"', 'video/mp4'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeMimeType(input)).toBe(expected)
  })
})

describe('mediaTypeFor', () => {
  it.each([
    ['image/png', 'image'],
    ['image/jpg', 'image'],
    ['audio/mpeg', 'audio'],
    ['audio/mp3', 'audio'],
    ['video/mp4', 'video'],
    ['video/quicktime', 'video'],
  ])('%s is %s', (mime, expected) => {
    expect(mediaTypeFor(mime)).toBe(expected)
  })

  it.each([
    'image/svg+xml',
    'application/pdf',
    'text/html',
    'application/octet-stream',
    '',
  ])('refuses %s', (mime) => {
    expect(mediaTypeFor(mime)).toBeNull()
  })

  /**
   * SVG is refused here for the same reason the server refuses it: served from
   * the CDN, it executes its own inline script.
   */
  it('refuses SVG specifically', () => {
    expect(mediaTypeFor('image/svg+xml')).toBeNull()
  })
})

describe('validateFile', () => {
  it('accepts an ordinary image', () => {
    expect(validateFile(fakeFile('image/png', 1024))).toEqual({ ok: true, mediaType: 'image' })
  })

  it('refuses an unsupported type', () => {
    expect(validateFile(fakeFile('application/pdf', 1024))).toEqual({ ok: false, reason: 'type' })
  })

  it('refuses a file of the wrong kind for the picker', () => {
    expect(validateFile(fakeFile('video/mp4', 1024), 'image')).toEqual({
      ok: false,
      reason: 'type',
    })
  })

  it('accepts a file exactly at the limit', () => {
    const file = fakeFile('image/png', MEDIA_LIMITS.image.maxBytes)

    expect(validateFile(file).ok).toBe(true)
  })

  it('refuses a file one byte over', () => {
    const file = fakeFile('image/png', MEDIA_LIMITS.image.maxBytes + 1)

    expect(validateFile(file)).toEqual({
      ok: false,
      reason: 'size',
      limitBytes: MEDIA_LIMITS.image.maxBytes,
    })
  })

  it('gives audio and video their own larger limits', () => {
    const bigAudio = fakeFile('audio/mpeg', MEDIA_LIMITS.image.maxBytes + 1)
    const bigVideo = fakeFile('video/mp4', MEDIA_LIMITS.audio.maxBytes + 1)

    expect(validateFile(bigAudio).ok).toBe(true)
    expect(validateFile(bigVideo).ok).toBe(true)
  })

  it('still refuses audio past its own limit', () => {
    const file = fakeFile('audio/mpeg', MEDIA_LIMITS.audio.maxBytes + 1)

    expect(validateFile(file)).toMatchObject({ ok: false, reason: 'size' })
  })
})

describe('limits agree with the server', () => {
  it.each([
    ['image', 15],
    ['audio', 200],
    ['video', 500],
  ] as const)('%s is %i MB', (type, mb) => {
    expect(MEDIA_LIMITS[type].maxBytes).toBe(mb * 1024 * 1024)
  })
})
