import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  List,
  Minus,
  RotateCcw,
  RotateCw,
  Terminal,
  Underline,
  X,
} from 'react-feather'
import { useTranslation } from 'react-i18next'

import { ToolbarButton } from './ToolbarButton'
import styles from './EditorToolbar.module.css'

export interface EditorToolbarProps {
  editor: Editor
  /** Opens the link editor. Falls back to a prompt when not supplied. */
  onEditLink?: () => void
}

export function EditorToolbar({ editor, onEditLink }: EditorToolbarProps) {
  const { t } = useTranslation()

  /**
   * Subscribing to just the flags the buttons need, rather than re-rendering on
   * every transaction, keeps typing from re-rendering the whole button tree.
   */
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance.isActive('bold'),
      italic: instance.isActive('italic'),
      underline: instance.isActive('underline'),
      strike: instance.isActive('strike'),
      code: instance.isActive('code'),
      heading2: instance.isActive('heading', { level: 2 }),
      heading3: instance.isActive('heading', { level: 3 }),
      bulletList: instance.isActive('bulletList'),
      orderedList: instance.isActive('orderedList'),
      blockquote: instance.isActive('blockquote'),
      codeBlock: instance.isActive('codeBlock'),
      link: instance.isActive('link'),
      alignLeft: instance.isActive({ textAlign: 'left' }),
      alignCenter: instance.isActive({ textAlign: 'center' }),
      alignRight: instance.isActive({ textAlign: 'right' }),
      alignJustify: instance.isActive({ textAlign: 'justify' }),
      canUndo: instance.can().undo(),
      canRedo: instance.can().redo(),
    }),
  })

  const editLink = () => {
    if (onEditLink) {
      onEditLink()
      return
    }

    const previous = (editor.getAttributes('link').href as string | undefined) ?? ''
    const url = window.prompt(t('editor.link.prompt', 'Link URL'), previous)
    if (url === null) return

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  return (
    <div
      className={styles.toolbar}
      role="toolbar"
      aria-label={t('editor.toolbar.label', 'Formatting')}
    >
      <div className={styles.group}>
        <ToolbarButton
          icon={RotateCcw}
          label={t('editor.toolbar.undo', 'Undo')}
          isDisabled={!state.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={RotateCw}
          label={t('editor.toolbar.redo', 'Redo')}
          isDisabled={!state.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      <div className={styles.group}>
        <ToolbarButton
          glyph="H2"
          label={t('editor.toolbar.heading2', 'Heading')}
          isActive={state.heading2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          glyph="H3"
          label={t('editor.toolbar.heading3', 'Subheading')}
          isActive={state.heading3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
      </div>

      <div className={styles.group}>
        <ToolbarButton
          icon={Bold}
          label={t('editor.toolbar.bold', 'Bold')}
          isActive={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label={t('editor.toolbar.italic', 'Italic')}
          isActive={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Underline}
          label={t('editor.toolbar.underline', 'Underline')}
          isActive={state.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          glyph="S"
          glyphClassName={styles.struck}
          label={t('editor.toolbar.strike', 'Strikethrough')}
          isActive={state.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={Code}
          label={t('editor.toolbar.code', 'Inline code')}
          isActive={state.code}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
      </div>

      <div className={styles.group}>
        <ToolbarButton
          icon={AlignLeft}
          label={t('editor.toolbar.alignLeft', 'Align left')}
          isActive={state.alignLeft}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          icon={AlignCenter}
          label={t('editor.toolbar.alignCenter', 'Align centre')}
          isActive={state.alignCenter}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          icon={AlignRight}
          label={t('editor.toolbar.alignRight', 'Align right')}
          isActive={state.alignRight}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <ToolbarButton
          icon={AlignJustify}
          label={t('editor.toolbar.alignJustify', 'Justify')}
          isActive={state.alignJustify}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        />
      </div>

      <div className={styles.group}>
        <ToolbarButton
          icon={List}
          label={t('editor.toolbar.bulletList', 'Bullet list')}
          isActive={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          glyph="1."
          label={t('editor.toolbar.orderedList', 'Numbered list')}
          isActive={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          glyph="&rdquo;"
          label={t('editor.toolbar.blockquote', 'Quote')}
          isActive={state.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Terminal}
          label={t('editor.toolbar.codeBlock', 'Code block')}
          isActive={state.codeBlock}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
      </div>

      <div className={styles.group}>
        <ToolbarButton
          icon={LinkIcon}
          label={t('editor.toolbar.link', 'Link')}
          isActive={state.link}
          onClick={editLink}
        />
        <ToolbarButton
          icon={Minus}
          label={t('editor.toolbar.horizontalRule', 'Divider')}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>

      <div className={styles.group}>
        <ToolbarButton
          icon={X}
          label={t('editor.toolbar.clearFormatting', 'Clear formatting')}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        />
      </div>
    </div>
  )
}

export default EditorToolbar
