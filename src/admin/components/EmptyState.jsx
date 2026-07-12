const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-navy/15 bg-snow/60 px-6 py-16 text-center">
    {Icon ? (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lake-50 text-lake">
        <Icon size={22} strokeWidth={1.5} />
      </span>
    ) : null}
    <h3 className="text-base font-semibold text-navy">{title}</h3>
    {description ? <p className="max-w-sm text-sm text-slate">{description}</p> : null}
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
)

export default EmptyState
