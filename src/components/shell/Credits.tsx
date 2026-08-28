import { motion } from 'framer-motion';

const GOLD = '#d4a017';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function Credits() {
  return (
    <div className="relative min-h-screen bg-[#0a0e1a] text-[#f0e6d3] flex items-center justify-center px-6 py-16">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl mx-auto flex flex-col items-center text-center"
      >
        {/* Title */}
        <motion.h1
          variants={item}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#d4a017]"
        >
          ATHAR <span className="text-[#d4a017]">|</span> أثر
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="mt-3 text-base sm:text-lg text-[rgba(240,230,211,0.5)] tracking-widest font-mono uppercase"
        >
          Saudi Social Investment &amp; Economic Policy Lab
        </motion.p>

        {/* Quote */}
        <motion.blockquote
          variants={item}
          className="mt-12 text-xl sm:text-2xl md:text-3xl text-[#f0e6d3] leading-[1.8] font-light"
        >
          الاقتصاد ليس مجرد أرقام.
          <br />
          إنه قرارات، ومفاضلات، وتكاليف، وآثار.
        </motion.blockquote>

        {/* English tagline */}
        <motion.div
          variants={item}
          className="mt-6 text-sm text-[rgba(212,160,23,0.65)] font-mono tracking-wider"
        >
          Every allocation is a choice.
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={item}
          className="mt-10 w-40 h-px"
          style={{ backgroundColor: 'rgba(212,160,23,0.2)' }}
        />

        {/* Built by */}
        <motion.div variants={item} className="mt-10 flex flex-col items-center gap-1.5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[rgba(240,230,211,0.45)] font-mono">
            BUILT BY
          </div>
          <div className="text-2xl md:text-3xl font-medium text-[#d4a017]">
            Joud Abdullah Al-Arjani
          </div>
          <div className="text-sm text-[rgba(240,230,211,0.6)]">Economics Student</div>
          <div className="text-xs text-[rgba(240,230,211,0.4)] text-center">
            Imam Mohammad Ibn Saud Islamic University
          </div>
        </motion.div>

        {/* LinkedIn */}
        <motion.div variants={item} className="mt-8">
          <a
            href="https://www.linkedin.com/in/joud-al-arjani"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm tracking-widest font-mono transition-colors"
            style={{
              border: '1px solid #d4a017',
              color: '#d4a017',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212,160,23,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span>LinkedIn</span>
            <span>↗</span>
          </a>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          variants={item}
          className="mt-16 text-center text-[10px] leading-relaxed text-[rgba(240,230,211,0.35)] font-mono"
        >
          Interactive Saudi-Focused Social Investment &amp; Economic Policy Simulation
          <br />
          Simulation based on stated assumptions and available evidence.
        </motion.div>
      </motion.div>
    </div>
  );
}
