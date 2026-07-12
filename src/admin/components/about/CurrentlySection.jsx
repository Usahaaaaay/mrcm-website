import { Radio } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import { fieldClasses } from './fieldClasses'

const fields = [
  { key: 'currently_building', label: 'Currently Building', placeholder: 'My personal website' },
  { key: 'currently_learning', label: 'Learning', placeholder: 'Astrophotography' },
  { key: 'currently_reading', label: 'Reading', placeholder: 'A book title' },
  { key: 'currently_watching', label: 'Watching', placeholder: 'A show' },
  { key: 'currently_listening_to', label: 'Listening To', placeholder: 'An artist or podcast' },
  { key: 'currently_planning', label: 'Planning', placeholder: 'A trip or project' },
]

const CurrentlySection = ({ form, updateFields }) => (
  <AboutSectionCard icon={Radio} title="Currently" description="A quick snapshot of what you're up to right now.">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-navy">{label}</label>
          <input
            value={form[key] ?? ''}
            onChange={(e) => updateFields({ [key]: e.target.value })}
            placeholder={placeholder}
            className={fieldClasses}
          />
        </div>
      ))}
    </div>
  </AboutSectionCard>
)

export default CurrentlySection
