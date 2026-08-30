import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { formatNumber } from '../../lib/format';
import { CapitalFlow } from '../shared/CapitalFlow';
import { BrandTag } from '../shared/LevelHud';

const SECTOR_ICONS: Record<string, string> = {
  education: '📚',
  health: '🏥',
  housing: '🏘️',
  employment: '💼',
  women: '⚡',
  environment: '🌿',
  hajj: '🕋',
};

function useCountUp(target: number, durationMs: number): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 72;
    const stepValue = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setValue(Math.round(current));
    }, durationMs / steps);
    return () => clearInterval(interval);
  }, [target, durationMs]);
  return value;
}

/** Split a formatted number into character slots for a cinematic digit reveal. */
function useDigitSlots(target: number, durationMs: number): string[] {
  const value = useCountUp(target, durationMs);
  return useMemo(() => formatNumber(value).split(''), [value]);
}

export function Hero() {
  const setStage = useLabStore((s) => s.setStage);
  const allocations = useLabStore((s) => s.allocations);
  const dispatchCta = () => setStage('lab');

  const digits = useDigitSlots(TOTAL_BUDGET, 2600);

  return (
    <div className="relative min-h-screen lux-shell text-[#f0e6d3] overflow-hidden flex flex-col">
      {/* Animated capital-flow network */}
      <div className="absolute inset-0 pointer-events-none">
        <CapitalFlow sectorAllocations={allocations} />
      </div>

      {/* Ambient orbs */}
      <div className="orb" style={{ top: '-10%', left: '10%', width: 420, height: 420, background: '#d4a017' }} />
      <div className="orb" style={{ bottom: '-10%', right: '5%', width: 380, height: 380, background: '#10b981' }} />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(5,7,15,0.85) 100%)' }}
      />

      {/* Brand tag top */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-7">
        <div className="flex items-center gap-3">
          <span className="text-xl text-[#d4a017] leading-none">أثر</span>
          <span className="h-4 w-px bg-[rgba(212,160,23,0.3)]" />
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-[rgba(240,230,211,0.5)]">
            Saudi Social Investment & Economic Policy Lab
          </span>
        </div>
        <BrandTag />
      </div>

      {/* Center stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* LEVEL frame */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="level-hud mb-8"
        >
          <span className="level-num">LEVEL 01</span>
          <span className="level-bar"><span style={{ backgroundColor: '#d4a017' }} /></span>
          <span>ALLOCATE / خصّص</span>
        </motion.div>

        {/* The title — أكبر أثر */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lux-title mb-3 text-center"
          style={{ fontSize: 'clamp(3.2rem, 12vw, 9rem)' }}
        >
          أكبر أثر
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xs sm:text-sm tracking-[0.35em] uppercase font-mono text-[rgba(244,242,236,0.55)]"
        >
          Saudi Social Investment &amp; Economic Policy Lab
        </motion.p>

        {/* The question */}
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-[1.6] max-w-4xl mx-auto"
        >
          إذا كان لديك{' '}
          <span className="lux-title font-bold">100 مليون ريال</span>…
          <br />
          أين تعيد استثمارها لتحقيق{' '}
          <span className="text-[#f4d27a] font-medium">أكبر أثر؟</span>
        </motion.h2>

        {/* The number */}
        <div className="mt-8 flex items-baseline justify-center gap-2 font-mono tabular-nums">
          <span className="lux-big-number flex overflow-hidden" style={{ fontSize: 'clamp(2.8rem, 9vw, 7rem)' }}>
            {digits.map((d, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.035 }}
                className="inline-block"
              >
                {d}
              </motion.span>
            ))}
          </span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4 }}
            className="text-xl sm:text-2xl text-[#f4f2ec]/80 font-light whitespace-nowrap"
          >
            ريال سعودي
          </motion.span>
        </div>

        {/* Sub-line */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.6 }}
          className="mt-6 text-base sm:text-lg text-[rgba(244,242,236,0.65)]"
        >
          اختبر القرار. قارن البدائل. وشاهد كيف يتضاعف الأثر.
        </motion.p>

        {/* Core tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.8 }}
          className="mt-2 text-sm sm:text-base font-mono tracking-wider text-[#f4d27a]/80"
        >
          100 مليون ريال · قرار واحد · احتمالات لا نهائية
        </motion.p>

        {/* Sector chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-2.5 w-full max-w-4xl">
          {SECTORS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.8 + i * 0.08 }}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 lux-glass"
            >
              <span className="text-base">{SECTOR_ICONS[s.iconKey] ?? s.iconKey}</span>
              <span className="text-[10px] text-[rgba(240,230,211,0.7)]">{s.arName}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 3.6 }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          onClick={dispatchCta}
          className="lux-btn mt-12 cursor-pointer"
        >
          <span>ادخل المختبر — ENTER THE LAB</span>
          <span>→</span>
        </motion.button>
      </div>

      {/* Bottom row: quote + attribution */}
      <div className="relative z-10 mt-auto px-6 md:px-10 pb-7">
        <div className="flex flex-col-reverse md:flex-row items-start md:items-end justify-between gap-6">
          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            className="max-w-sm text-right"
          >
            <div className="text-5xl text-[#d4a017] leading-none">“</div>
            <p className="text-lg text-[#f0e6d3]/90 leading-relaxed">
              الأثر لا يُقاس بحجم الاستثمار فقط،
              <br />
              بل بمدى ذكاء القرار
            </p>
          </motion.blockquote>

          <div className="text-left md:text-right">
            <div className="text-sm text-[#d4a017] font-medium">Joud Abdullah Al-Arjani</div>
            <div className="text-[10px] text-[rgba(240,230,211,0.5)] tracking-widest uppercase font-mono">
              Economics Student
            </div>
            <a
              href="https://www.linkedin.com/in/joud-al-arjani"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-1 text-[10px] text-[rgba(212,160,23,0.7)] hover:text-[#d4a017] font-mono"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-[rgba(212,160,23,0.12)] pt-3">
          <div className="text-[9px] text-[rgba(240,230,211,0.35)] font-mono tracking-wider">
            Simulation based on parameterized assumptions — not financial advice
          </div>
          <BrandTag className="hidden md:block" />
        </div>
      </div>
    </div>
  );
}
