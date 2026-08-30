import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { runMonteCarlo, type MonteCarloMetric } from '../../engine/monteCarlo';
import { SECTORS } from '../../data/sectors';
import { formatSAR, formatNumber } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';
import { LevelHud } from '../shared/LevelHud';
import { StageNav } from '../shared/StageNav';

const GOLD = '#d4a017';
const METRICS: Array<{ id: MonteCarloMetric; ar: string; en: string }> = [
  { id: 'socialValue', ar: 'القيمة الاجتماعية', en: 'Social Value' },
  { id: 'gdpImpact', ar: 'أثر GDP', en: 'GDP Impact' },
  { id: 'beneficiaries', ar: 'المستفيدون', en: 'Beneficiaries' },
  { id: 'npv', ar: 'NPV المزدوج', en: 'Dual NPV' },
];

const TRIAL_OPTIONS = [500, 2000, 5000];

const fmt = (m: MonteCarloMetric, v: number) =>
  m === 'beneficiaries' ? formatNumber(v) : formatSAR(v, { compact: true });

function Histogram({ values, base, p50, metric }: { values: number[]; base: number; p50: number; metric: MonteCarloMetric }) {
  const W = 720;
  const H = 220;
  const PAD_T = 16;
  const PAD_B = 28;
  const PAD_X = 10;
  const BINS = 28;

  const { buckets, min, max } = useMemo(() => {
    const mn = Math.min(...values);
    const mx = Math.max(...values);
    const span = mx - mn || 1;
    const bins = new Array(BINS).fill(0);
    for (const v of values) {
      const idx = Math.min(BINS - 1, Math.floor(((v - mn) / span) * BINS));
      bins[idx] += 1;
    }
    return { buckets: bins, min: mn, max: mx };
  }, [values]);

  const peaks = Math.max(...buckets, 1);
  const innerW = W - PAD_X * 2;
  const barW = innerW / BINS;
  const clampX = (v: number) => Math.max(PAD_X, Math.min(W - PAD_X, PAD_X + ((v - min) / (max - min || 1)) * innerW));
  const xFor = (v: number) => clampX(v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Bars */}
      {buckets.map((c, i) => {
        const h = (c / peaks) * (H - PAD_T - PAD_B);
        return (
          <rect
            key={i}
            x={PAD_X + i * barW + 1}
            y={H - PAD_B - h}
            width={barW - 2}
            height={h}
            fill={GOLD}
            opacity={0.25 + 0.75 * (c / peaks)}
          />
        );
      })}
      {/* Baseline marker */}
      <line x1={xFor(base)} x2={xFor(base)} y1={PAD_T} y2={H - PAD_B} stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={xFor(base)} y={PAD_T - 4} fontSize={10} fill="#10b981" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
        base
      </text>
      {/* P50 marker */}
      <line x1={xFor(p50)} x2={xFor(p50)} y1={PAD_T} y2={H - PAD_B} stroke="#fff" strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={xFor(p50)} y={H - PAD_B + 14} fontSize={10} fill="#f0e6d3" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
        P50
      </text>
      {/* Axis labels */}
      <text x={PAD_X} y={H - PAD_B + 22} fontSize={10} fill="#f0e6d3" opacity={0.45} fontFamily="JetBrains Mono, monospace">
        {fmt(metric, min)}
      </text>
      <text x={W - PAD_X} y={H - PAD_B + 22} fontSize={10} fill="#f0e6d3" opacity={0.45} textAnchor="end" fontFamily="JetBrains Mono, monospace">
        {fmt(metric, max)}
      </text>
    </svg>
  );
}

export function MonteCarlo() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const totalBudget = useLabStore((s) => s.totalBudget);

  const [metric, setMetric] = useState<MonteCarloMetric>('socialValue');
  const [numTrials, setNumTrials] = useState(2000);
  const [seed, setSeed] = useState(7);
  const [running, setRunning] = useState(false);

  const result = useMemo(
    () => runMonteCarlo(SECTORS, allocations, numTrials, seed, discountRate, horizon),
    [allocations, numTrials, seed, discountRate, horizon]
  );

  const values = useMemo(() => result.trials.map((t) => t[metric]), [result, metric]);
  const p = result.percentiles[metric];
  const base = result.deterministicBase[metric];

  const run = () => {
    setRunning(true);
    window.setTimeout(() => {
      setSeed((s) => s + 1);
      setRunning(false);
    }, 240);
  };

  const dispersion =
    result.cv[metric] > 0.25 ? 'تبديد مرتفع' : result.cv[metric] > 0.12 ? 'تبديد متوسط' : 'تبديد منخفض';

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <LevelHud compact />
          <div className="mt-4 text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Monte-Carlo / محاكاة
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            محاكاة مونت كارلو
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            Not one number — a distribution. Re-run the model thousands of times with uncertain parameters.
          </p>
        </div>

        {/* Controls */}
        <div className="glass-panel terminal-border p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-mono text-ivory/50 mr-2">
                TRIALS /
              </span>
              {TRIAL_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumTrials(n)}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-sm border transition cursor-pointer ${
                    numTrials === n
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-ivory/15 text-ivory/60 hover:border-gold/40'
                  }`}
                >
                  {n >= 1000 ? `${n / 1000}K` : n}
                </button>
              ))}
              <span className="mx-2 text-[10px] text-ivory/30 font-mono">| capital</span>
              <span className="text-[11px] font-mono text-gold">{formatSAR(totalBudget, { compact: true })}</span>
            </div>

            <button
              onClick={run}
              disabled={running}
              className="px-6 py-2.5 text-xs font-semibold text-[#0A0E1A] rounded-sm shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #d4a017 0%, #f0c14b 55%, #ffe08a 100%)' }}
            >
              {running ? 'SIMULATING…' : '▶ RUN SIMULATION / شغّل المحاكاة'}
            </button>
          </div>
        </div>

        {/* Metric selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {METRICS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-wider border transition cursor-pointer ${
                metric === m.id
                  ? 'border-gold text-gold bg-gold/10'
                  : 'border-ivory/15 text-ivory/60 hover:border-ivory/40'
              }`}
            >
              {m.ar} · <span className="opacity-60">{m.en}</span>
            </button>
          ))}
        </div>

        {/* Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
              Outcome Distribution / توزيع النتائج
            </div>
            <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
          </div>
          <p className="text-[11px] text-ivory/50 mb-4">
            {result.numTrials.toLocaleString()} محاكاة — كل محاكاة تختبر SROI داخل نطاقه الحقيقي،
            والمضاعف الاقتصادي مع ضوضاء σ=10%، وتكلفة المستفيد مع σ=8%.
          </p>

          <Histogram values={values} base={base} p50={p.p50} metric={metric} />

          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="lux-glass p-3 text-center">
              <div className="text-[9px] font-mono text-ivory/40">P5 / سيناريو سيئ</div>
              <div className="text-sm text-red-300 font-mono mt-1">{fmt(metric, p.p5)}</div>
            </div>
            <div className="lux-glass p-3 text-center">
              <div className="text-[9px] font-mono text-ivory/40">P50 / الوسيط</div>
              <div className="text-sm text-gold font-mono mt-1">{fmt(metric, p.p50)}</div>
            </div>
            <div className="lux-glass p-3 text-center">
              <div className="text-[9px] font-mono text-ivory/40">P95 / سيناريو جيد</div>
              <div className="text-sm text-emerald-300 font-mono mt-1">{fmt(metric, p.p95)}</div>
            </div>
            <div className="lux-glass p-3 text-center">
              <div className="text-[9px] font-mono text-ivory/40">Mean ± Std</div>
              <div className="text-sm text-ivory font-mono mt-1">{fmt(metric, result.mean[metric])}</div>
              <div className="text-[9px] text-ivory/40 font-mono mt-1">± {fmt(metric, result.std[metric])}</div>
            </div>
            <div className="lux-glass p-3 text-center">
              <div className="text-[9px] font-mono text-ivory/40">حتمي (baseline)</div>
              <div className="text-sm text-blue-300 font-mono mt-1">{fmt(metric, base)}</div>
              <div className="text-[9px] text-ivory/40 font-mono mt-1">CV {result.cv[metric].toFixed(2)} · {dispersion}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px]">
            <span className="text-ivory/60">احتمال «السقوط» تحت خط الأساس:</span>
            <span className="font-mono text-gold">
              P(result {'<'} baseline) = {(result.downsideProbability[metric] * 100).toFixed(1)}%
            </span>
          </div>
        </motion.div>

        {/* Key insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 mb-6"
        >
          <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-2">
            Reading the Distribution / قراءة التوزيع
          </div>
          <div className="text-sm text-ivory/80 leading-relaxed">
            نطاق P5→P95 لهذا المقياس هو{' '}
            <span className="font-mono text-gold">
              {fmt(metric, p.p5)} → {fmt(metric, p.p95)}
            </span>
            . إذا كان الخط القاعدي أعلى من الوسيط، فمحفظتك عرضة لنتائج أسوأ من المتوقع أكثر من
            العكس — تحقق من{' '}
            <span className="text-[#10b981]">تنويع القطاعات</span> لضغط ذيل التوزيع. أي رقم واحد
            (حتى «الأمثل») يكذب — التوزيع هو الحقيقة.
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-ivory/40 font-mono">
            <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
            <span>Seeded PRNG (mulberry32) — reproducible. Not a forecast.</span>
          </div>
        </motion.div>

        <div className="mb-6 text-[9px] font-mono text-gold/50 uppercase text-center" style={{ letterSpacing: '0.3em' }}>
          Joud Al-Arjani
        </div>

        <StageNav />
      </motion.div>
    </div>
  );
}