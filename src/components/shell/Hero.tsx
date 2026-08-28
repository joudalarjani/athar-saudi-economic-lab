import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { formatNumber } from '../../lib/format';

const SECTOR_ICONS: Record<string, string> = {
  education: '📚',
  health: '🏥',
  housing: '🏘️',
  employment: '💼',
  women: '⚡',
  environment: '🌿',
  hajj: '🕋',
};

const STARS = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.8 + 0.5,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 3,
  opacity: 0.3 + Math.random() * 0.6,
}));

function useCountUp(target: number, duration: number): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function Hero() {
  const setStage = useLabStore((s) => s.setStage);
  const count = useCountUp(TOTAL_BUDGET, 2.5);
  const countStr = useMemo(() => formatNumber(count), [count]);

  return (
    <div className="relative min-h-screen bg-[#0a0e1a] text-[#f0e6d3] overflow-hidden">
      {/* Star field */}
      <div className="absolute inset-0 overflow-hidden">
        {STARS.map((s) => (
          <motion.span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [s.opacity * 0.4, s.opacity, s.opacity * 0.4] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[40rem] h-[40rem] bg-[#d4a017]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col px-6 py-14 max-w-6xl mx-auto">
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-[11px] tracking-[0.4em] text-[#d4a017] uppercase font-mono"
        >
          تجربة اقتصادية تفاعلية
        </motion.div>

        {/* Center counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center mt-auto pt-10"
        >
          <div
            className="font-mono tabular-nums font-bold leading-none text-[#d4a017]"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
          >
            {countStr}
          </div>
          <div className="text-2xl sm:text-3xl text-[#f0e6d3] mt-3 tracking-wide">
            ريال سعودي
          </div>

          {/* Staggered subtitle */}
          <div className="mt-6 flex flex-col items-center gap-1.5 text-[rgba(240,230,211,0.65)]">
            {['موارد محدودة — احتياجات أكبر — كيف ستختار؟'].map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 2.6 + i * 0.25 }}
                className="text-lg sm:text-xl text-center"
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Sector icons */}
          <div className="mt-10 grid grid-cols-4 sm:grid-cols-7 gap-3 w-full max-w-4xl">
            {SECTORS.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3 + i * 0.1 }}
                className="flex flex-col items-center gap-2 rounded-lg px-2 py-3 bg-[#0d1527] border border-[rgba(212,160,23,0.12)] hover:border-[#d4a017] hover:shadow-[0_0_14px_rgba(212,160,23,0.3)] transition-all"
              >
                <div className="text-2xl">{SECTOR_ICONS[s.iconKey] ?? s.iconKey}</div>
                <div className="text-[9px] text-[rgba(240,230,211,0.7)] text-center leading-tight">
                  {s.arName}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 3.9 }}
          onClick={() => setStage('map')}
          className="mx-auto mt-10 cursor-pointer rounded-md px-12 py-4 font-semibold text-[#0a0e1a] tracking-widest uppercase text-sm hover:opacity-95 transition-opacity shadow-[0_0_30px_rgba(212,160,23,0.35)]"
          style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)' }}
        >
          ادخل المختبر — ENTER THE LAB →
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 4.05 }}
          className="text-center text-sm text-[rgba(240,230,211,0.7)] font-light mt-4"
        >
          خصّص 100M SAR بين 7 قطاعات اجتماعية وشاهد الأثر الاقتصادي
        </motion.p>

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 4.2 }}
          className="mt-auto pt-12 flex flex-col-reverse md:flex-row items-center justify-between gap-6"
        >
          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.3 }}
            className="max-w-sm text-right"
          >
            <div className="text-5xl text-[#d4a017] leading-none">“</div>
            <p className="text-lg text-[#f0e6d3]/90 leading-relaxed">
              الأثر لا يُقاس بحجم الاستثمار فقط،
              <br />
              بل بمدى ذكاء القرار
            </p>
          </motion.blockquote>

          <div className="text-center md:text-right">
            <div className="text-3xl font-bold text-[#d4a017] tracking-wide">ATHAR</div>
            <div className="text-2xl font-bold text-[#d4a017] mb-1">أثر</div>
            <div className="text-[10px] text-[rgba(240,230,211,0.5)] tracking-widest uppercase font-mono">
              Saudi Social Investment &amp; Economic Policy Lab
            </div>
          </div>
        </motion.div>

        {/* Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 4.35 }}
          className="flex items-center justify-center gap-2 text-xs text-[rgba(240,230,211,0.6)] mt-6"
        >
          <span>Joud Abdullah Al-Arjani / Economics Student</span>
          <a
            href="https://www.linkedin.com/in/joud-al-arjani"
            target="_blank"
            rel="noreferrer"
            className="text-[#d4a017]/80 hover:text-[#d4a017] font-medium"
          >
            LinkedIn
          </a>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 4.45 }}
          className="text-center text-[9px] text-[rgba(240,230,211,0.35)] font-mono tracking-wider mt-2"
        >
          Simulation based on parameterized assumptions — not financial advice
        </motion.div>
      </div>
    </div>
  );
}
