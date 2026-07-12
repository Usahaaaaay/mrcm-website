import { User } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import { fieldClasses } from './fieldClasses'

const Field = ({ label, value, onChange, placeholder, maxLength = 150 }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-navy">{label}</label>
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={fieldClasses}
    />
  </div>
)

const ProfileSection = ({ form, updateFields }) => (
  <AboutSectionCard icon={User} title="Profile" description="The headline facts shown at the top of your About section.">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Full Name" value={form.full_name} onChange={(v) => updateFields({ full_name: v })} placeholder="Sheng Malubay" />
      <Field label="Display Name" value={form.display_name} onChange={(v) => updateFields({ display_name: v })} placeholder="Sheng" />
      <Field label="Job Title" value={form.job_title} onChange={(v) => updateFields({ job_title: v })} placeholder="Software Developer" />
      <Field label="Tagline" value={form.tagline} onChange={(v) => updateFields({ tagline: v })} placeholder="I enjoy building useful things that last." maxLength={200} />
    </div>
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-navy">Short Introduction</label>
      <textarea
        value={form.short_introduction ?? ''}
        onChange={(e) => updateFields({ short_introduction: e.target.value })}
        rows={3}
        maxLength={400}
        placeholder="Software Developer · Photographer · Problem Solver"
        className={`${fieldClasses} resize-none`}
      />
    </div>
  </AboutSectionCard>
)

export default ProfileSection
