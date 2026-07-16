import { useState } from 'react'
import { Settings, X } from 'lucide-react'

/**
 * The explicit accessibility controls: adjustable sensitivity, invert-look,
 * reduced motion. Large touch targets (44px+), readable text, persisted via
 * useJourneySettings (localStorage) so a visitor who needs these doesn't
 * have to re-set them on a future visit.
 */
const SettingsPanel = ({ settings, updateSetting }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Experience settings"
        aria-expanded={open}
        className="absolute z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-alpine/90 text-navy shadow-soft backdrop-blur-sm transition-colors hover:text-lake"
        style={{
          top: 'max(1rem, env(safe-area-inset-top))',
          right: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <Settings size={18} />
      </button>

      {open ? (
        <div
          className="absolute z-20 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-5 rounded-3xl border border-navy/8 bg-alpine/95 p-5 shadow-lift backdrop-blur-sm"
          style={{
            top: 'max(4.5rem, calc(env(safe-area-inset-top) + 3.5rem))',
            right: 'max(1rem, env(safe-area-inset-right))',
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy">Settings</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close settings"
              className="rounded-full p-1.5 text-slate hover:text-navy"
            >
              <X size={16} />
            </button>
          </div>

          <label className="flex flex-col gap-2 text-sm text-navy">
            Camera sensitivity
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.sensitivity}
              onChange={(event) => updateSetting('sensitivity', Number(event.target.value))}
              className="h-8 accent-lake"
            />
          </label>

          <label className="flex min-h-11 items-center justify-between text-sm text-navy">
            Invert look
            <input
              type="checkbox"
              checked={settings.invertLook}
              onChange={(event) => updateSetting('invertLook', event.target.checked)}
              className="h-5 w-5 rounded accent-lake"
            />
          </label>

          <label className="flex min-h-11 items-center justify-between text-sm text-navy">
            Reduced motion
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(event) => updateSetting('reducedMotion', event.target.checked)}
              className="h-5 w-5 rounded accent-lake"
            />
          </label>
        </div>
      ) : null}
    </>
  )
}

export default SettingsPanel
