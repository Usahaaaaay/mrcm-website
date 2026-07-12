import { IdCard } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import { fieldClasses } from './fieldClasses'

const Field = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-navy">{label}</label>
    <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={fieldClasses} />
  </div>
)

const PersonalInfoSection = ({ form, updateFields }) => (
  <AboutSectionCard icon={IdCard} title="Personal Information" description="Contact details and availability shown on the public page.">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Location" value={form.location} onChange={(v) => updateFields({ location: v })} placeholder="Lake Tekapo, New Zealand" />
      <Field label="Email" value={form.email} onChange={(v) => updateFields({ email: v })} placeholder="you@example.com" />
      <Field label="Phone" value={form.phone} onChange={(v) => updateFields({ phone: v })} placeholder="+64 21 000 0000" />
      <Field
        label="Availability"
        value={form.availability}
        onChange={(v) => updateFields({ availability: v })}
        placeholder="Available for freelance"
      />
    </div>
  </AboutSectionCard>
)

export default PersonalInfoSection
