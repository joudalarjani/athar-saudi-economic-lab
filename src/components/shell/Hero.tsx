import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { formatNumber } from '../../lib/format';
import { AllocationMatrix } from '../visual/AllocationMatrix';
import { BrandTag } from '../shared/LevelHud';

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
  const totalBudget = useLabStore((s) => s.totalBudget);
  const setShowModelExplainer = useLabStore((s) => s.setShowModelExplainer);
  const dispatchCta = () => setStage('lab');

  const [logoClicks, setLogoClicks] = useState(0);
  const secret = logoClicks >= 5;

  const digits = useDigitSlots(totalBudget, 2600);

  return (
    <div className="relative min-h-screen lux-shell text-[#f0e6d3] overflow-hidden flex flex-col">
      {/* Fine economic grid backdrop */}
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-60" />

      {/* Ambient orbs — restrained */}
      <div className="orb" style={{ top: '-12%', left: '14%', width: 360, height: 360, background: '#d4a017', opacity: 0.4 }} />
      <div className="orb" style={{ bottom: '-12%', right: '6%', width: 320, height: 320, background: '#10b981', opacity: 0.32 }} />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(5,7,15,0.85) 100%)' }}
      />

      {/* Brand tag top */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-7">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLogoClicks((c) => (secret ? 0 : c + 1))}
            className="text-xl text-[#d4a017] leading-none transition-transform hover:scale-110 cursor-pointer"
            title="أثر"
          >
            أثر
          </button>
          <span className="h-4 w-px bg-[rgba(212,160,23,0.3)]" />
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-[rgba(240,230,211,0.5)]">
            Saudi Social Investment & Economic Policy Lab
          </span>
        </div>
        <BrandTag />
      </div>

      {/* Center stage — two columns: message | allocation matrix */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-10 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full max-w-6xl mx-auto items-center">
          {/* LEFT — the economic question */}
          <div className="text-left lg:text-right" dir="rtl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="level-hud mb-6"
            >
              <span className="level-num">ATHAR</span>
              <span className="level-bar"><span style={{ backgroundColor: '#d4a017' }} /></span>
              <span>أثر</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="lux-title mb-4"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: 1.05 }}
            >
              أين تصنع أكبر أثر؟
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-[10px] tracking-[0.35em] uppercase font-mono text-[#d4a017]/80 mb-5"
              dir="ltr"
            >
              ECONOMIC ALLOCATION ENGINE
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="text-lg sm:text-xl md:text-2xl font-light leading-[1.7] max-w-xl"
            >
              إذا كان لديك{' '}
              <span className="lux-title font-bold">100,000,000 SAR</span>…
              <br />
              كيف تعيد توزيعها لصناعة{' '}
              <span className="text-[#f4d27a] font-medium">أكبر أثر اقتصادي واجتماعي؟</span>
            </motion.h2>

            {/* The number — Western numerals */}
            <div className="mt-7 flex items-baseline gap-2 font-mono tabular-nums" dir="ltr">
              <span className="lux-big-number flex overflow-hidden" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.4rem)' }}>
                {digits.map((d, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.035 }}
                    className="inline-block"
                  >
                    {d}
                  </motion.span>
                ))}
              </span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                className="text-lg sm:text-xl text-[#f4f2ec]/80 font-light whitespace-nowrap"
              >
                SAR
              </motion.span>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.5 }}
              className="mt-6 text-sm sm:text-base text-[rgba(244,242,236,0.65)] max-w-xl"
            >
              أعد تشكيل هذه المساحة بقرارك — تبديل ريال واحد يعيد ترتيب حجم كل قطاع وتأثيره.
            </motion.p>

            {secret && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-xs font-mono text-[#10b981] border border-[#10b981]/30 rounded-full px-4 py-1.5 lux-glass inline-block"
              >
                ◈ &quot;العائد الحقيقي قرارٌ ذكي، لا مبلغٌ كبير.&quot;
              </motion.div>
            )}

            {/* CTAs */}
            <motion.button
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3 }}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
              onClick={dispatchCta}
              className="lux-btn mt-8 cursor-pointer"
            >
              <span>ادخل المختبر — ENTER THE LAB</span>
              <span>→</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModelExplainer(true)}
              className="mt-4 text-[10px] tracking-[0.3em] uppercase font-mono text-[rgba(240,230,211,0.5)] hover:text-[#f4d27a] transition-colors cursor-pointer"
            >
              explore the model — استكشف النموذج ›
            </motion.button>
          </div>

          {/* RIGHT — the Economic Allocation Matrix centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="lux-glass p-5 md:p-6 lux-hairline"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] tracking-[0.3em] uppercase font-mono text-[#d4a017]">
                ECONOMIC ALLOCATION MATRIX
              </div>
              <div className="text-[9px] font-mono text-[rgba(240,230,211,0.4)] uppercase tracking-widest">
                Live · تفاعلي
              </div>
            </div>
            <AllocationMatrix interactive />
          </motion.div>
        </div>
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
