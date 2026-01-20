import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import './QuillEditor.css'

interface QuillEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function QuillEditor({ value, onChange, placeholder, readOnly = false }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillInstanceRef = useRef<Quill | null>(null)
  const onChangeRef = useRef(onChange)
  
  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!editorRef.current) return
    
    // Prevent multiple initializations - check if Quill is already initialized
    if (quillInstanceRef.current) {
      return
    }

    // Clear container completely to prevent any duplication
    const container = editorRef.current
    container.innerHTML = ''
    
    // Remove any existing Quill instances
    const existingQuill = container.querySelector('.ql-container')
    if (existingQuill) {
      existingQuill.remove()
    }

    // Initialize Quill directly (bypassing react-quill)
    // Simplified toolbar for better writing experience
    const quill = new Quill(container, {
      theme: 'snow',
      placeholder: placeholder || 'Digite o conteúdo do artigo...',
      readOnly,
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'image'],
          ['blockquote'],
          ['clean']
        ]
      }
    })

    quillInstanceRef.current = quill

    // Set initial value
    if (value) {
      quill.root.innerHTML = value
    }

    // Handle text changes
    const handleTextChange = () => {
      const html = quill.root.innerHTML
      // Only call onChange if content actually changed
      if (html !== value) {
        onChangeRef.current(html)
      }
    }
    
    quill.on('text-change', handleTextChange)

    return () => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current.off('text-change', handleTextChange)
        quillInstanceRef.current = null
      }
      // Clear container on unmount
      if (container) {
        container.innerHTML = ''
      }
    }
  }, []) // Only run once on mount

  // Update content when value prop changes (but not from user input)
  useEffect(() => {
    if (quillInstanceRef.current) {
      const currentContent = quillInstanceRef.current.root.innerHTML
      // Only update if content is different (prevents circular updates)
      if (value !== currentContent) {
        const selection = quillInstanceRef.current.getSelection()
        quillInstanceRef.current.root.innerHTML = value || ''
        if (selection) {
          // Restore cursor position after a short delay
          setTimeout(() => {
            if (quillInstanceRef.current && selection) {
              quillInstanceRef.current.setSelection(selection)
            }
          }, 0)
        }
      }
    }
  }, [value])

  // Update readOnly state
  useEffect(() => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.enable(!readOnly)
    }
  }, [readOnly])

  return (
    <div className="quill-editor-wrapper" key="quill-wrapper">
      <div ref={editorRef} className="quill-editor-container" />
    </div>
  )
}
