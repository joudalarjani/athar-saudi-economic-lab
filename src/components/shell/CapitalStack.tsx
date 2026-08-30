import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { FUNDING_INSTRUMENTS } from '../../data/fundingInstruments';
import { evaluateCapitalStack } from '../../engine/capitalStack';
import { formatPercent } from '../../lib/format';
import { StageNav } from '../shared/StageNav';

export function CapitalStack() {
  const fundingMix = useLabStore((s) => s.fundingMix);
  const setFundingShare = useLabStore((s) => s.setFundingShare);
  const setStage = useLabStore((s) => s.setStage);

  const result = useMemo(
    () => evaluateCapitalStack(FUNDING_INSTRUMENTS, fundingMix),
    [fundingMix]
  );

  const totalMix = result.totalMix;
  // Normalize shares to 0-1
  const normalizedMix = totalMix > 0
    ? Object.fromEntries(
        Object.entries(fundingMix).map(([k, v]) => [k, v / totalMix])
      )
    : {};

  // Stack visual segments
  const segments = FUNDING_INSTRUMENTS.map((inst) => ({
    ...inst,
    share: normalizedMix[inst.id] ?? 0,
  }));

  const hhi = 1 - result.diversification;
  const viabilityRating =
    result.blendedViability > 0.75
      ? 'Excellent'
      : result.blendedViability > 0.6
      ? 'Good'
      : result.blendedViability > 0.45
      ? 'Moderate'
      : 'Weak';

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Stage 08 / Capital Stack
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            هيكل التمويل
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            Build your funding mix. Balance government grants, waqf, impact investment, CSR, and crowdfunding.
          </p>
        </div>

        {/* Stacked bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
            Funding Mix Visualization
          </div>
          <div className="h-12 flex rounded-sm overflow-hidden border border-ivory/20">
            {segments.map((seg) => {
              if (seg.share < 0.01) return null;
              return (
                <div
                  key={seg.id}
                  className="flex items-center justify-center text-[10px] font-mono text-white/90 transition-all"
                  style={{
                    width: `${seg.share * 100}%`,
                    backgroundColor: instrumentColor(seg.id),
                  }}
                  title={`${seg.arName}: ${(seg.share * 100).toFixed(1)}%`}
                >
                  {seg.share > 0.08 && (
                    <span className="truncate px-1">{seg.arName}</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Per-instrument sliders */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Adjust Each Instrument
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {FUNDING_INSTRUMENTS.map((inst) => {
              const value = fundingMix[inst.id] ?? 0;
              const share = normalizedMix[inst.id] ?? 0;
              return (
                <div key={inst.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: instrumentColor(inst.id) }}
                      />
                      <div>
                        <div className="text-sm text-ivory">{inst.arName}</div>
                        <div className="text-[10px] text-ivory/40 font-mono">
                          {inst.enName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gold font-mono tabular-nums">
                        {formatPercent(share, 0)}
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={value}
                    onChange={(e) => setFundingShare(inst.id, parseFloat(e.target.value))}
                    className="w-full h-1 appearance-none cursor-pointer"
                    style={{ accentColor: '#10b981' }}
                  />
                  <div className="text-[9px] text-ivory/40 leading-relaxed">
                    {inst.description}
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[8px] font-mono text-ivory/40">
                    <div>Risk: {(inst.risk * 100).toFixed(0)}%</div>
                    <div>Sustain: {(inst.sustainability * 100).toFixed(0)}%</div>
                    <div>Liq: {(inst.liquidity * 100).toFixed(0)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Blended score */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-4">
            Blended Capital Stack Profile
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <ScoreCard
              label="Blended Viability"
              value={formatPercent(result.blendedViability, 0)}
              color="text-gold"
              hint="0.4×sustainability + 0.25×(1-risk) + 0.2×liquidity + 0.15×(1-govDep)"
            />
            <ScoreCard
              label="Long-term Viability"
              value={viabilityRating}
              color={viabilityRating === 'Excellent' ? 'text-[#10b981]' : viabilityRating === 'Good' ? 'text-gold' : viabilityRating === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}
              hint="تصنيف الاستدامة طويلة الأجل"
            />
            <ScoreCard
              label="Sustainability"
              value={formatPercent(result.sustainabilityScore, 0)}
              color="text-[#10b981]"
            />
            <ScoreCard
              label="Liquidity"
              value={formatPercent(result.liquidityScore, 0)}
              color="text-blue-400"
            />
            <ScoreCard
              label="Gov Dependency"
              value={formatPercent(result.governmentDependency, 0)}
              color={result.governmentDependency > 0.6 ? 'text-red-400' : 'text-yellow-400'}
              hint="High dependency = risk"
            />
          </div>
          <div className="mt-4 text-[10px] text-ivory/40 font-mono">
            Diversification (1-HHI): {formatPercent(result.diversification, 0)} —{" "}
            Dependency Index (HHI): {hhi.toFixed(2)}
          </div>
          <div className="mt-2 text-[10px] text-ivory/40 leading-relaxed">
            هيكل التمويل يؤثر على استدامة المشروع واستقلاليته — مبني على افتراضات نمذجة
            <span className="font-mono text-ivory/30"> (Simulation based on stated assumptions)</span>
          </div>
          <div className="mt-3 text-[9px] font-mono text-gold/50 uppercase text-center" style={{ letterSpacing: '0.3em' }}>
            Joud Al-Arjani
          </div>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
            Examples in Saudi Context / أمثلة من السعودية
          </div>
          <div className="space-y-2">
            {FUNDING_INSTRUMENTS.map((inst) => (
              <div key={inst.id} className="text-xs text-ivory/70">
                <span className="text-gold">•</span>{' '}
                <span className="text-ivory/90">{inst.arName}:</span>{' '}
                {inst.examples.join(' • ')}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sequential journey nav */}
        <StageNav />
      </motion.div>
    </div>
  );
}

function ScoreCard({ label, value, color, hint }: { label: string; value: string; color: string; hint?: string }) {
  return (
    <div className="border border-ivory/10 p-3 rounded-sm">
      <div className="text-[10px] text-ivory/50 font-mono">{label}</div>
      <div className={`text-2xl font-mono tabular-nums mt-1 ${color}`}>{value}</div>
      {hint && <div className="text-[8px] text-ivory/30 mt-1 leading-relaxed">{hint}</div>}
    </div>
  );
}

function instrumentColor(id: string): string {
  const colors: Record<string, string> = {
    government_grants: '#3B82F6',
    waqf: '#10b981',
    social_investment: '#d4a017',
    outcome_finance: '#8b5cf6',
    csr: '#F472B6',
    crowdfunding: '#22C55E',
  };
  return colors[id] ?? '#888';
}
