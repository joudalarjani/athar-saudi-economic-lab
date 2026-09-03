import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SECTORS, type Sector } from '../../data/sectors';
import { useLabStore } from '../../state/labStore';
import { formatSARCompact } from '../../lib/format';

/**
 * ECONOMIC ALLOCATION MATRIX
 *
 * The whole SAR pool is drawn as ONE contiguous economic space that gets
 * subdivided into spatial tiles — one per sector — whose area is exactly
 * proportional to the capital allocated to it. As the user re-allocates,
 * tiles grow/shrink smoothly, so the user is literally reshaping the economy
 * with their decision (not dragging a generic dashboard slider).
 *
 * Thin, subtle "economic connections" run from the central capital source to
 * each tile (proportional to its share) plus a fixed set of sector→sector
 * coupling links, so the 7 tiles read as one interlinked system, not 7 boxes.
 *
 * Pure SVG, data-driven, no glowing pillars.
 */

interface Tile {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  arName: string;
  enName: string;
  color: string;
  share: number;
  amount: number;
}

/** Balanced recursive treemap — near-square spatial tiles, not bars. */
function treemap(
  items: { id: string; value: number }[],
  x: number,
  y: number,
  w: number,
  h: number
): { id: string; x: number; y: number; w: number; h: number }[] {
  const list = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  if (list.length === 0) return items.map((i) => ({ id: i.id, x: 0, y: 0, w: 0, h: 0 }));
  if (list.length === 1) return [{ ...list[0], x, y, w, h }];

  const total = list.reduce((s, i) => s + i.value, 0) || 1;
  // Find the split index that balances the two sub-areas best.
  let sum = 0;
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < list.length; i++) {
    sum += list[i - 1].value;
    const leftArea = (sum / total) * w * h;
    const rightArea = ((total - sum) / total) * w * h;
    const diff = Math.abs(leftArea - rightArea);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  const left = list.slice(0, best);
  const right = list.slice(best);
  const leftSum = left.reduce((s, i) => s + i.value, 0);
  const leftArea = (leftSum / total) * w * h;
  if (w >= h) {
    const leftW = Math.min(w, Math.max(leftArea / h, 0));
    return [
      ...treemap(left, x, y, leftW, h),
      ...treemap(right, x + leftW, y, w - leftW, h),
    ];
  }
  const leftH = Math.min(h, Math.max(leftArea / w, 0));
  return [
    ...treemap(left, x, y, w, leftH),
    ...treemap(right, x, y + leftH, w, h - leftH),
  ];
}

/** Fixed economic couplings (spec 5). */
const COUPLINGS: [string, string][] = [
  ['education', 'employment'],
  ['health', 'employment'],
  ['housing', 'women'],
  ['employment', 'women'],
  ['environment', 'women'],
  ['environment', 'employment'],
];

export function AllocationMatrix({
  interactive = true,
  compact = false,
}: {
  interactive?: boolean;
  compact?: boolean;
}) {
  const allocations = useLabStore((s) => s.allocations);
  const totalBudget = useLabStore((s) => s.totalBudget);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const tiles = useMemo<Tile[]>(() => {
    const areaKeys = SECTORS.map((s) => ({ id: s.id, value: allocations[s.id] ?? 0 }));
    const layout = treemap(areaKeys, 0, 0, 100, 100);
    const total = Object.values(allocations).reduce((s, v) => s + v, 0);
    return layout.map((t) => {
      const sec = SECTORS.find((s) => s.id === t.id) as Sector;
      return {
        ...t,
        arName: sec.arName,
        enName: sec.enName,
        color: sec.color,
        share: total > 0 ? (allocations[t.id] ?? 0) / total : 0,
        amount: allocations[t.id] ?? 0,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocations]);

  const centers = useMemo(() => {
    const map: Record<string, { cx: number; cy: number }> = {};
    for (const t of tiles) map[t.id] = { cx: t.x + t.w / 2, cy: t.y + t.h / 2 };
    return map;
  }, [tiles]);

  const CX = 50;
  const CY = 50;

  return (
    <div className={`relative ${compact ? '' : 'w-full'}`}>
      <svg viewBox="0 0 100 100" className="w-full h-auto block" role="img" aria-label="Economic Allocation Matrix">
        <defs>
          <linearGradient id="am-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0c1526" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#081020" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* The single economic space */}
        <rect x="0.5" y="0.5" width="99" height="99" rx="1" fill="url(#am-bg)" stroke="rgba(212,160,23,0.18)" strokeWidth="0.4" />

        {/* Economic coupling links (fixed, thin, subtle) */}
        {COUPLINGS.map(([a, b]) => {
          const A = centers[a];
          const B = centers[b];
          if (!A || !B) return null;
          return (
            <motion.line
              key={`c-${a}-${b}`}
              x1={A.cx}
              y1={A.cy}
              x2={B.cx}
              y2={B.cy}
              stroke="rgba(212,160,23,0.18)"
              strokeWidth="0.25"
              strokeDasharray="1 1.6"
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          );
        })}

        {/* Capital source → tile flows (proportional to share) */}
        {tiles.map((t) => {
          const c = centers[t.id];
          if (!c || t.share <= 0.001) return null;
          return (
            <motion.line
              key={`f-${t.id}`}
              x1={CX}
              y1={CY}
              x2={c.cx}
              y2={c.cy}
              stroke={t.color}
              strokeWidth={0.1 + t.share * 1.6}
              strokeLinecap="round"
              animate={{ opacity: [0.08, 0.35, 0.08] }}
              transition={{ duration: 2.4 + t.share * 2, repeat: Infinity, ease: 'easeInOut', delay: t.share * 1.5 }}
            />
          );
        })}

        {/* Central capital source */}
        <circle cx={CX} cy={CY} r="1.1" fill="#d4a017" />

        {/* Sector tiles */}
        {tiles.map((t) => {
          const active = selected === t.id || hovered === t.id;
          return (
            <motion.rect
              key={t.id}
              x={t.x + 0.4}
              y={t.y + 0.4}
              width={Math.max(0, t.w - 0.8)}
              height={Math.max(0, t.h - 0.8)}
              rx="0.6"
              fill={`${t.color}2B`}
              stroke={t.color}
              strokeOpacity={active ? 0.95 : 0.45}
              strokeWidth={active ? 0.5 : 0.3}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={() => interactive && setSelected(selected === t.id ? null : t.id)}
              onMouseEnter={() => interactive && setHovered(t.id)}
              onMouseLeave={() => interactive && setHovered(null)}
              initial={false}
              animate={{ fill: `${t.color}${active ? '40' : '2B'}` }}
              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            />
          );
        })}

        {/* Tile labels */}
        {tiles.map((t) => {
          const show = t.w > 7 && t.h > 5;
          if (!show || t.amount <= 0) return null;
          const textBig = t.w > 14 && t.h > 9;
          const color = selected === t.id || hovered === t.id ? '#f4f2ec' : '#9aa7a8';
          return (
            <motion.g
              key={`l-${t.id}`}
              style={{ pointerEvents: 'none' }}
              animate={{ opacity: 1 }}
            >
              {textBig && (
                <text
                  x={t.x + 1.2}
                  y={t.y + (t.h > 11 ? 4.4 : t.h / 2 + 1.2)}
                  fill={color}
                  fontSize={t.h > 16 ? 2.3 : 1.7}
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing="0.05"
                >
                  {t.enName.toUpperCase()}
                </text>
              )}
              <text
                x={t.x + 1.2}
                y={t.y + t.h - 1.6}
                fill="#d4a017"
                fontSize={textBig ? 2.6 : t.h > 5 ? 1.6 : 1.2}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="700"
              >
                {formatSARCompact(t.amount)}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend / rank */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {SECTORS.map((s) => {
          const a = allocations[s.id] ?? 0;
          const share = ((a / Math.max(totalBudget, 1)) * 100).toFixed(1);
          const isSel = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => interactive && setSelected(isSel ? null : s.id)}
              onMouseEnter={() => interactive && setHovered(s.id)}
              onMouseLeave={() => interactive && setHovered(null)}
              className={`flex items-center justify-between gap-2 px-2 py-1 text-left text-[10px] font-mono border-b border-[rgba(255,255,255,0.04)] cursor-pointer transition-colors ${
                isSel ? 'bg-[rgba(212,160,23,0.08)]' : 'hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                <span className="truncate text-[rgba(240,230,211,0.7)]">{s.enName}</span>
              </span>
              <span className="text-[#d4a017] tabular-nums whitespace-nowrap">{share}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
