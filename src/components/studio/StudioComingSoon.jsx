// Shared placeholder for /studio/apps and /studio/projects until Phase 3
// wires these up to real content (studio_items rows, see
// supabase/migrations/0009_studio_content.sql). Intentionally has no data
// dependency of its own.
//
// titleAs: on StudioApps/StudioProjects this is the only content below the
// page's own <h1>, so it needs to be an <h2>. On StudioHome's "Currently lit
// up" section it sits inside a subsection that already has its own <h2>, so
// it needs to be an <h3> there instead — pass titleAs to avoid skipping a
// heading level either way.
const StudioComingSoon = ({ icon: Icon, description, titleAs: TitleTag = 'h2' }) => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-lantern-ink/15 bg-lantern-glow/5 px-6 py-20 text-center">
    {Icon ? (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lantern-glow/15 text-lantern-ember">
        <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
      </span>
    ) : null}
    <TitleTag className="text-base font-semibold text-lantern-ink">Still being lit up</TitleTag>
    {description ? <p className="max-w-sm text-sm text-lantern-ink/70">{description}</p> : null}
  </div>
)

export default StudioComingSoon
