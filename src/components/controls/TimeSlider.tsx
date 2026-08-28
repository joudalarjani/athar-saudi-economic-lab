import { useLabStore } from '../../state/labStore';
import { useMemo } from 'react';
import { SECTORS } from '../../data/sectors';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { formatNumber } from '../../lib/format';
import { motion } from 'framer-motion';

const TIME_MARKERS = [0, 1, 3, 5, 7, 10] as const;

export function TimeSlider() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const currentYear = useLabStore((s) => s.currentYear);
  const setCurrentYear = useLabStore((s) => s.setCurrentYear);

  const metrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const yearData = metrics.timeProfile.years[currentYear] || {
    totalBeneficiaries: 0,
    totalSocialValue: 0,
    totalGdpImpact: 0,
    totalEmployment: 0,
  };

  // Maximum across all years for normalization
  const maxBeneficiaries = Math.max(
    ...metrics.timeProfile.years.map((y) => y.totalBeneficiaries)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel p-5 terminal-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 font-mono">
            Time Machine
          </div>
          <div className="text-lg text-ivory mt-1">محاكي الزمن</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-ivory/50 font-mono">YEAR</div>
          <div className="text-3xl text-gold font-mono tabular-nums">{currentYear}</div>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={horizon}
        step={1}
        value={currentYear}
        onChange={(e) => setCurrentYear(parseInt(e.target.value))}
        className="w-full h-1.5 appearance-none rounded-sm cursor-pointer mb-3"
        style={{
          background: `linear-gradient(to left, #10b981 0%, #10b981 ${(currentYear / horizon) * 100}%, #1A2138 ${(currentYear / horizon) * 100}%, #1A2138 100%)`,
          accentColor: '#10b981',
        }}
      />

      {/* Time markers */}
      <div className="flex justify-between mb-4">
        {TIME_MARKERS.map((y) => (
          <button
            key={y}
            onClick={() => setCurrentYear(y)}
            className={`text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm ${
              currentYear === y
                ? 'text-gold border border-gold/50'
                : 'text-ivory/40 hover:text-ivory/70'
            }`}
          >
            Y{y}
          </button>
        ))}
      </div>

      {/* Year readout */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-ivory/10">
        <div>
          <div className="text-[10px] text-ivory/50 font-mono">Beneficiaries</div>
          <div className="text-xl text-gold font-mono tabular-nums">
            {formatNumber(yearData.totalBeneficiaries)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-ivory/50 font-mono">Social Value</div>
          <div className="text-xl text-[#10b981] font-mono tabular-nums">
            {Math.round(yearData.totalSocialValue / 1_000_000)}M
          </div>
        </div>
        <div>
          <div className="text-[10px] text-ivory/50 font-mono">GDP Impact</div>
          <div className="text-xl text-blue-400 font-mono tabular-nums">
            {Math.round(yearData.totalGdpImpact / 1_000_000)}M
          </div>
        </div>
        <div>
          <div className="text-[10px] text-ivory/50 font-mono">Jobs</div>
          <div className="text-xl text-gold font-mono tabular-nums">
            {Math.round(yearData.totalEmployment)}
          </div>
        </div>
      </div>

      {/* Year progress bar */}
      <div className="mt-3">
        <div className="h-1 bg-midnight-700 rounded-sm overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-l from-gold to-emerald"
            animate={{ width: `${maxBeneficiaries > 0 ? (yearData.totalBeneficiaries / maxBeneficiaries) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="text-[9px] text-ivory/40 mt-1 font-mono">
          {maxBeneficiaries > 0
            ? `${((yearData.totalBeneficiaries / maxBeneficiaries) * 100).toFixed(0)}% of peak impact`
            : '—'}
        </div>
      </div>
    </motion.div>
  );
}
