import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { buildPPFDataset, type PPFPoint } from '../../engine/ppf';
import { formatSAR, formatNumber, formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';
import { LevelHud } from '../shared/LevelHud';
import { StageNav } from '../shared/StageNav';

const VIEW_W = 900;
const VIEW_H = 540;
const PAD_L = 90;
const PAD_R = 40;
const PAD_T = 50;
const PAD_B = 80;

export function PPF() {
  const allocations = useLabStore((s) => s.allocations);
  const setAllAllocations = useLabStore((s) => s.setAllAllocations);
  const setStage = useLabStore((s) => s.setStage);

  const [seed, setSeed] = useState(42);
  const [hoveredPoint, setHoveredPoint] = useState<PPFPoint | null>(null);
  const [showAllPoints, setShowAllPoints] = useState(true);

  const dataset = useMemo(
    () => buildPPFDataset(SECTORS, 100_000_000, allocations, 250, seed),
    [allocations, seed]
  );

  // Scales
  const xScale = (x: number) => {
    const w = VIEW_W - PAD_L - PAD_R;
    return PAD_L + ((x - dataset.minX) / (dataset.maxX - dataset.minX)) * w;
  };

  const yScale = (y: number) => {
    const h = VIEW_H - PAD_T - PAD_B;
    return PAD_T + (1 - (y - dataset.minY) / (dataset.maxY - dataset.minY)) * h;
  };

  // Build smooth frontier path using cardinal spline
  const frontierPath = useMemo(() => {
    if (dataset.frontier.length < 2) return '';
    const pts = dataset.frontier.map((p) => ({
      x: xScale(p.socialValue),
      y: yScale(p.economicImpact),
    }));

    // Use simple smoothing via cubic bezier
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const midX = (p0.x + p1.x) / 2;
      path += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [dataset.frontier, xScale, yScale]);

  // Compute user efficiency (% above/below frontier)
  const userEfficiency = useMemo(() => {
    // Find max economic impact among frontier points with social value <= user's
    const userSv = dataset.userPoint.socialValue;
    const candidate = dataset.frontier
      .filter((p) => p.socialValue <= userSv * 1.05)
      .sort((a, b) => b.economicImpact - a.economicImpact)[0];
    if (!candidate || candidate.economicImpact === 0) return 100;
    return (dataset.userPoint.economicImpact / candidate.economicImpact) * 100;
  }, [dataset]);

  // Apply a portfolio
  const applyPortfolio = (point: PPFPoint) => {
    if (point.isUser || point.isOptimal) return;
    setAllAllocations(point.allocation);
  };

  // Display point (hover or user)
  const displayPoint = hoveredPoint || dataset.userPoint;

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <LevelHud />
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            منحنى إمكانيات الإنتاج
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            The trade-off frontier between Social Value (SROI) and Economic Impact (Multiplier).
            <br />
            <span className="text-ivory/40 text-xs">
              كل نقطة = محفظة مختلفة. الـfrontier = أفضل ما يمكن تحقيقه. أيقونة الاقتصاد.
            </span>
          </p>
        </div>

        {/* Main PPF chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
              SROI Value vs Economic Impact
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAllPoints(!showAllPoints)}
                className={`text-[10px] px-2 py-1 font-mono uppercase border ${
                  showAllPoints
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-ivory/20 text-ivory/60'
                }`}
              >
                {showAllPoints ? 'كل النقاط' : 'الحدود فقط'}
              </button>
              <button
                onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                className="text-[10px] px-2 py-1 font-mono uppercase border border-ivory/20 text-ivory/60 hover:border-ivory/40"
              >
                ↻ New Sample
              </button>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="w-full h-auto"
              style={{ maxHeight: '600px' }}
            >
              {/* Background grid */}
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(199, 160, 74, 0.05)"
                    strokeWidth="1"
                  />
                </pattern>
                <linearGradient id="frontierGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C7A04A" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#FFD580" stopOpacity="1" />
                  <stop offset="100%" stopColor="#C7A04A" stopOpacity="0.3" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

              {/* Axes */}
              <line
                x1={PAD_L}
                y1={VIEW_H - PAD_B}
                x2={VIEW_W - PAD_R}
                y2={VIEW_H - PAD_B}
                stroke="#C7A04A"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <line
                x1={PAD_L}
                y1={PAD_T}
                x2={PAD_L}
                y2={VIEW_H - PAD_B}
                stroke="#C7A04A"
                strokeWidth="1.5"
                opacity="0.6"
              />

              {/* Axis labels */}
              <text
                x={(VIEW_W - PAD_R + PAD_L) / 2}
                y={VIEW_H - PAD_B + 35}
                textAnchor="middle"
                fill="#C7A04A"
                fontSize="12"
                fontFamily="JetBrains Mono, monospace"
                className="uppercase tracking-widest"
              >
                ← SROI Social Value (SAR) →
              </text>
              <text
                transform={`translate(25, ${(VIEW_H - PAD_B + PAD_T) / 2}) rotate(-90)`}
                textAnchor="middle"
                fill="#C7A04A"
                fontSize="12"
                fontFamily="JetBrains Mono, monospace"
                className="uppercase tracking-widest"
              >
                ← Economic Multiplier Impact (SAR) →
              </text>

              {/* Tick labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                const xVal = dataset.minX + p * (dataset.maxX - dataset.minX);
                const yVal = dataset.minY + (1 - p) * (dataset.maxY - dataset.minY);
                return (
                  <g key={p}>
                    <line
                      x1={xScale(xVal)}
                      y1={VIEW_H - PAD_B}
                      x2={xScale(xVal)}
                      y2={VIEW_H - PAD_B + 4}
                      stroke="#C7A04A"
                      opacity="0.4"
                    />
                    <text
                      x={xScale(xVal)}
                      y={VIEW_H - PAD_B + 18}
                      textAnchor="middle"
                      fill="rgba(232, 233, 240, 0.5)"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {formatSAR(xVal, { compact: true })}
                    </text>
                    <line
                      x1={PAD_L - 4}
                      y1={yScale(yVal)}
                      x2={PAD_L}
                      y2={yScale(yVal)}
                      stroke="#C7A04A"
                      opacity="0.4"
                    />
                    <text
                      x={PAD_L - 8}
                      y={yScale(yVal) + 3}
                      textAnchor="end"
                      fill="rgba(232, 233, 240, 0.5)"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {formatSAR(yVal, { compact: true })}
                    </text>
                  </g>
                );
              })}

              {/* Random portfolios (scattered, below frontier) */}
              {showAllPoints &&
                dataset.allPoints.map((p, i) => (
                  <motion.circle
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 0.5, delay: i * 0.002 }}
                    cx={xScale(p.socialValue)}
                    cy={yScale(p.economicImpact)}
                    r="2.5"
                    fill="rgba(199, 160, 74, 0.5)"
                  />
                ))}

              {/* Frontier points (small) */}
              {dataset.frontier.map((p, i) => (
                <motion.circle
                  key={`f-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.01 }}
                  cx={xScale(p.socialValue)}
                  cy={yScale(p.economicImpact)}
                  r="4"
                  fill="#FFD580"
                  stroke="#0A0E1A"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => applyPortfolio(p)}
                />
              ))}

              {/* Frontier curve (smooth line) */}
              {frontierPath && (
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  d={frontierPath}
                  fill="none"
                  stroke="url(#frontierGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
              )}

              {/* User's current point - the star of the show */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.5 }}
              >
                {/* Crosshair lines */}
                <line
                  x1={xScale(dataset.userPoint.socialValue)}
                  y1={PAD_T}
                  x2={xScale(dataset.userPoint.socialValue)}
                  y2={VIEW_H - PAD_B}
                  stroke="#0F6E4F"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />
                <line
                  x1={PAD_L}
                  y1={yScale(dataset.userPoint.economicImpact)}
                  x2={VIEW_W - PAD_R}
                  y2={yScale(dataset.userPoint.economicImpact)}
                  stroke="#0F6E4F"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />

                {/* User point outer ring */}
                <circle
                  cx={xScale(dataset.userPoint.socialValue)}
                  cy={yScale(dataset.userPoint.economicImpact)}
                  r="14"
                  fill="none"
                  stroke="#0F6E4F"
                  strokeWidth="1.5"
                  opacity="0.5"
                />

                {/* User point inner */}
                <circle
                  cx={xScale(dataset.userPoint.socialValue)}
                  cy={yScale(dataset.userPoint.economicImpact)}
                  r="8"
                  fill="#0F6E4F"
                  stroke="#0A0E1A"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Label */}
                <text
                  x={xScale(dataset.userPoint.socialValue) + 18}
                  y={yScale(dataset.userPoint.economicImpact) - 12}
                  fill="#15A578"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                >
                  YOU
                </text>
              </motion.g>

              {/* Hover label */}
              {hoveredPoint && hoveredPoint.id !== 'user' && (
                <g>
                  <circle
                    cx={xScale(hoveredPoint.socialValue)}
                    cy={yScale(hoveredPoint.economicImpact)}
                    r="10"
                    fill="none"
                    stroke="#FFD580"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gold" />
              <span className="text-ivory/70">Pareto Front (best possible)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald" />
              <span className="text-ivory/70">Your Allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gold/40" />
              <span className="text-ivory/70">Random Portfolios</span>
            </div>
          </div>
        </motion.div>

        {/* User point stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-5"
          >
            <div className="text-[10px] tracking-widest uppercase text-emerald-400 font-mono mb-1">
              Social Value
            </div>
            <div className="text-2xl text-emerald-300 font-mono tabular-nums">
              {formatSAR(dataset.userPoint.socialValue, { compact: true })}
            </div>
            <div className="text-[10px] text-ivory/50 mt-1">عائد SROI</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-5"
          >
            <div className="text-[10px] tracking-widest uppercase text-blue-400 font-mono mb-1">
              Economic Impact
            </div>
            <div className="text-2xl text-blue-300 font-mono tabular-nums">
              {formatSAR(dataset.userPoint.economicImpact, { compact: true })}
            </div>
            <div className="text-[10px] text-ivory/50 mt-1">أثر المضاعف</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-5"
          >
            <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-1">
              Frontier Efficiency
            </div>
            <div
              className={`text-2xl font-mono tabular-nums ${
                userEfficiency > 90
                  ? 'text-emerald-400'
                  : userEfficiency > 70
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {userEfficiency.toFixed(0)}%
            </div>
            <div className="text-[10px] text-ivory/50 mt-1">
              {userEfficiency > 90
                ? 'قريب من الحد الأمثل'
                : userEfficiency > 70
                ? 'يمكن تحسينه'
                : 'بعيد عن الكفاءة القصوى'}
            </div>
          </motion.div>
        </div>

        {/* Hover tooltip card */}
        {hoveredPoint && hoveredPoint.id !== 'user' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel terminal-border p-4 mb-6"
          >
            <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
              Frontier Point #{dataset.frontier.indexOf(hoveredPoint) + 1}
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-ivory/60">Social Value:</div>
                <div className="text-emerald-300 font-mono text-lg">
                  {formatSAR(hoveredPoint.socialValue, { compact: true })}
                </div>
                <div className="text-ivory/60 mt-2">Economic Impact:</div>
                <div className="text-blue-300 font-mono text-lg">
                  {formatSAR(hoveredPoint.economicImpact, { compact: true })}
                </div>
                <div className="text-ivory/60 mt-2">Beneficiaries:</div>
                <div className="text-gold font-mono">{formatNumber(hoveredPoint.beneficiaries)}</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-ivory/60 text-[10px] uppercase tracking-wider mb-1">
                  Allocation Breakdown
                </div>
                {SECTORS.map((s) => {
                  const a = hoveredPoint.allocation[s.id] ?? 0;
                  const share = a / 100_000_000;
                  if (share < 0.01) return null;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <div className="flex-1 text-ivory/70 text-[11px]">{s.arName}</div>
                      <div className="font-mono text-ivory/50 text-[10px]">
                        {formatPercent(share, 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => applyPortfolio(hoveredPoint)}
              className="mt-4 w-full py-2 bg-gold/10 border border-gold/40 text-gold text-xs font-mono uppercase tracking-widest hover:bg-gold/20"
            >
              ← Apply this allocation
            </button>
          </motion.div>
        )}

        {/* Economics insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
            Economics Insight
          </div>
          <div className="text-sm text-ivory/80 leading-relaxed space-y-2">
            <p>
              <span className="text-gold font-medium">منحنى PPF</span> يُظهر المفاضلة الجوهرية في الاقتصاد:{' '}
              <span className="text-emerald-300">المزيد من القيمة الاجتماعية</span> يعني{' '}
              <span className="text-blue-300">تضحية في الأثر الاقتصادي السوقي</span> — والعكس صحيح.
            </p>
            <p>
              أي نقطة <span className="text-ivory/60">تحت المنحنى</span> ={' '}
              <span className="text-red-300">محفظة غير كفؤة</span> (يمكنك الحصول على أكثر بنفس الميزانية).
            </p>
            <p>
              أي نقطة <span className="text-gold">على المنحنى</span> ={' '}
              <span className="text-emerald-300">محفظة فعّالة</span> (أفضل ما يمكن).
            </p>
            <p className="text-ivory/60 text-xs">
              حركة على المنحنى = <span className="text-ivory/80">opportunity cost</span> صريح ومُقاس.
            </p>
          </div>
        </motion.div>

        {/* Methodology */}
        <div className="flex items-center gap-2 mb-6 text-[10px] text-ivory/40 font-mono">
          <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
          <span>
            250 Monte Carlo portfolios. SROI from real case studies, multipliers parameterized.
            Click any frontier point to apply.
          </span>
        </div>

        {/* Sequential journey nav */}
        <StageNav />
      </motion.div>
    </div>
  );
}
