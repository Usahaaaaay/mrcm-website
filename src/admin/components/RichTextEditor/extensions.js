import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { VideoNode } from './VideoNode'

export const buildExtensions = ({ placeholder = 'Start writing…' } = {}) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  Link.configure({ openOnClick: false, autolink: true }),
  Image.configure({ HTMLAttributes: { class: 'rounded-2xl' } }),
  VideoNode,
  Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'rounded-2xl mx-auto' } }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Placeholder.configure({ placeholder }),
  CharacterCount,
]
