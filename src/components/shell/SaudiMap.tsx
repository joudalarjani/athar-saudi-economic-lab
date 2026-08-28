import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { formatSAR, formatNumber } from '../../lib/format';
import { computePortfolioMetrics } from '../../engine/portfolio';

type CityId = 'riyadh' | 'jeddah' | 'mecca' | 'medina' | 'dammam';

const CITIES: Array<{
  id: CityId;
  ar: string;
  x: number;
  y: number;
  capital?: boolean;
}> = [
  { id: 'medina', ar: 'المدينة المنورة', x: 30, y: 48 },
  { id: 'riyadh', ar: 'الرياض', x: 62, y: 58, capital: true },
  { id: 'dammam', ar: 'الدمام', x: 78, y: 55 },
  { id: 'jeddah', ar: 'جدة', x: 28, y: 62 },
  { id: 'mecca', ar: 'مكة المكرمة', x: 25, y: 67 },
];

// Sector -> cities it pulses
const SECTOR_CITIES: Record<string, { strong?: boolean; cities: CityId[] }> = {
  education: { cities: ['riyadh', 'jeddah', 'medina'] },
  health: { cities: ['riyadh', 'jeddah', 'mecca', 'medina', 'dammam'] },
  housing: { cities: ['riyadh', 'dammam'] },
  employment: { cities: ['riyadh', 'jeddah', 'dammam'] },
  women: { cities: ['riyadh', 'jeddah', 'medina'] },
  environment: { cities: ['jeddah'] },
  hajj: { strong: true, cities: ['mecca', 'medina'] },
};

const CONNECTION_PAIRS: Array<[CityId, CityId]> = [
  ['riyadh', 'jeddah'],
  ['riyadh', 'dammam'],
  ['riyadh', 'medina'],
  ['medina', 'jeddah'],
  ['jeddah', 'mecca'],
  ['medina', 'mecca'],
];

const SAUDI_POLYGON = [
  [31, 38],
  [48, 36],
  [61, 37],
  [73, 40],
  [86, 48],
  [88, 58],
  [79, 70],
  [60, 75],
  [38, 73],
  [22, 71],
  [15, 65],
  [18, 58],
  [17, 51],
  [13, 46],
  [21, 40],
  [26, 38],
];

export function SaudiMap() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const setStage = useLabStore((s) => s.setStage);
  const [hover, setHover] = useState<CityId | null>(null);

  const metrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const cityAllocation = useMemo(() => {
    const map: Record<CityId, { amount: number; active: boolean }> = {
      riyadh: { amount: 0, active: false },
      jeddah: { amount: 0, active: false },
      mecca: { amount: 0, active: false },
      medina: { amount: 0, active: false },
      dammam: { amount: 0, active: false },
    };
    for (const s of SECTORS) {
      const a = allocations[s.id] ?? 0;
      const rel = SECTOR_CITIES[s.id];
      if (!rel) continue;
      for (const cid of rel.cities) {
        map[cid].amount += a;
        if (a > 0) map[cid].active = true;
      }
    }
    return map;
  }, [allocations]);

  const cityCoords = CITIES.reduce((acc, c) => {
    acc[c.id] = { x: c.x, y: c.y };
    return acc;
  }, {} as Record<CityId, { x: number; y: number }>);

  const activeCity = (id: CityId) => cityAllocation[id].active;
  const isHajj = (id: CityId) =>
    cityAllocation[id].amount > 0 && (id === 'mecca' || id === 'medina');

  return (
    <div className="relative min-h-screen bg-[#0a0e1a] text-[#f0e6d3] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => setStage('hero')}
            className="text-xs text-[rgba(240,230,211,0.5)] hover:text-[#d4a017] font-mono"
          >
            ← عودة
          </button>
          <h2 className="text-[#d4a017] uppercase tracking-[0.3em] font-mono text-sm">
            7 قطاعات تصنع الأثر
          </h2>
          <button
            onClick={() => setStage('lab')}
            className="text-xs px-4 py-2 rounded-md text-[#0a0e1a] font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)' }}
          >
            ادخل المختبر →
          </button>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative flex-1 my-8"
        >
          <svg
            viewBox="0 0 100 78"
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Landmass */}
            <polygon
              points={SAUDI_POLYGON.map((p) => p.join(',')).join(' ')}
              fill="rgba(16,185,129,0.04)"
              stroke="rgba(212,160,23,0.35)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Connection lines */}
            {CONNECTION_PAIRS.map(([a, b], i) => {
              const p = cityCoords[a];
              const q = cityCoords[b];
              const active = activeCity(a) || activeCity(b);
              return (
                <line
                  key={`${a}-${b}`}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke="rgba(212,160,23,0.25)"
                  strokeWidth="0.6"
                  strokeDasharray="4 4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from={active ? '60' : '0'}
                    to="0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </line>
              );
            })}

            {/* Pulse rings + nodes */}
            {CITIES.map((c, idx) => {
              const active = activeCity(c.id);
              const hajj = isHajj(c.id);
              const baseR = c.capital ? 10 : 8;
              const r = active ? baseR + (hajj ? 3 : 1.2) : baseR;
              const amt = cityAllocation[c.id].amount;
              return (
                <g key={c.id}>
                  {active && (
                    <>
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={r}
                        fill="none"
                        stroke="rgba(212,160,23,0.5)"
                        strokeWidth="0.7"
                      >
                        <animate
                          attributeName="r"
                          from={r}
                          to={r * 2.5}
                          dur="2s"
                          begin={`${idx * 0.4}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          from="1"
                          to="0"
                          dur="2s"
                          begin={`${idx * 0.4}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={r}
                    fill="#d4a017"
                    stroke="#0a0e1a"
                    strokeWidth="0.5"
                  >
                    <animate
                      attributeName="r"
                      from={r - (active ? 1 : 0)}
                      to={r + (active ? 1.5 : 0)}
                      dur="1.6s"
                      repeatCount="indefinite"
                      values={`${r};${(r + 1.5).toFixed(1)};${r}`}
                    />
                  </circle>
                  {active && (
                    <text
                      x={c.x}
                      y={c.y - r - 2}
                      textAnchor="middle"
                      fill="#d4a017"
                      fontSize="3"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      {formatNumber(amt / 1_000_000)}M
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {hover && (
            <div
              className="pointer-events-none absolute bg-[#0d1527] border border-[rgba(212,160,23,0.3)] px-3 py-1.5 rounded text-sm z-10"
              style={{
                left: `calc(${cityCoords[hover].x}% )`,
                top: `calc(${cityCoords[hover].y * 0.78}% )`,
                transform: 'translate(-50%, -130%)',
              }}
            >
              <div className="text-[#f0e6d3]">
                {CITIES.find((c) => c.id === hover)?.ar}
              </div>
              <div className="text-[#d4a017] font-mono text-xs mt-0.5">
                {formatSAR(cityAllocation[hover].amount)}
              </div>
            </div>
          )}
        </motion.div>

        {/* Below map: regional impact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 grid md:grid-cols-3 gap-4"
        >
          <div className="rounded-lg bg-[#0d1527] border border-[rgba(212,160,23,0.12)] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[rgba(240,230,211,0.4)] font-mono">
              الإجمالي المخصص
            </div>
            <div className="text-2xl text-[#d4a017] font-mono mt-1 font-semibold">
              {formatSAR(metrics.totalBudget, { compact: true })}
            </div>
          </div>
          <div className="rounded-lg bg-[#0d1527] border border-[rgba(212,160,23,0.12)] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[rgba(240,230,211,0.4)] font-mono">
              الأثر الإقليمي
            </div>
            <div className="text-sm text-[rgba(240,230,211,0.7)] mt-1 leading-relaxed">
              {metrics.totalBudget > 0
                ? 'كلما زاد تمويلك لقطاع، تنساب الأموال إلى المدن المرتبطة به وتُظهر نبضها.'
                : 'ابدأ التخصيص في المختبر لتشاهد الأثر على المدن.'}
            </div>
          </div>
          <div className="rounded-lg bg-[#0d1527] border border-[rgba(212,160,23,0.12)] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[rgba(240,230,211,0.4)] font-mono">
              المستفيدون
            </div>
            <div className="text-2xl text-[#10b981] font-mono mt-1 font-semibold">
              {formatNumber(metrics.totalBeneficiaries)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
