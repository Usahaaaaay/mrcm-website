import { useRef, useState } from 'react'
import { FileText, Upload, Trash2, ExternalLink } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import Button from '../../../components/ui/Button'
import { supabase, MEDIA_BUCKET } from '../../../lib/supabase'
import { getStoragePath } from '../../lib/storagePaths'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'

const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const ResumeUploader = ({ form, updateFields }) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const toast = useToast()

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Resume must be a PDF file.')
      return
    }
    if (file.size > MAX_RESUME_SIZE_BYTES) {
      toast.error('Resume must be 10MB or smaller.')
      return
    }

    setUploading(true)
    try {
      const path = getStoragePath('about-resume', file.name)
      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { contentType: 'application/pdf' })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)

      updateFields({ resume_url: publicUrl, resume_storage_path: path })
      toast.success('Resume updated — Publish to make it live.')
    } catch (err) {
      logDevError('upload resume', err)
      toast.error(getErrorMessage(err, 'Could not upload resume.'))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (form.resume_storage_path) {
      await supabase.storage.from(MEDIA_BUCKET).remove([form.resume_storage_path]).catch(() => {})
    }
    updateFields({ resume_url: null, resume_storage_path: null })
  }

  return (
    <AboutSectionCard icon={FileText} title="Resume" description="A downloadable PDF shown on the public About section.">
      <div className="flex flex-wrap items-center gap-3">
        {form.resume_url ? (
          <a
            href={form.resume_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-2xl border border-navy/8 bg-cloud/40 px-4 py-2.5 text-sm font-medium text-navy hover:border-lake/30"
          >
            <FileText size={16} className="text-lake" />
            View current resume
            <ExternalLink size={13} className="text-slate/60" />
          </a>
        ) : (
          <p className="text-sm text-slate">No resume uploaded yet.</p>
        )}

        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
        <Button type="button" variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : form.resume_url ? 'Replace' : 'Upload PDF'}
        </Button>
        {form.resume_url ? (
          <Button type="button" variant="danger" icon={Trash2} onClick={handleDelete}>
            Delete
          </Button>
        ) : null}
      </div>
    </AboutSectionCard>
  )
}

export default ResumeUploader
