import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { formatNumber, formatSAR } from '../../lib/format';

/** The discrete years the slider maps to (index -> year). */
const YEARS = [0, 1, 3, 5, 10] as const;

/**
 * Per-sector realized share of impact by horizon index.
 * index 0 = year 0 (no impact yet), 1 = y1, 2 = y3, 3 = y5, 4 = y10.
 * Read from the sector's declared TimeProfile.
 */
function sectorTimeline(sectorIndex: number): number[] {
  const s = SECTORS[sectorIndex];
  const { y1, y3, y5, y10 } = s.timeProfile;
  return [0, y1, y3, y5, y10];
}

/**
 * Diminishing returns factor: larger allocations (relative to the capital pool)
 * are less efficient per riyal. Uses the sector's own per-SAR lambda so that
 * the factor saturates toward 1 naturally at these allocation scales.
 */
function diminishingFactor(sectorIndex: number, allocation: number): number {
  const lambda = SECTORS[sectorIndex].diminishingLambda.value;
  return 1 - Math.exp(-lambda * allocation);
}

/** Impact at a given year index for a single funded sector (SAR of welfare value). */
function sectorImpact(sectorIndex: number, allocation: number, yearIndex: number): number {
  const timeline = sectorTimeline(sectorIndex);
  return allocation * SECTORS[sectorIndex].sroiRange.median * timeline[yearIndex] * diminishingFactor(sectorIndex, allocation);
}

export function Timeline() {
  const allocations = useLabStore((s) => s.allocations);
  const [yearIndex, setYearIndex] = useState(4);

  const year = YEARS[yearIndex];

  const rows = useMemo(() => {
    return SECTORS.map((s, i) => {
      const allocation = allocations[s.id] ?? 0;
      return {
        sector: s,
        allocation,
        timeline: sectorTimeline(i),
        impact: sectorImpact(i, allocation, yearIndex),
      };
    });
  }, [allocations, yearIndex]);

  const funded = rows.filter((r) => r.allocation > 0);
  const totalImpact = funded.reduce((s, r) => s + r.impact, 0);
  const maxImpact = Math.max(1, ...rows.map((r) => r.impact));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel terminal-border p-6"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
          Timeline / المسار الزمني
        </div>
        <div className="text-[9px] text-ivory/40 font-mono">Year {year}</div>
      </div>
      <div className="text-xs text-ivory/60 mb-4">
        الأثر المتراكم حسب السنة — اسحب المؤشر لترى كيف ينضج الأثر عبر الزمن
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={YEARS.length - 1}
        step={1}
        value={yearIndex}
        onChange={(e) => setYearIndex(parseInt(e.target.value))}
        aria-label="Timeline year selector"
        className="w-full h-1.5 appearance-none rounded-sm cursor-pointer mb-2"
        style={{
          background: `linear-gradient(to left, #d4a017 0%, #d4a017 ${(yearIndex / (YEARS.length - 1)) * 100}%, #1A2138 ${(yearIndex / (YEARS.length - 1)) * 100}%, #1A2138 100%)`,
          accentColor: '#d4a017',
        }}
      />

      {/* Year markers */}
      <div className="flex justify-between mb-5">
        {YEARS.map((y, i) => (
          <button
            key={y}
            onClick={() => setYearIndex(i)}
            className={`text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm ${
              yearIndex === i
                ? 'text-gold border border-gold/50'
                : 'text-ivory/40 hover:text-ivory/70'
            }`}
          >
            {i === 0 ? 'الآن' : `Y${y}`}
          </button>
        ))}
      </div>

      {/* Sector bars */}
      <div className="space-y-2.5" role="img" aria-label={`تأثير القطاعات في السنة ${year}`}>
        {funded.map((r) => (
          <div key={r.sector.id} className="flex items-center gap-3 text-xs">
            <div
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: r.sector.color }}
            />
            <div className="w-28 md:w-40 text-ivory/70 truncate flex-shrink-0">
              {r.sector.arName}
            </div>
            <div className="flex-1 h-4 bg-midnight-700 rounded-sm overflow-hidden">
              <motion.div
                className="h-full rounded-sm"
                style={{ backgroundColor: r.sector.color }}
                animate={{ width: `${(r.impact / maxImpact) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="w-24 text-right text-ivory/70 font-mono tabular-nums">
              {formatSAR(r.impact, { compact: true })}
            </div>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-4 border-t border-ivory/10">
        <div>
          <div className="text-[10px] text-ivory/50 font-mono">Total Social Value</div>
          <div className="text-xl text-[#10b981] font-mono tabular-nums">
            {formatSAR(totalImpact, { compact: true })}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-ivory/50 font-mono">Sectors Funded</div>
          <div className="text-xl text-gold font-mono tabular-nums">
            {formatNumber(funded.length)} من {SECTORS.length}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-ivory/50 font-mono">Capital Deployed</div>
          <div className="text-xl text-blue-300 font-mono tabular-nums">
            {formatSAR(Object.values(allocations).reduce((s, v) => s + (v || 0), 0), { compact: true })}
          </div>
        </div>
      </div>

      <div className="mt-3 text-[9px] text-ivory/35 leading-relaxed">
        الأثر = الاستثمار × SROI(الوسيط) × تحقق الزمن × عامل التناقص — محاكاة مبنية على افتراضات النموذج (Simulation based on stated assumptions).
      </div>
      <div className="mt-2 text-[9px] font-mono text-gold/50 uppercase" style={{ letterSpacing: '0.3em' }}>
        Joud Al-Arjani
      </div>
    </motion.div>
  );
}
