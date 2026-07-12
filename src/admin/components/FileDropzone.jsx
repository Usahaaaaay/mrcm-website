import { useDropzone } from 'react-dropzone'
import { UploadCloud } from 'lucide-react'

const FileDropzone = ({ onFiles, accept, multiple = true, label = 'Drag and drop files here' }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => onFiles(accepted),
    accept,
    multiple,
  })

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        isDragActive ? 'border-lake bg-lake-50' : 'border-navy/15 bg-cloud/60 hover:border-lake/40'
      }`}
    >
      <input {...getInputProps()} />
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lake-50 text-lake">
        <UploadCloud size={22} strokeWidth={1.5} />
      </span>
      <p className="text-sm font-medium text-navy">{label}</p>
      <p className="text-xs text-slate">or click to browse — JPG, PNG, WEBP, MP4, MOV, WEBM</p>
    </div>
  )
}

export default FileDropzone
