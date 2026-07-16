import { Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { ArrowLeft } from 'lucide-react'
import World from '../components/tekapoJourney/World'
import IntroOverlay from '../components/tekapoJourney/IntroOverlay'
import SettingsPanel from '../components/tekapoJourney/SettingsPanel'
import VirtualJoystick from '../components/tekapoJourney/VirtualJoystick'
import TouchLookZone from '../components/tekapoJourney/TouchLookZone'
import { InputProvider } from '../input/InputContext'
import { useScrollLock } from '../hooks/useScrollLock'
import { useIsTouchDevice } from '../hooks/useIsTouchDevice'
import { useJourneySettings } from '../hooks/useJourneySettings'

/**
 * A full-bleed experience, deliberately outside MainLayout (same reasoning as
 * /admin bypassing it) — a fixed site header/footer would eat into the view
 * and fight with mouse-look/touch controls. The nav link still lives in the
 * normal site nav for discoverability; this page just doesn't wear that
 * chrome once you're inside it.
 *
 * InputProvider wraps both the Canvas and the DOM overlays (joystick, look
 * zone) rendered below it — every input source, on either side of the Canvas
 * boundary, shares the same context.
 */
const TekapoJourney = () => {
  const containerRef = useRef(null)
  const isTouch = useIsTouchDevice()
  const { settings, updateSetting } = useJourneySettings()
  const [introDismissed, setIntroDismissed] = useState(false)

  useScrollLock(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && document.pointerLockElement) {
        document.exitPointerLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const handleDismissIntro = () => {
    setIntroDismissed(true)
    if (!isTouch) {
      containerRef.current?.querySelector('canvas')?.requestPointerLock()
    }
  }

  return (
    <InputProvider>
      <div
        ref={containerRef}
        className="fixed inset-0 overscroll-none bg-alpine"
        style={{ touchAction: 'none' }}
      >
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, near: 0.1, far: 300 }}>
          <Suspense fallback={null}>
            <World />
          </Suspense>
        </Canvas>

        {isTouch ? (
          <>
            <VirtualJoystick />
            <TouchLookZone />
          </>
        ) : null}

        <SettingsPanel settings={settings} updateSetting={updateSetting} />

        <Link
          to="/"
          className="absolute inline-flex items-center gap-1.5 rounded-full bg-alpine/90 px-4 py-2 text-sm font-medium text-navy shadow-soft backdrop-blur-sm transition-colors hover:text-lake"
          style={{
            left: 'max(1rem, env(safe-area-inset-left))',
            top: 'max(1rem, env(safe-area-inset-top))',
          }}
        >
          <ArrowLeft size={15} /> Back to site
        </Link>

        {!introDismissed ? <IntroOverlay isTouch={isTouch} onDismiss={handleDismissIntro} /> : null}
      </div>
    </InputProvider>
  )
}

export default TekapoJourney
