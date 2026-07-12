import { Search } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import { fieldClasses } from './fieldClasses'

const SeoSection = ({ form, updateFields }) => (
  <AboutSectionCard icon={Search} title="SEO" description="Metadata for search engines and social link previews.">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-navy">Page Title</label>
        <input
          value={form.seo_title ?? ''}
          onChange={(e) => updateFields({ seo_title: e.target.value })}
          placeholder="About — MRCMalubay"
          className={fieldClasses}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-navy">Slug</label>
        <input
          value={form.seo_slug ?? ''}
          onChange={(e) => updateFields({ seo_slug: e.target.value })}
          placeholder="about"
          className={fieldClasses}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-navy">OpenGraph Title</label>
        <input
          value={form.seo_og_title ?? ''}
          onChange={(e) => updateFields({ seo_og_title: e.target.value })}
          className={fieldClasses}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-navy">Keywords</label>
        <input
          value={form.seo_keywords ?? ''}
          onChange={(e) => updateFields({ seo_keywords: e.target.value })}
          placeholder="developer, photographer, lake tekapo"
          className={fieldClasses}
        />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-navy">Meta Description</label>
      <textarea
        value={form.seo_description ?? ''}
        onChange={(e) => updateFields({ seo_description: e.target.value })}
        rows={2}
        maxLength={300}
        className={`${fieldClasses} resize-none`}
      />
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-navy">OpenGraph Description</label>
      <textarea
        value={form.seo_og_description ?? ''}
        onChange={(e) => updateFields({ seo_og_description: e.target.value })}
        rows={2}
        maxLength={300}
        className={`${fieldClasses} resize-none`}
      />
    </div>
  </AboutSectionCard>
)

export default SeoSection
