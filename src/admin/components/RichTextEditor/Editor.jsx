import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import Toolbar from './Toolbar'
import { buildExtensions } from './extensions'
import { estimateReadingMinutes } from '../../lib/readingTime'

const RichTextEditor = ({ content, onChange, placeholder, uploadContext = 'general', editable = true }) => {
  const editor = useEditor({
    extensions: buildExtensions({ placeholder }),
    content: content ?? '',
    editable,
    editorProps: {
      attributes: {
        class:
          'prose max-w-none focus:outline-none min-h-[320px] px-6 py-5 prose-headings:font-display prose-headings:text-navy prose-p:text-navy prose-a:text-lake prose-strong:text-navy prose-blockquote:border-lake prose-blockquote:text-slate prose-code:text-lake prose-code:before:content-none prose-code:after:content-none',
      },
    },
    onUpdate: ({ editor: e }) => {
      const wordCount = e.storage.characterCount.words()
      onChange?.(e.getJSON(), {
        wordCount,
        readingTimeMinutes: estimateReadingMinutes(wordCount),
        characterCount: e.storage.characterCount.characters(),
        html: e.getHTML(),
      })
    },
  })

  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  if (!editor) return null

  const wordCount = editor.storage.characterCount.words()
  const charCount = editor.storage.characterCount.characters()

  return (
    <div className="overflow-hidden rounded-3xl border border-navy/8 bg-snow shadow-soft">
      <Toolbar editor={editor} uploadContext={uploadContext} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-end gap-4 border-t border-navy/8 px-6 py-3 text-xs text-slate">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        <span>{estimateReadingMinutes(wordCount)} min read</span>
      </div>
    </div>
  )
}

export default RichTextEditor
