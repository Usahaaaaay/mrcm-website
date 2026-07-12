import Card from '../../../components/ui/Card'

const AboutSectionCard = ({ icon: Icon, title, description, action, children }) => (
  <Card className="flex flex-col gap-5 p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lake-50 text-lake">
            <Icon size={18} strokeWidth={1.75} />
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          {description ? <p className="text-xs text-slate">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
    {children}
  </Card>
)

export default AboutSectionCard
