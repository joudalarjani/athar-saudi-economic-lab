import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SECTORS } from '../../data/sectors';

/**
 * Animated capital-flow network: 100M SAR (central source) → 7 sectors
 * → beneficiaries → impact. Pure SVG, lightweight, fully decorative.
 * Represents how capital "moves" from Riyal to sectors to impact.
 */
export function CapitalFlow({ sectorAllocations = null }: { sectorAllocations?: Record<string, number> | null }) {
  const cx = 520;
  const cy = 300;

  const nodes = useMemo(() => {
    const total = sectorAllocations ? Object.values(sectorAllocations).reduce((s, v) => s + v, 0) : 0;
    return SECTORS.map((s, i) => {
      const angle = (i / SECTORS.length) * Math.PI * 2 - Math.PI / 2;
      const r = 240;
      return {
        id: s.id,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        color: s.color,
        label: s.arName,
        intensity: sectorAllocations
          ? total > 0
            ? (sectorAllocations[s.id] ?? 0) / total
            : 0
          : 0.35 + 0.3 * ((i % 3) / 2),
      };
    });
  }, [sectorAllocations]);

  return (
    <svg
      viewBox="0 0 1040 600"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity: 0.5 }}
    >
      <defs>
        <radialGradient id="cf-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4a017" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d4a017" stopOpacity="0" />
        </radialGradient>
        <filter id="cf-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Core capital pool */}
      <circle cx={cx} cy={cy} r={150} fill="url(#cf-core)" />
      <motion.circle
        cx={cx}
        cy={cy}
        r={34}
        fill="none"
        stroke="#d4a017"
        strokeWidth="1.5"
        filter="url(#cf-glow)"
        animate={{ r: [30, 44, 30], opacity: [0.8, 0.3, 0.8] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Connections + flows */}
      {nodes.map((n) => (
        <g key={n.id}>
          <line
            x1={cx}
            y1={cy}
            x2={n.x}
            y2={n.y}
            stroke={n.color}
            strokeWidth="0.8"
            opacity="0.28"
          />
          <motion.line
            className="flow-line"
            x1={cx}
            y1={cy}
            x2={n.x}
            y2={n.y}
            stroke={n.color}
            strokeWidth={1 + n.intensity * 2}
            strokeLinecap="round"
            filter="url(#cf-glow)"
            animate={{ opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: 2.4 + n.intensity * 2, repeat: Infinity, delay: n.intensity * 2 }}
          />
        </g>
      ))}

      {/* Sector nodes */}
      {nodes.map((n) => (
        <g key={n.id}>
          <motion.circle
            className="flow-node"
            cx={n.x}
            cy={n.y}
            r={4 + n.intensity * 5}
            fill={n.color}
            filter="url(#cf-glow)"
            animate={{ r: [4 + n.intensity * 4, 6 + n.intensity * 6, 4 + n.intensity * 4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: n.intensity * 2 }}
          />
          <text
            x={n.x}
            y={n.y - 14}
            textAnchor="middle"
            fill="rgba(240,230,211,0.6)"
            fontSize="11"
            fontFamily="'IBM Plex Sans Arabic', sans-serif"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Outer impact ring */}
      <circle
        cx={cx}
        cy={cy}
        r={300}
        fill="none"
        stroke="rgba(212,160,23,0.08)"
        strokeWidth="1"
      />
    </svg>
  );
}
