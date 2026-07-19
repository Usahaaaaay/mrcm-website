import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'
import LakeIllustration from '../graphics/LakeIllustration'
import FloatingParticles from '../graphics/FloatingParticles'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const Hero = () => (
  <section
    id="home"
    className="relative flex min-h-[100svh] items-center overflow-hidden bg-navy"
  >
    <LakeIllustration />
    <FloatingParticles />

    <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-28 pb-40 text-center sm:px-10">
      <motion.span
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="mb-6 inline-flex items-center rounded-full border border-alpine/25 bg-alpine/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-alpine/80 backdrop-blur-sm"
      >
        Developer · Photographer · Creator
      </motion.span>

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.15}
        className="text-4xl font-bold leading-[1.1] text-alpine sm:text-5xl md:text-6xl"
      >
        Hi, I&rsquo;m Mae.
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.3}
        className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-alpine/80 sm:text-xl"
      >
        I create meaningful digital experiences, build practical software, capture
        beautiful places, and share stories worth remembering.
      </motion.p>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.45}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Button as="a" href="#portfolio" variant="primary" icon={ArrowRight}>
          Explore My Work
        </Button>
        {/* Blog is now its own route (/blog), not a homepage section — a
            real <Link> rather than the "#id" anchor pattern the other Hero
            buttons use, since there's nothing on this page to scroll to. */}
        <Button
          as={Link}
          to="/blog"
          variant="secondary"
          className="border-alpine/30 text-alpine hover:border-turquoise hover:text-turquoise"
        >
          Read My Blog
        </Button>
      </motion.div>
    </div>

    <motion.a
      href="#about"
      aria-label="Scroll to About section"
      className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-navy/60 transition-colors hover:text-lake"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1 }}
    >
      <span className="text-xs font-medium uppercase tracking-[0.2em]">Scroll</span>
      <motion.span
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown size={18} />
      </motion.span>
    </motion.a>
  </section>
)

export default Hero
