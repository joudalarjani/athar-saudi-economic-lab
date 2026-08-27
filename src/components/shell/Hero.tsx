import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { formatSAR } from '../../lib/format';

export function Hero() {
  const setStage = useLabStore((s) => s.setStage);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 grid-bg overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-deep/10 rounded-full blur-3xl" />
      </div>

      {/* Top label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 mb-8 text-center"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 glass-panel border-gold/30">
          <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            ATHAR | أثر
          </span>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none"
        >
          <span className="text-ivory">لديك</span>{' '}
          <span className="text-mono gradient-text-gold tabular-nums">
            100,000,000
          </span>
          <br />
          <span className="text-ivory text-4xl md:text-5xl lg:text-6xl">ريال سعودي</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 space-y-4"
        >
          <p className="text-2xl md:text-3xl text-ivory/80 font-light">
            موارد محدودة.
          </p>
          <p className="text-2xl md:text-3xl text-ivory/80 font-light">
            احتياجات أكبر.
          </p>
          <p className="text-3xl md:text-4xl text-gold font-medium mt-6">
            كيف ستختار؟
          </p>
        </motion.div>

        {/* Mission card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="glass-panel terminal-border p-6 text-right">
            <div className="text-[10px] tracking-[0.25em] uppercase text-gold font-mono mb-2">
              Mission Brief
            </div>
            <p className="text-base text-ivory/80 leading-relaxed">
              تخصيص 100 مليون ريال بين سبعة قطاعات للاقتصاد الاجتماعي السعودي.
              قرارك يؤثر على{' '}
              <span className="text-gold">آلاف المستفيدين</span>، يولّد{' '}
              <span className="text-emerald-400">قيمة اجتماعية مضاعفة</span>،
              ويخضع لـ{' '}
              <span className="text-blue-300">مضاعف اقتصادي</span> حقيقي.
            </p>
            <p className="text-sm text-ivory/60 mt-3 leading-relaxed">
              المشروع يفصل بدقة بين SROI (القيمة الاجتماعية) والـMultiplier
              (الأثر السوقي). كلاهما مهم، لكنهما يقيسان أشياء مختلفة.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => setStage('lab')}
            className="group relative px-8 py-4 bg-gold text-midnight-900 font-bold tracking-widest uppercase text-sm hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(199,160,74,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              ENTER THE LAB
              <span className="text-lg">→</span>
            </span>
          </button>
          <div className="text-[10px] text-ivory/40 font-mono tracking-wider">
            مختبر تفاعلي • 3D • بيانات موثقة
          </div>
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mt-20 text-[10px] text-ivory/30 font-mono tracking-wider"
        >
          Simulation based on stated assumptions and available evidence.
          <br />
          Model is open, JSON-driven, auditable.
        </motion.div>
      </div>
    </div>
  );
}
