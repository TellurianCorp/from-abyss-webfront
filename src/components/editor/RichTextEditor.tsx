import { EditorContent, useEditor } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { buildEditorExtensions } from './extensions'
import { normalizeLegacyHtml } from './html/normalizeLegacyHtml'
import { EditorToolbar } from './EditorToolbar'
import { MediaLibraryModal, type MediaInsertDetails } from './MediaLibraryModal'
import type { MediaItem } from '../../services/mediaService'
// The same sheet the published article uses, so the editing surface and the
// result are styled by one source rather than two that drift.
import '../../styles/article-content.css'
import styles from './RichTextEditor.module.css'

export interface RichTextEditorProps {
  /**
   * Content to open with. Read once, at mount.
   *
   * The editor is uncontrolled on purpose. Its predecessor re-synchronised by
   * assigning innerHTML whenever this prop differed from the DOM, which
   * destroyed the undo history, fought the cursor, and needed a setTimeout to
   * put the selection back. To switch documents, remount with a `key` — that is
   * honest about what is happening, rather than diffing HTML strings.
   */
  value: string
  /** Serialised HTML, debounced. */
  onChange: (html: string) => void
  placeholder?: string
  readOnly?: boolean
  /** BCP-47 tag driving the browser's own spellchecker. */
  language?: string
}

/** How long typing settles before the parent is told. */
const CHANGE_DEBOUNCE_MS = 300

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  language,
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Content written in the old editor needs normalising before the schema sees
  // it, or Quill's bullet lists silently come back numbered. Computed once via a
  // lazy initialiser: `value` is the opening document, not a live binding.
  const [initialContent] = useState(() => normalizeLegacyHtml(value).html)
  const [mediaOpen, setMediaOpen] = useState(false)

  const editor = useEditor({
    extensions: buildEditorExtensions({ placeholder }),
    content: initialContent,
    editable: !readOnly,
    // Typing must not re-render the whole tree; the toolbar subscribes to the
    // state it needs on its own.
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        // The published article uses the same class, so what an author sees
        // here is what a reader gets.
        class: `fa-article fa-article--editing ${styles.content}`,
        spellcheck: 'true',
        ...(language ? { lang: language } : {}),
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor: instance }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onChangeRef.current(instance.getHTML())
      }, CHANGE_DEBOUNCE_MS)
    },
  })

  useEffect(() => {
    editor?.setEditable(!readOnly)
  }, [editor, readOnly])

  // Flush a pending change on unmount, so navigating away immediately after
  // typing does not lose the last few characters.
  useEffect(() => {
    return () => {
      if (!debounceRef.current) return
      clearTimeout(debounceRef.current)
      if (editor) onChangeRef.current(editor.getHTML())
    }
  }, [editor])

  const insertImage = useCallback(
    (item: MediaItem, details: MediaInsertDetails) => {
      if (!editor || !item.url) return

      editor
        .chain()
        .focus()
        .setFigureImage({
          src: item.url,
          alt: details.altText || null,
          width: item.width ?? null,
          mediaId: item.id,
        })
        .run()

      // The caption is the node's content, so it is written after insertion
      // rather than passed as an attribute.
      if (details.caption) editor.chain().insertContent(details.caption).run()
    },
    [editor],
  )

  if (!editor) return null

  return (
    <div className={styles.wrapper}>
      {!readOnly && (
        <EditorToolbar editor={editor} onInsertImage={() => setMediaOpen(true)} />
      )}
      <EditorContent editor={editor} className={styles.surface} />

      <MediaLibraryModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        accept="image"
        onSelect={insertImage}
      />
    </div>
  )
}

export default RichTextEditor
