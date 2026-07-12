import { BookOpen } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import RichTextEditor from '../RichTextEditor/Editor'
import { fieldClasses } from './fieldClasses'

const BiographySection = ({ form, updateFields }) => (
  <AboutSectionCard icon={BookOpen} title="Biography" description="Your story, in your own words.">
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-navy">Title</label>
      <input
        value={form.bio_title ?? ''}
        onChange={(e) => updateFields({ bio_title: e.target.value })}
        placeholder="A little about how I got here"
        className={fieldClasses}
      />
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-navy">Subtitle</label>
      <input
        value={form.bio_subtitle ?? ''}
        onChange={(e) => updateFields({ bio_subtitle: e.target.value })}
        placeholder="The short version: I like making things that are useful, beautiful, and built to last."
        className={fieldClasses}
      />
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-navy">Main Content</label>
      <RichTextEditor
        content={form.bio_content}
        uploadContext="general"
        placeholder="Write your story…"
        onChange={(json, meta) => updateFields({ bio_content: json, bio_content_html: meta.html })}
      />
    </div>
  </AboutSectionCard>
)

export default BiographySection
