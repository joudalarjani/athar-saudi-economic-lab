import { useLabStore } from '../../state/labStore';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { formatSAR, formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';

export function AllocationPanel() {
  const allocations = useLabStore((s) => s.allocations);
  const setAllocation = useLabStore((s) => s.setAllocation);
  const resetAllocations = useLabStore((s) => s.resetAllocations);

  const total = Object.values(allocations).reduce((s, v) => s + v, 0);
  const remaining = TOTAL_BUDGET - total;

  return (
    <div className="glass-panel p-5 terminal-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 font-mono">Capital Allocation</div>
          <div className="text-lg text-ivory mt-1">تخصيص رأس المال</div>
        </div>
        <button
          onClick={resetAllocations}
          className="text-[10px] tracking-widest text-gold/70 hover:text-gold uppercase font-mono"
        >
          ↻ Reset
        </button>
      </div>

      <div className="text-[10px] text-ivory/50 font-mono mb-4 flex justify-between">
        <span>Total: {formatSAR(total, { compact: true })}</span>
        <span className={remaining === 0 ? 'text-[#10b981]' : 'text-yellow-400'}>
          {remaining === 0 ? '✓ Balanced' : `Remaining: ${formatSAR(remaining, { compact: true })}`}
        </span>
      </div>

      <div className="space-y-3">
        {SECTORS.map((sector) => {
          const allocation = allocations[sector.id] ?? 0;
          const share = allocation / TOTAL_BUDGET;
          const minShare = sector.minAllocation / TOTAL_BUDGET;
          const maxShare = sector.maxAllocation / TOTAL_BUDGET;

          return (
            <div key={sector.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: sector.color }}
                  />
                  <div className="text-sm text-ivory truncate">{sector.arName}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-mono text-ivory/70 tabular-nums">
                    {formatSAR(allocation, { compact: true })}
                  </span>
                  <span
                    className="text-[10px] font-mono tabular-nums w-12 text-left"
                    style={{ color: sector.color }}
                  >
                    {formatPercent(share, 1)}
                  </span>
                </div>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min={sector.minAllocation}
                  max={sector.maxAllocation}
                  step={500_000}
                  value={allocation}
                  onChange={(e) => setAllocation(sector.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 appearance-none rounded-sm cursor-pointer"
                  style={{
                    background: `linear-gradient(to left, ${sector.color}40, ${sector.color})`,
                    accentColor: '#10b981',
                  }}
                />
                <div className="flex justify-between mt-0.5 text-[8px] font-mono text-ivory/30">
                  <span>{formatSAR(sector.minAllocation, { compact: true })}</span>
                  <span>{formatSAR(sector.maxAllocation, { compact: true })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-ivory/10">
        <div className="text-[10px] text-ivory/40 font-mono leading-relaxed">
          <div className="flex items-center gap-1 mb-1">
            <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
            <span>كل تخصيص يخضع لـ min/max per sector</span>
          </div>
          <div>Rebalancing تلقائي عند تعديل أي شريحة</div>
        </div>
      </div>
    </div>
  );
}
