import { useEffect, useRef, useState } from 'react'
import {
  User,
  Image as ImageIcon,
  BookOpen,
  IdCard,
  Sparkles,
  Wrench,
  Share2,
  FileText,
  BarChart3,
  Radio,
  Heart,
  PartyPopper,
  History,
  Search,
  Save,
  UploadCloud,
  RotateCcw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAboutDraft } from '../hooks/useAboutDraft'
import UnsavedChangesGuard from '../components/about/UnsavedChangesGuard'
import Button from '../../components/ui/Button'
import ProfileSection from '../components/about/ProfileSection'
import ProfilePhotoUploader from '../components/about/ProfilePhotoUploader'
import BiographySection from '../components/about/BiographySection'
import PersonalInfoSection from '../components/about/PersonalInfoSection'
import SkillsSection from '../components/about/SkillsSection'
import TechnologiesSection from '../components/about/TechnologiesSection'
import SocialLinksSection from '../components/about/SocialLinksSection'
import ResumeUploader from '../components/about/ResumeUploader'
import StatisticsSection from '../components/about/StatisticsSection'
import CurrentlySection from '../components/about/CurrentlySection'
import InterestsSection from '../components/about/InterestsSection'
import FunFactsSection from '../components/about/FunFactsSection'
import TimelineSection from '../components/about/TimelineSection'
import SeoSection from '../components/about/SeoSection'
import { useToast } from '../hooks/useToast'

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'photo', label: 'Profile Photo', icon: ImageIcon },
  { id: 'biography', label: 'Biography', icon: BookOpen },
  { id: 'personal', label: 'Personal Info', icon: IdCard },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'technologies', label: 'Technologies', icon: Wrench },
  { id: 'social', label: 'Social Links', icon: Share2 },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'currently', label: 'Currently', icon: Radio },
  { id: 'interests', label: 'Interests', icon: Heart },
  { id: 'funFacts', label: 'Fun Facts', icon: PartyPopper },
  { id: 'timeline', label: 'Timeline', icon: History },
  { id: 'seo', label: 'SEO', icon: Search },
]

const AboutEditor = () => {
  const draft = useAboutDraft()
  const toast = useToast()
  const [publishing, setPublishing] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const headerRef = useRef(null)
  // Real, measured header height — not a guess. Drives both the section nav's
  // sticky offset and every section's scroll-margin-top, so an anchor-nav jump
  // (or any scroll-into-view) never lands a section underneath the sticky
  // header. ResizeObserver catches both content changes (status line length)
  // and viewport-width changes (the header can wrap via flex-wrap).
  const [headerHeight, setHeaderHeight] = useState(80)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    // top: -2rem (see className below) sticks the header flush with <main>'s
    // true border edge instead of its padding-box edge, so the header's own
    // box now covers <main>'s top padding itself — no separate padding term
    // needed here anymore.
    const measure = () => {
      setHeaderHeight(el.offsetHeight)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await draft.publish()
      toast.success('Published — live on the site now.')
    } catch {
      toast.error('Could not publish changes.')
    } finally {
      setPublishing(false)
    }
  }

  const handleDiscard = async () => {
    setDiscarding(true)
    try {
      await draft.discard()
      toast.success('Reverted to the published version.')
    } catch {
      toast.error('Could not discard changes.')
    } finally {
      setDiscarding(false)
    }
  }

  if (draft.loadError) {
    return (
      <p className="text-sm text-red-600">
        Could not load the About Me document: {draft.loadError.message ?? 'unknown error'}. Make sure migration
        0005_about.sql has been run against this Supabase project.
      </p>
    )
  }

  if (draft.loading || !draft.form) {
    return <p className="text-sm text-slate">Loading…</p>
  }

  return (
    <div
      className="flex flex-col gap-6 pb-16"
      style={{ '--about-header-height': `${headerHeight}px` }}
    >
      <UnsavedChangesGuard when={draft.dirty} />

      <div
        ref={headerRef}
        className="sticky -top-8 z-10 -mx-6 flex flex-wrap items-center justify-between gap-4 border-b border-navy/8 bg-cloud/90 px-6 py-4 backdrop-blur-md sm:-mx-10 sm:px-10"
      >
        <div>
          <h1 className="text-xl font-semibold text-navy">About Me</h1>
          <p className="mt-0.5 text-xs text-slate">
            {draft.saveState === 'saving' && 'Saving…'}
            {draft.saveState !== 'saving' && draft.dirty && 'Unsaved changes'}
            {draft.saveState !== 'saving' && !draft.dirty && draft.lastSavedAt && (
              <>Last saved {formatDistanceToNow(new Date(draft.lastSavedAt), { addSuffix: true })}</>
            )}
            {draft.publishedAt ? (
              <> · Published {formatDistanceToNow(new Date(draft.publishedAt), { addSuffix: true })}</>
            ) : (
              <> · Not published yet</>
            )}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="ghost" icon={RotateCcw} onClick={handleDiscard} disabled={discarding}>
            Discard
          </Button>
          <Button variant="secondary" icon={Save} onClick={() => draft.save()} disabled={!draft.dirty}>
            Save Draft
          </Button>
          <Button icon={UploadCloud} onClick={handlePublish} disabled={publishing}>
            {publishing ? 'Publishing…' : 'Publish Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="hidden h-fit flex-col gap-1 rounded-3xl border border-navy/8 bg-snow p-3 shadow-soft lg:sticky lg:flex lg:top-[calc(var(--about-header-height)+1rem)]">
          {sections.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#about-${id}`}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate transition-colors hover:bg-cloud hover:text-navy"
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-6">
          <section id="about-profile" className="scroll-mt-[var(--about-header-height)]">
            <ProfileSection form={draft.form} updateFields={draft.updateFields} />
          </section>
          <section id="about-photo" className="scroll-mt-[var(--about-header-height)]">
            <ProfilePhotoUploader form={draft.form} updateFields={draft.updateFields} />
          </section>
          <section id="about-biography" className="scroll-mt-[var(--about-header-height)]">
            <BiographySection form={draft.form} updateFields={draft.updateFields} />
          </section>
          <section id="about-personal" className="scroll-mt-[var(--about-header-height)]">
            <PersonalInfoSection form={draft.form} updateFields={draft.updateFields} />
          </section>
          <section id="about-skills" className="scroll-mt-[var(--about-header-height)]">
            <SkillsSection />
          </section>
          <section id="about-technologies" className="scroll-mt-[var(--about-header-height)]">
            <TechnologiesSection />
          </section>
          <section id="about-social" className="scroll-mt-[var(--about-header-height)]">
            <SocialLinksSection />
          </section>
          <section id="about-resume" className="scroll-mt-[var(--about-header-height)]">
            <ResumeUploader form={draft.form} updateFields={draft.updateFields} />
          </section>
          <section id="about-statistics" className="scroll-mt-[var(--about-header-height)]">
            <StatisticsSection />
          </section>
          <section id="about-currently" className="scroll-mt-[var(--about-header-height)]">
            <CurrentlySection form={draft.form} updateFields={draft.updateFields} />
          </section>
          <section id="about-interests" className="scroll-mt-[var(--about-header-height)]">
            <InterestsSection />
          </section>
          <section id="about-funFacts" className="scroll-mt-[var(--about-header-height)]">
            <FunFactsSection />
          </section>
          <section id="about-timeline" className="scroll-mt-[var(--about-header-height)]">
            <TimelineSection />
          </section>
          <section id="about-seo" className="scroll-mt-[var(--about-header-height)]">
            <SeoSection form={draft.form} updateFields={draft.updateFields} />
          </section>
        </div>
      </div>
    </div>
  )
}

export default AboutEditor
