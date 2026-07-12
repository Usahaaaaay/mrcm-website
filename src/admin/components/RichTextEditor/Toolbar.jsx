import { useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  ImagePlus,
  MonitorPlay,
  Table as TableIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Video,
} from 'lucide-react'
import MediaPicker from '../MediaPicker'

const ToolbarButton = ({ active, onClick, disabled, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30 ${
      active ? 'bg-lake text-snow' : 'text-slate hover:bg-cloud hover:text-navy'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <span className="mx-1 h-5 w-px bg-navy/10" />

const Toolbar = ({ editor, uploadContext = 'general' }) => {
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [videoPickerOpen, setVideoPickerOpen] = useState(false)

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Link URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addYoutube = () => {
    const url = window.prompt('YouTube URL')
    if (url) editor.commands.setYoutubeVideo({ src: url })
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-navy/8 bg-cloud/60 px-2 py-2">
      <ToolbarButton label="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={15} />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={15} />
      </ToolbarButton>
      <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton label="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code size={15} />
      </ToolbarButton>
      <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Link" active={editor.isActive('link')} onClick={addLink}>
        <Link2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Insert image" onClick={() => setImagePickerOpen(true)}>
        <ImagePlus size={15} />
      </ToolbarButton>
      <ToolbarButton label="Insert video" onClick={() => setVideoPickerOpen(true)}>
        <Video size={15} />
      </ToolbarButton>
      <ToolbarButton label="Embed YouTube" onClick={addYoutube}>
        <MonitorPlay size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Insert table"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={15} />
      </ToolbarButton>

      <MediaPicker
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        accept="image"
        context={uploadContext}
        onSelect={(media) => editor.chain().focus().setImage({ src: media.url, alt: media.alt_text ?? '' }).run()}
      />

      <MediaPicker
        open={videoPickerOpen}
        onClose={() => setVideoPickerOpen(false)}
        accept="video"
        context={uploadContext}
        onSelect={(media) => editor.commands.setVideo(media.url)}
      />
    </div>
  )
}

export default Toolbar
