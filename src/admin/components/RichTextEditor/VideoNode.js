import { Node, mergeAttributes } from '@tiptap/core'

/** Minimal self-closing node for embedding an uploaded (self-hosted) video file. */
export const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'video[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: 'true', class: 'w-full rounded-2xl' })]
  },

  addCommands() {
    return {
      setVideo:
        (src) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { src } }),
    }
  },
})

export default VideoNode
