import { Compass, Hammer, Heart } from 'lucide-react'
import Reveal from '../../components/ui/Reveal'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/ui/SectionTitle'

const principles = [
  {
    icon: Heart,
    title: 'Made for the love of it',
    description:
      "Nothing here exists because a roadmap demanded it. Everything starts as “wouldn't it be fun if...”",
  },
  {
    icon: Hammer,
    title: 'Small, finished, real',
    description:
      'A preference for things that actually ship — a working app over a perfect plan, a rough edge over a stalled idea.',
  },
  {
    icon: Compass,
    title: 'Curiosity first',
    description:
      'New tools, new ideas, new excuses to build something small and see what happens — that curiosity is the whole point.',
  },
]

const StudioAbout = () => (
  <section className="bg-lantern-paper px-6 py-28 sm:px-10">
    <div className="mx-auto max-w-4xl">
      <SectionTitle
        eyebrow="About the studio"
        title="A hobby studio, on purpose"
        description="Little Lantern Studios isn't a company, a product line, or a brand with a growth plan — it's one person's ongoing side project of building things worth making, kept small and lit by curiosity rather than a business case."
        titleAs="h1"
      />

      <Reveal className="mx-auto mb-16 max-w-2xl text-center text-base leading-relaxed text-lantern-ink/70">
        Everything under this roof — the apps, the half-finished projects, the notes about what&rsquo;s currently
        being tinkered with — is made in spare time, for the pleasure of making it. Some of it is polished
        enough to use. Some of it is still just an idea with a name. Both are welcome here.
      </Reveal>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {principles.map(({ icon: Icon, title, description }, i) => (
          <Reveal key={title} delay={i * 0.1}>
            <Card className="flex h-full flex-col gap-4 p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lantern-glow/15 text-lantern-ember">
                <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold text-lantern-ink">{title}</h2>
              <p className="text-sm leading-relaxed text-lantern-ink/70">{description}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)

export default StudioAbout
