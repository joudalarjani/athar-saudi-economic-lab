import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { formatSAR } from '../../lib/format';

const SECTOR_ICONS: Record<string, string> = {
  education: '🎓',
  health: '🏥',
  housing: '🏠',
  employment: '💼',
  women: '👩',
  environment: '🌱',
  hajj: '🕌',
  hajjServices: '🕋',
};

const FEATURES = [
  { icon: '📊', ar: 'تحليل SROI و Multiplier' },
  { icon: '🧪', ar: 'محاكاة صدمات وسيناريوهات' },
  { icon: '🗺️', ar: 'توزيع إقليمي حسب 13 منطقة' },
  { icon: '⚖️', ar: 'توليد تخصيص أمثل موضوعي' },
  { icon: '🎯', ar: 'مراجعة سياقية للمحفظة' },
  { icon: '📄', ar: 'مولّد موجز السياسة (Policy Brief)' },
];

export function Hero() {
  const setStage = useLabStore((s) => s.setStage);

  return (
    <div className="relative min-h-screen px-6 py-20 grid-bg overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-deep/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Top row: branding + capital card */}
        <div className="flex flex-col-reverse md:flex-row md:items-start md:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 glass-panel border-gold/30 w-fit"
          >
            <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
              ATHAR | أثر
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="glass-panel terminal-border p-5 md:w-[320px] relative overflow-hidden"
          >
            <div className="absolute -inset-px bg-gold/20 blur-2xl opacity-40 pointer-events-none" />
            <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 font-mono">
              رأس مالك
            </div>
            <div className="text-3xl md:text-4xl text-gold font-mono tabular-nums mt-2">
              {formatSAR(TOTAL_BUDGET)}
            </div>
            <div className="text-[10px] text-ivory/40 font-mono mt-1">
              100,000,000 ريال سعودي
            </div>
          </motion.div>
        </div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-16 max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-ivory">
            لو كنت المستثمر
            <br />
            الاجتماعي للسعودية
            <span className="text-gold">...</span>
          </h1>
          <p className="text-2xl md:text-3xl text-ivory/70 font-light mt-6">
            كيف ستخصص موارد محدودة لتحقيق أكبر أثر ممكن؟
          </p>
        </motion.div>

        {/* Main grid: features right + quote bottom-left */}
        <div className="grid md:grid-cols-[1fr_320px] gap-8 mt-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-3"
          >
            {FEATURES.map((f) => (
              <div
                key={f.ar}
                className="flex items-center gap-3 glass-panel px-4 py-3"
              >
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm text-ivory/80">{f.ar}</span>
              </div>
            ))}
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="glass-panel terminal-border p-6 text-right"
          >
            <div className="text-gold text-2xl mb-2">“</div>
            <p className="text-lg text-ivory/80 leading-relaxed">
              الأثر لا يُقاس بحجم الاستثمار فقط، بل بمدى ذكاء القرار
            </p>
          </motion.blockquote>
        </div>

        {/* Sector icons row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.75 }}
          className="mt-14"
        >
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/40 font-mono mb-4">
            القطاعات الاجتماعية
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {SECTORS.map((s) => (
              <div
                key={s.id}
                className="glass-panel flex flex-col items-center gap-2 px-2 py-4 text-center"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${s.color}1A`, border: `1px solid ${s.color}55` }}
                >
                  {SECTOR_ICONS[s.iconKey] ?? s.iconKey}
                </div>
                <div className="text-[10px] text-ivory/70 leading-tight">
                  {s.arName}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setStage('lab')}
              className="group relative px-10 py-4 bg-gold text-midnight-900 font-bold tracking-widest uppercase text-sm hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,160,23,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                ENTER THE LAB
                <span className="text-lg">→</span>
              </span>
            </button>
            <div className="text-[10px] text-ivory/40 font-mono tracking-wider">
              مختبر تفاعلي • 3D • بيانات موثقة
            </div>
          </div>
          <p className="text-sm md:text-base text-ivory/70 font-light">
            خصّص 100M SAR بين 7 قطاعات اجتماعية وشاهد الأثر الاقتصادي
          </p>
        </motion.div>

        {/* Footer: disclaimer + attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-16 pt-6 border-t border-gold/15 text-center"
        >
          <div className="text-[10px] text-ivory/40 font-mono tracking-wider leading-relaxed">
            Simulation based on parameterized assumptions — not financial advice
            <br />
            ATHAR | أثر — Saudi Social Investment &amp; Economic Policy Lab
          </div>
          <div className="mt-4 text-xs text-ivory/50">
            Joud Abdullah Al-Arjani / Economics Student
            <span className="mx-2 text-gold/40">•</span>
            <a
              href="https://www.linkedin.com/in/joud-al-arjani"
              target="_blank"
              rel="noreferrer"
              className="text-gold/80 hover:text-gold"
            >
              LinkedIn
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
