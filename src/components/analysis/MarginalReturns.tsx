import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SECTORS } from '../../data/sectors';
import { useLabStore } from '../../state/labStore';
import { TOTAL_BUDGET } from '../../data/sectors';
import { GlossaryTag } from '../shared/GlossaryModal';

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

interface CurveProps {
  color: string;
  lambda: number;
  maxX: number;
  allocation: number;
  icon: string;
  arName: string;
}

/**
 * Diminishing returns curve — Impact = Max × (1 - e^(-λ·x))
 */
function SectorCurve({ color, lambda, maxX, allocation, icon, arName }: CurveProps) {
  const points = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * maxX;
      const y = 1 - Math.exp(-lambda * x);
      pts.push({ x, y });
    }
    return pts;
  }, [lambda, maxX]);

  const W = 200;
  const H = 80;
  const padX = 8;
  const padY = 8;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const toXY = (x: number, y: number) => {
    const px = padX + (x / maxX) * innerW;
    const py = padY + (1 - y) * innerH;
    return [px, py] as const;
  };

  const path = points
    .map((p, i) => {
      const [px, py] = toXY(p.x, p.y);
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');

  const currentY = 1 - Math.exp(-lambda * allocation);
  const [cx, cy] = toXY(allocation, currentY);
  const maxY = 1 - Math.exp(-lambda * maxX);

  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <span className="text-[11px] text-ivory/70 truncate">{arName}</span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* grid lines */}
        {[0, 0.5, 1].map((y) => {
          const [, py] = toXY(0, y);
          return (
            <line
              key={y}
              x1={padX}
              y1={py}
              x2={W - padX}
              y2={py}
              stroke="#f0e6d3"
              strokeOpacity={0.1}
              strokeDasharray="2 3"
            />
          );
        })}
        {/* curve area fill */}
        <path
          d={`${path} L${W - padX},${padY + innerH} L${padX},${padY + innerH} Z`}
          fill={color}
          opacity={0.12}
        />
        {/* curve */}
        <path d={path} fill="none" stroke={color} strokeWidth={2} />
        {/* current allocation marker */}
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={padY + innerH}
          stroke={color}
          strokeOpacity={0.5}
          strokeDasharray="2 2"
        />
        <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="#0a0e1a" strokeWidth={1.5} />
        {/* labels */}
        <text x={padX} y={H - 1} fontSize={6} fill="#f0e6d3" opacity={0.5}>
          {TOTAL_BUDGET / 1_000_000}M
        </text>
        <text x={W - padX - 12} y={padY - 1} fontSize={6} fill="#f0e6d3" opacity={0.5}>
          {(maxY * 100).toFixed(0)}%
        </text>
      </svg>
      <div className="mt-1 flex items-center justify-between text-[9px] text-ivory/50 font-mono">
        <span>أقصى عائد</span>
        <span>{(currentY * 100).toFixed(0)}% الآن</span>
      </div>
    </div>
  );
}

export function MarginalReturns() {
  const allocations = useLabStore((s) => s.allocations);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-panel terminal-border p-6 mt-4"
    >
      <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-1">
        <GlossaryTag id="diminishing">Sector Marginal Returns / العائد الحدي للقطاعات</GlossaryTag>
      </div>
      <p className="text-[11px] text-ivory/50 mb-4">
        العائد يتراجع مع زيادة التخصيص — <GlossaryTag id="opportunity">Impact = Max × (1 − e^(−λ·x))</GlossaryTag>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {SECTORS.map((s) => (
          <SectorCurve
            key={s.id}
            color={s.color}
            lambda={s.diminishingLambda.value}
            maxX={TOTAL_BUDGET}
            allocation={allocations[s.id] ?? 0}
            icon={SECTOR_ICONS[s.iconKey] ?? s.iconKey}
            arName={s.arName}
          />
        ))}
      </div>
    </motion.div>
  );
}
