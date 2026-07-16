/**
 * Dismissible instructional card, not a loading screen — the world behind it
 * is already fully rendered and interactive the instant this mounts. Copy is
 * device-aware (see `isTouch`) so instructions always match the controls
 * actually available. Dismissing (tap/click anywhere) is the same gesture
 * that, on desktop, also engages Pointer Lock via the caller's `onDismiss`.
 */
const IntroOverlay = ({ isTouch, onDismiss }) => (
  <div
    className="absolute inset-0 z-10 flex items-center justify-center bg-navy/55 px-6 backdrop-blur-sm"
    onClick={onDismiss}
  >
    <div className="w-full max-w-sm rounded-3xl border border-alpine/10 bg-alpine/95 p-6 text-center shadow-lift sm:max-w-md sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lake">Tekapo Journey</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-navy sm:text-3xl">A peaceful virtual escape</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
        A relaxing virtual experience inspired by Lake Tekapo.
      </p>

      <p className="mt-6 text-sm font-medium text-navy sm:text-base">
        {isTouch ? 'Tap anywhere to begin exploring' : 'Click anywhere to begin exploring'}
      </p>

      <div className="mt-5 flex flex-col gap-2 border-t border-navy/8 pt-5 text-xs text-slate sm:flex-row sm:justify-center sm:gap-8 sm:text-sm">
        <span>
          <strong className="text-navy">Move</strong> Β· {isTouch ? 'Left Joystick' : 'WASD or Arrow Keys'}
        </span>
        <span>
          <strong className="text-navy">Look Around</strong> Β· {isTouch ? 'Drag Right Side' : 'Click and Drag'}
        </span>
      </div>
    </div>
  </div>
)

export default IntroOverlay
