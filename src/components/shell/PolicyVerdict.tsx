import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { computeVerdict } from '../../engine/verdict';
import { SECTORS } from '../../data/sectors';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { formatSAR, formatNumber } from '../../lib/format';
import { EvidenceBadge } from '../shared/EvidenceBadge';

/** Encode allocations + name into a short shareable hash fragment. */
function encodeShare(allocations: Record<string, number>, name: string): string {
  try {
    const payload = { a: allocations, n: name };
    const json = JSON.stringify(payload);
    return typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : encodeURIComponent(json);
  } catch {
    return '';
  }
}

function decodeShare(hash: string): { allocations: Record<string, number>; name: string } | null {
  try {
    const raw = hash.replace(/^#strategy=/, '');
    const json = typeof atob === 'function' ? decodeURIComponent(escape(atob(raw))) : decodeURIComponent(raw);
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.a === 'object' && parsed.a !== null) {
      return { allocations: parsed.a as Record<string, number>, name: parsed.n || '' };
    }
  } catch {
    /* ignore malformed hashes */
  }
  return null;
}

const DIM_COLOR: Record<string, string> = {
  education: '#d4a017',
  jobs: '#10b981',
  social: '#8b5cf6',
  risk: '#ef4444',
};

export function PolicyVerdict() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const strategyName = useLabStore((s) => s.strategyName);
  const setStrategyName = useLabStore((s) => s.setStrategyName);
  const setAllAllocations = useLabStore((s) => s.setAllAllocations);

  const [copied, setCopied] = useState(false);

  const verdict = useMemo(
    () => computeVerdict(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const metrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const riskDim = verdict.dimensions.find((d) => d.key === 'risk');

  const shareLink = () => `${window.location.origin}${window.location.pathname}#strategy=${encodeShare(allocations, strategyName)}`;

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const downloadPng = () => {
    const W = 1200;
    const H = 780;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0A0E1A';
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createRadialGradient(W / 2, 0, 100, W / 2, 0, W * 0.9);
    grad.addColorStop(0, 'rgba(212,160,23,0.14)');
    grad.addColorStop(1, 'rgba(10,14,26,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Top brand
    ctx.fillStyle = '#d4a017';
    ctx.font = '600 30px "JetBrains Mono", monospace';
    ctx.fillText('ATHAR | أثر', 60, 70);
    ctx.fillStyle = 'rgba(232,233,240,0.45)';
    ctx.font = '18px "JetBrains Mono", monospace';
    ctx.fillText('SOCIAL INVESTMENT POLICY CARD', 60, 100);

    // Name
    ctx.fillStyle = '#f0e6d3';
    ctx.font = '600 46px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillText(strategyName.toUpperCase(), 60, 180);

    ctx.strokeStyle = 'rgba(212,160,23,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 205);
    ctx.lineTo(W - 60, 205);
    ctx.stroke();

    // Overall score big
    ctx.fillStyle = '#d4a017';
    ctx.font = '700 110px "JetBrains Mono", monospace';
    ctx.fillText(String(verdict.overallScore), W - 320, 230);
    ctx.fillStyle = 'rgba(232,233,240,0.55)';
    ctx.font = '20px "JetBrains Mono", monospace';
    ctx.fillText('/ 100 — OVERALL IMPACT', W - 320, 260);

    // Metric grid
    const metricsRows: Array<[string, string]> = [
      ['CAPITAL', formatSAR(metrics.totalBudget, { compact: true })],
      ['JOBS', formatNumber(Math.round(metrics.totalEmployment))],
      ['SOCIAL IMPACT', formatSAR(metrics.totalSocialValue, { compact: true })],
      ['RISK', riskDim ? `${riskDim.score}/100` : '—'],
      ['STRATEGY', verdict.strategyLabel],
      ['BENEFICIARIES', formatNumber(metrics.totalBeneficiaries)],
    ];
    ctx.fillStyle = 'rgba(212,160,23,0.7)';
    ctx.font = '16px "JetBrains Mono", monospace';
    metricsRows.forEach(([k, v], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 90 + col * ((W - 180) / 2);
      const y = 300 + row * 90;
      ctx.fillText(k.toUpperCase(), x, y);
      ctx.fillStyle = '#f0e6d3';
      ctx.font = '24px "JetBrains Mono", monospace';
      ctx.fillText(v, x, y + 34);
      ctx.fillStyle = 'rgba(212,160,23,0.7)';
      ctx.font = '16px "JetBrains Mono", monospace';
    });

    // Dimension bars
    const dims = verdict.dimensions;
    const barY = 610;
    ctx.fillStyle = 'rgba(232,233,240,0.6)';
    ctx.font = '18px "IBM Plex Sans Arabic", sans-serif';
    dims.forEach((d, i) => {
      const x = 90;
      const y = barY + i * 40;
      ctx.fillStyle = 'rgba(232,233,240,0.6)';
      ctx.fillText(d.labelAr, x, y);
      ctx.fillStyle = 'rgba(232,233,240,0.15)';
      ctx.fillRect(320, y - 14, 520, 10);
      ctx.fillStyle = DIM_COLOR[d.key] ?? '#d4a017';
      ctx.fillRect(320, y - 14, (d.score / 100) * 520, 10);
      ctx.fillStyle = '#f0e6d3';
      ctx.font = '18px "JetBrains Mono", monospace';
      ctx.fillText(`${d.score}`, 860, y);
      ctx.fillStyle = 'rgba(232,233,240,0.6)';
      ctx.font = '18px "IBM Plex Sans Arabic", sans-serif';
    });

    // Footer
    ctx.fillStyle = 'rgba(212,160,23,0.6)';
    ctx.font = '600 22px "IBM Plex Sans Arabic", sans-serif';
    ctx.fillText('Joud Abdullah Al-Arjani — Economics Student', 60, 740);
    ctx.fillStyle = 'rgba(232,233,240,0.4)';
    ctx.font = '15px "JetBrains Mono", monospace';
    ctx.fillText('SIMULATION BASED ON STATED ASSUMPTIONS — NOT A FORECAST', 60, 762);

    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `ATHAR-Policy-Card-${new Date().toISOString().split('T')[0]}.png`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel terminal-border p-6 md:p-8 mb-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="text-[10px] tracking-[0.25em] uppercase text-gold font-mono">
          YOUR POLICY VERDICT / الحكم النهائي على استراتيجيتك
        </div>
        <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
      </div>
      <div className="text-xs text-ivory/60 mb-6">
        كل الأرقام محسوبة من النموذج الاقتصادي من واقع تخصيصك — تقييم نسبي تحت افتراضات النموذج (illustrative simulation).
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Overall score */}
        <div className="text-center md:border-l md:border-ivory/10 md:pl-6 md:order-2">
          <div className="lux-big-number text-6xl text-gold font-mono tabular-nums">
            {verdict.overallScore}
          </div>
          <div className="text-[10px] text-ivory/50 font-mono tracking-widest uppercase mt-1">
            / 100 — Overall Impact
          </div>
          <div className="mt-3 inline-block px-3 py-1 text-[10px] font-mono rounded-full border border-gold/40 text-gold-light bg-gold/10">
            {verdict.strategyLabel}
          </div>
        </div>

        {/* Verdict summary */}
        <div className="md:order-1">
          <div className="text-sm text-ivory/90 leading-relaxed">{verdict.tradeOffAr}</div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-gold">▲</span>
              <span>
                <span className="text-ivory/50">أقوى بُعد — </span>
                <span className="text-[#10b981]">{verdict.strongest.labelAr} · {verdict.strongest.score}</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gold">⇄</span>
              <span>
                <span className="text-ivory/50">أكبر مقايضة — </span>
                <span className="text-ivory/90">Risk vs Impact</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gold">→</span>
              <span>
                <span className="text-ivory/50">تعديل مُقترح — </span>
                <span className="text-ivory/90">{verdict.recommendation.reasonAr}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {verdict.dimensions.map((d) => (
          <div key={d.key} className="flex items-center gap-3 text-xs">
            <span className="w-44 shrink-0 text-ivory/70">{d.labelAr}</span>
            <div className="flex-1 h-2 rounded-sm bg-ivory/10 overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${d.score}%`, backgroundColor: DIM_COLOR[d.key] }}
              />
            </div>
            <span className="w-8 text-right font-mono text-ivory/80 tabular-nums">{d.score}</span>
          </div>
        ))}
      </div>

      {/* ATHAR POLICY CARD */}
      <div className="mt-8 pt-6 border-t border-ivory/10">
        <div className="text-[10px] tracking-[0.25em] uppercase text-gold font-mono mb-3">
          SAVE MY STRATEGY — ATHAR POLICY CARD
        </div>
        <div className="lux-glass p-5 md:p-6">
          <label className="text-[10px] text-ivory/40 font-mono">اسم البطاقة / Card name</label>
          <input
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            className="mt-1 mb-4 w-full bg-midnight-800/60 border border-ivory/15 rounded px-3 py-2 text-lg text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold/50"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <CardMetric label="Capital" value={formatSAR(metrics.totalBudget, { compact: true })} />
            <CardMetric label="Impact Score" value={`${verdict.overallScore}`} accent />
            <CardMetric label="Jobs" value={formatNumber(Math.round(metrics.totalEmployment))} />
            <CardMetric label="Social Impact" value={verdict.dimensions.find((d) => d.key === 'social')?.score + '/100'} />
            <CardMetric label="Risk" value={riskDim ? `${riskDim.score}/100` : '—'} />
            <CardMetric label="Strategy" value={verdict.strategyLabel} />
          </div>

          {/* Card actions */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={downloadPng}
              className="px-4 py-2 text-xs font-semibold text-[#0A0E1A] rounded-sm shadow-lg hover:brightness-110 transition"
              style={{ background: 'linear-gradient(135deg, #d4a017 0%, #f0c14b 55%, #ffe08a 100%)' }}
            >
              ⬇ تنزيل البطاقة (PNG)
            </button>
            <button
              onClick={copyShare}
              className="px-4 py-2 text-xs font-mono border border-gold/40 text-gold hover:bg-gold/10 transition rounded-sm"
            >
              {copied ? '✓ تم النسخ' : '🔗 نسخ رابط المشاركة'}
            </button>
            <button
              onClick={() => setStrategyName('Your Strategy • استراتيجيتي')}
              className="px-4 py-2 text-xs font-mono border border-ivory/15 text-ivory/50 hover:text-ivory transition rounded-sm"
            >
              ↻ إعادة التسمية
            </button>
          </div>
          <div className="mt-3 text-[9px] text-ivory/35 font-mono">
            Simulation based on stated assumptions — not a forecast, not investment advice.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CardMetric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[9px] text-ivory/45 font-mono tracking-widest uppercase">{label}</div>
      <div className={`text-lg font-mono tabular-nums mt-0.5 ${accent ? 'text-gold' : 'text-ivory'}`}>{value}</div>
    </div>
  );
}
