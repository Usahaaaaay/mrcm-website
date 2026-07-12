import { motion } from 'framer-motion'

const Reveal = ({ children, className = '', delay = 0, y = 24, as = 'div', ...props }) => {
  const MotionComponent = motion[as] ?? motion.div

  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

export default Reveal
