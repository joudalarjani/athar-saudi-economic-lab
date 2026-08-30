import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { formatSAR, formatNumber, formatPercent } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';

interface Scenario {
  id: string;
  label: string;
  allocation: Record<string, number>;
  note: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'education',
    label: 'سياسة التعليم أولاً',
    allocation: { education: 50e6, employment: 20e6, health: 10e6, housing: 10e6, women: 5e6, environment: 5e6, hajj: 0 },
    note: 'ضخ الأولوية في التعليم لتعظيم العائد الاجتماعي طويل المدى',
  },
  {
    id: 'health',
    label: 'رفع الاستثمار الصحي',
    allocation: { health: 50e6, education: 15e6, employment: 15e6, housing: 10e6, women: 5e6, environment: 5e6, hajj: 0 },
    note: 'تركيز في الصحة لتأثير سريع ومباشر على الرفاه',
  },
  {
    id: 'sme',
    label: 'دعم المنشآت الصغيرة',
    allocation: { employment: 40e6, women: 20e6, education: 15e6, health: 10e6, housing: 5e6, environment: 5e6, hajj: 5e6 },
    note: 'تمكين اقتصادي وريادة أعمال لخلق وظائف',
  },
  {
    id: 'housing',
    label: 'زيادة الاستثمار في الإسكان',
    allocation: { housing: 45e6, education: 15e6, employment: 15e6, health: 10e6, women: 5e6, environment: 5e6, hajj: 5e6 },
    note: 'بنية سكنية تعزز الأثر متعدد الأبعاد',
  },
  {
    id: 'balanced',
    label: 'محفظة متوازنة',
    allocation: { education: 20e6, health: 15e6, housing: 15e6, employment: 20e6, women: 10e6, environment: 10e6, hajj: 10e6 },
    note: 'توزيع متوازن يرفع الإنصاف والمرونة ويخفض المخاطر',
  },
];

function run(sc: Record<string, number>) {
  return computePortfolioMetrics(SECTORS, sc, 0.03, 10);
}

function scaleToBudget(alloc: Record<string, number>, budget: number): Record<string, number> {
  const raw = SECTORS.map((s) => alloc[s.id] ?? 0);
  const sum = raw.reduce((a, b) => a + b, 0);
  if (sum <= 0) return { ...alloc };
  const factor = budget / sum;
  const out: Record<string, number> = {};
  for (const s of SECTORS) out[s.id] = Math.round((alloc[s.id] ?? 0) * factor);
  return out;
}

export function ScenarioLab() {
  const allocations = useLabStore((s) => s.allocations);
  const totalBudget = useLabStore((s) => s.totalBudget);
  const [selected, setSelected] = useState<string>('balanced');

  const scaled = useMemo(
    () => SCENARIOS.map((s) => ({ ...s, allocation: scaleToBudget(s.allocation, totalBudget) })),
    [totalBudget]
  );

  const current = useMemo(() => run(allocations), [allocations]);
  const scenario = scaled.find((s) => s.id === selected)!;
  const after = useMemo(() => run(scenario.allocation), [scenario]);

  const ranked = useMemo(() => {
    const rows = scaled.map((s) => ({ ...s, m: run(s.allocation) }));
    const maxBene = Math.max(...rows.map((r) => r.m.totalBeneficiaries));
    const maxEmp = Math.max(...rows.map((r) => r.m.totalEmployment));
    const maxNpv = Math.max(...rows.map((r) => r.m.npvTotal));
    return rows
      .map((r) => {
        const score =
          0.25 * (r.m.totalBeneficiaries / maxBene) +
          0.25 * (r.m.totalEmployment / maxEmp) +
          0.3 * (r.m.npvTotal / maxNpv) +
          0.2 * r.m.resilienceScore;
        return { ...r, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [scaled]);

  const verdict = ranked[0];

  const metricRows: Array<{ label: string; before: string; after: string }> = [
    { label: 'مستفيدون مباشرون', before: formatNumber(current.totalBeneficiaries), after: formatNumber(after.totalBeneficiaries) },
    { label: 'وظائف', before: formatNumber(current.totalEmployment), after: formatNumber(after.totalEmployment) },
    { label: 'القيمة الاجتماعية', before: formatSAR(current.totalSocialValue, { compact: true }), after: formatSAR(after.totalSocialValue, { compact: true }) },
    { label: 'الأثر المزدوج (NPV)', before: formatSAR(current.npvTotal, { compact: true }), after: formatSAR(after.npvTotal, { compact: true }) },
    { label: 'المرونة', before: formatPercent(current.resilienceScore, 0), after: formatPercent(after.resilienceScore, 0) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel terminal-border p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">ماذا لو؟</div>
        <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
      </div>
      <div className="text-xs text-ivory/60 mb-4">
        What If — جرّب سيناريوهات سياسية وقارنها بمحفظتك الحالية
      </div>

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`px-3 py-1.5 text-xs font-mono rounded-full border transition cursor-pointer ${
              selected === s.id
                ? 'border-gold text-gold-light bg-gold/10'
                : 'border-ivory/15 text-ivory/60 hover:border-gold/40 hover:text-ivory'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Before */}
        <div className="lux-glass p-4">
          <div className="text-[9px] tracking-widest uppercase font-mono text-ivory/40 mb-3">
            قبل — محفظتك الحالية
          </div>
          {metricRows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-1.5 text-xs border-b border-ivory/5">
              <span className="text-ivory/60">{r.label}</span>
              <span className="font-mono text-ivory/80 tabular-nums">{r.before}</span>
            </div>
          ))}
        </div>

        {/* After */}
        <div className="lux-glass p-4 border-gold/30">
          <div className="mb-3">
            <div className="text-[9px] tracking-widest uppercase font-mono text-gold mb-2">
              بعد — {scenario.label}
            </div>
          </div>
          {metricRows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-1.5 text-xs border-b border-ivory/5">
              <span className="text-ivory/60">{r.label}</span>
              <span className="font-mono text-[#10b981] tabular-nums">{r.after}</span>
            </div>
          ))}
          <p className="mt-3 text-[10px] text-ivory/50 leading-relaxed">{scenario.note}</p>
        </div>
      </div>

      {/* Policy Verdict */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 border-t border-gold/15 pt-5"
      >
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono mb-3">
          Policy Verdict / الحكم على السياسة
        </div>
        {ranked.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3 py-1.5 text-xs">
            <span className="w-5 font-mono text-ivory/40">{i + 1}</span>
            <div
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: SECTORS.find((s) => s.id === r.id)?.color ?? '#d4a017' }}
            />
            <span className="flex-1 text-ivory/80">{r.label}</span>
            <span className="w-20 text-[10px] text-ivory/40 font-mono tabular-nums">{formatPercent(r.score, 0)}</span>
          </div>
        ))}
        <div className="mt-4 lux-glass p-4 border-gold/25">
          <div className="text-xs text-ivory/90 leading-relaxed">
            <span className="text-gold-light font-medium">{verdict.label}</span>{' '}
            تحقق أعلى أثر كلي في ظل الافتراضات الحالية — أعلى توازن بين المستفيدين
            والوظائف والقيمة الاجتماعية والمرونة.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
