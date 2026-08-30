import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { computePortfolioMetrics } from '../../engine/portfolio';
import { critiquePortfolio } from '../../engine/critique';
import { evaluateCapitalStack } from '../../engine/capitalStack';
import { buildPPFDataset } from '../../engine/ppf';
import { runSensitivity } from '../../engine/sensitivity';
import { FUNDING_INSTRUMENTS } from '../../data/fundingInstruments';
import { SECTORS } from '../../data/sectors';
import { formatSAR, formatMultiplier, formatNumber, formatPercent, formatSROIRange } from '../../lib/format';
import { jsPDF } from 'jspdf';
import { PolicyVerdict } from './PolicyVerdict';

export function Brief() {
  const allocations = useLabStore((s) => s.allocations);
  const discountRate = useLabStore((s) => s.discountRate);
  const horizon = useLabStore((s) => s.horizon);
  const fundingMix = useLabStore((s) => s.fundingMix);
  const setStage = useLabStore((s) => s.setStage);
  const resetProgress = useLabStore((s) => s.resetProgress);
  const totalBudget = useLabStore((s) => s.totalBudget);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(
    () => computePortfolioMetrics(SECTORS, allocations, discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const critique = useMemo(
    () => critiquePortfolio(SECTORS, allocations),
    [allocations]
  );

  const funding = useMemo(
    () => evaluateCapitalStack(FUNDING_INSTRUMENTS, fundingMix),
    [fundingMix]
  );

  const ppf = useMemo(
    () => buildPPFDataset(SECTORS, totalBudget, allocations, 300, 7),
    [allocations]
  );

  const sensBars = useMemo(
    () => runSensitivity(SECTORS, allocations, 'socialValue', discountRate, horizon),
    [allocations, discountRate, horizon]
  );

  const userEfficiency = useMemo(() => {
    const userSv = ppf.userPoint.socialValue;
    const candidate = ppf.frontier
      .filter((p) => p.socialValue <= userSv * 1.05)
      .sort((a, b) => b.economicImpact - a.economicImpact)[0];
    if (!candidate || candidate.economicImpact === 0) return 100;
    return (ppf.userPoint.economicImpact / candidate.economicImpact) * 100;
  }, [ppf]);

  const topSensitive = sensBars.slice(0, 2);

  const generatePDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const width = doc.internal.pageSize.getWidth();
    const margin = 48;
    let y = 60;
    const lineH = 15;

    const header = () => {
      doc.setFontSize(18);
      doc.setTextColor(212, 160, 23);
      doc.text('ATHAR | أثر', margin, y);
      y += 18;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Saudi Social Investment Policy Brief', margin, y);
      y += 14;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toISOString().split('T')[0]}`, margin, y);
      y += 22;
    };
    const ensure = (extra = 60) => {
      if (y > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        y = 60;
      }
      y += extra;
    };
    const section = (title: string) => {
      ensure();
      doc.setFontSize(13);
      doc.setTextColor(212, 160, 23);
      doc.text(title, margin, y);
      y += 8;
      doc.setDrawColor(212, 160, 23);
      doc.setLineWidth(1);
      doc.line(margin, y, width - margin, y);
      y += 16;
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
    };
    const kv = (k: string, v: string) => {
      doc.text(k, margin, y);
      doc.text(v, width - margin - doc.getTextWidth(v), y, { align: 'right' });
      y += lineH;
    };

    header();

    section('01 / Executive Summary');
    doc.setFontSize(10);
    kv('Total Budget', formatSAR(metrics.totalBudget, { compact: true }));
    kv('Beneficiaries', formatNumber(metrics.totalBeneficiaries));
    kv('Social Value (SROI)', formatSAR(metrics.totalSocialValue, { compact: true }));
    kv('GDP Impact', formatSAR(metrics.totalGdpImpact, { compact: true }));

    section('02 / Allocation');
    SECTORS.forEach((s) => {
      kv(s.arName, formatSAR(allocations[s.id] ?? 0, { compact: true }));
    });

    section('03 / Expected Impact');
    kv('SROI (Social)', formatSROIRange(metrics.portfolioSROIMin, metrics.portfolioSROIMax));
    kv('Multiplier (Market)', formatMultiplier(metrics.portfolioMultiplier));
    kv('Jobs Created', formatNumber(Math.round(metrics.totalEmployment)));
    kv('NPV', formatSAR(metrics.npvTotal, { compact: true }));

    section('04 / Risk & Sustainability');
    kv('Resilience Score', formatPercent(metrics.resilienceScore, 0));
    kv('Health Score', formatPercent(critique.healthScore, 0));

    section('07 / Funding Structure');
    if (funding.totalMix > 0) {
      kv('Sustainability', formatPercent(funding.sustainabilityScore, 0));
      kv('Risk', formatPercent(funding.riskScore, 0));
      kv('Viability', formatPercent(funding.blendedViability, 0));
      kv('Dependency', formatPercent(funding.governmentDependency, 0));
    } else {
      doc.text('not specified', margin, y);
      y += lineH;
    }

    section('09 / PPF Position');
    kv('Social Value', formatSAR(ppf.userPoint.socialValue, { compact: true }));
    kv('Economic Impact', formatSAR(ppf.userPoint.economicImpact, { compact: true }));
    kv('Frontier Efficiency', `${userEfficiency.toFixed(0)}%`);

    section('10 / Sensitivity Summary');
    topSensitive.forEach((b) => {
      kv(b.parameterAr, formatSAR(b.range, { compact: true }));
    });

    section('Recommendations');
    (critique.critiques.length ? critique.critiques.slice(0, 5) : []).forEach((c) => {
      doc.setFontSize(9.5);
      doc.text(`- ${c.titleAr}`, margin, y);
      y += lineH - 2;
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 40;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Simulation based on stated assumptions. Not a forecast. Not investment advice.', margin, footerY);
    doc.setFontSize(10);
    doc.setTextColor(212, 160, 23);
    doc.text('Joud Abdullah Al-Arjani — Economics Student', margin, footerY + 16);

    doc.save(`ATHAR-Policy-Brief-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const copyBrief = async () => {
    const lines: string[] = [];
    lines.push('ATHAR | أثر — Saudi Social Investment Policy Brief');
    lines.push(`Generated: ${new Date().toISOString().split('T')[0]}`);
    lines.push('');
    lines.push('01 / Executive Summary');
    lines.push(`Total Budget: ${formatSAR(metrics.totalBudget, { compact: true })}`);
    lines.push(`Beneficiaries: ${formatNumber(metrics.totalBeneficiaries)}`);
    lines.push(`Social Value (SROI): ${formatSAR(metrics.totalSocialValue, { compact: true })}`);
    lines.push(`GDP Impact: ${formatSAR(metrics.totalGdpImpact, { compact: true })}`);
    lines.push('');
    lines.push('02 / Allocation');
    SECTORS.forEach((s) => lines.push(`${s.arName}: ${formatSAR(allocations[s.id] ?? 0, { compact: true })}`));
    lines.push('');
    lines.push('03 / Expected Impact');
    lines.push(`SROI: ${formatSROIRange(metrics.portfolioSROIMin, metrics.portfolioSROIMax)}`);
    lines.push(`Multiplier: ${formatMultiplier(metrics.portfolioMultiplier)}`);
    lines.push(`Jobs Created: ${formatNumber(Math.round(metrics.totalEmployment))}`);
    lines.push(`NPV: ${formatSAR(metrics.npvTotal, { compact: true })}`);
    lines.push('');
    lines.push('04 / Risk & Sustainability');
    lines.push(`Resilience Score: ${formatPercent(metrics.resilienceScore, 0)}`);
    lines.push(`Health Score: ${formatPercent(critique.healthScore, 0)}`);
    lines.push('');
    lines.push('06 / Methodology & Limitations');
    lines.push('Simulation based on stated assumptions and available evidence. Not a forecast. Not investment advice.');
    lines.push('');
    lines.push('— Joud Abdullah Al-Arjani, Economics Student');
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8 text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            Stage 05 / Policy Brief
          </div>
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            الموجز التنفيذي
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            ملخص شامل لمحفظتك — جاهز للمشاركة
          </p>
        </div>

        {/* Policy Verdict + SAVE MY STRATEGY card */}
        <PolicyVerdict />

        {/* Main brief document */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel terminal-border p-8 mb-6"
        >
          {/* Header */}
          <div className="border-b border-gold/20 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
                  ATHAR | أثر
                </div>
                <div className="text-lg text-ivory mt-1">
                  Saudi Social Investment Policy Brief
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div>
                  <div className="text-[10px] text-ivory/50 font-mono">Generated</div>
                  <div className="text-xs text-ivory/70 font-mono">
                    {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
                <button
                  onClick={copyBrief}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ivory/80 rounded-sm border border-gold/30 hover:bg-gold/10 transition cursor-pointer"
                  title="نسخ الموجز"
                >
                  <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={generatePDF}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0A0E1A] rounded-sm shadow-lg hover:brightness-110 transition"
                  style={{
                    background: 'linear-gradient(135deg, #d4a017 0%, #f0c14b 55%, #ffe08a 100%)',
                  }}
                  title="تحميل PDF"
                >
                  <span aria-hidden="true">⬇</span>
                  <span>تحميل PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <Section title="01 / Executive Summary" ar="ملخص تنفيذي">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BriefStat label="Total Budget" value={formatSAR(metrics.totalBudget, { compact: true })} />
              <BriefStat label="Beneficiaries" value={formatNumber(metrics.totalBeneficiaries)} />
              <BriefStat label="Social Value (SROI)" value={formatSAR(metrics.totalSocialValue, { compact: true })} />
              <BriefStat label="GDP Impact" value={formatSAR(metrics.totalGdpImpact, { compact: true })} />
            </div>
          </Section>

          {/* 2. Allocation */}
          <Section title="02 / Allocation" ar="التخصيص">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
              className="space-y-1.5"
            >
              {SECTORS.map((s) => {
                const a = allocations[s.id] ?? 0;
                const share = a / totalBudget;
                return (
                  <motion.div
                    key={s.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
                    }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 text-ivory">{s.arName}</div>
                    <div className="font-mono text-ivory/70 w-20 text-right">
                      {formatSAR(a, { compact: true })}
                    </div>
                    <div className="font-mono text-gold w-12 text-right">
                      {formatPercent(share, 1)}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </Section>

          {/* 3. Expected Impact */}
          <Section title="03 / Expected Impact" ar="الأثر المتوقع">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">SROI (Social)</div>
                <div className="text-lg text-[#10b981] font-mono">
                  {formatSROIRange(metrics.portfolioSROIMin, metrics.portfolioSROIMax)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Multiplier (Market)</div>
                <div className="text-lg text-blue-300 font-mono">
                  {formatMultiplier(metrics.portfolioMultiplier)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Jobs Created</div>
                <div className="text-lg text-gold font-mono">
                  {formatNumber(Math.round(metrics.totalEmployment))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">NPV ({horizon}Y, {formatPercent(discountRate, 0)})</div>
                <div className="text-lg text-gold font-mono">
                  {formatSAR(metrics.npvTotal, { compact: true })}
                </div>
              </div>
            </div>
          </Section>

          {/* 4. Risk & Sustainability */}
          <Section title="04 / Risk & Sustainability" ar="المخاطر والاستدامة">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Resilience Score</div>
                <div className="text-lg text-gold font-mono">
                  {formatPercent(metrics.resilienceScore, 0)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Health Score</div>
                <div className="text-lg text-gold font-mono">
                  {formatPercent(critique.healthScore, 0)}
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-ivory/50 leading-relaxed">
              Resilience = 0.3 × (1-HHI) + 0.3 × (1-Dependency) + 0.2 × Counter-Cyclicality + 0.2 × (1-σ)
            </div>
          </Section>

          {/* 5. Recommendations */}
          <Section title="05 / Recommendations" ar="التوصيات">
            {critique.critiques.length === 0 ? (
              <div className="text-sm text-ivory/70">
                لا توجد توصيات حرجة. المحفظة قوية.
              </div>
            ) : (
              <div className="space-y-2">
                {critique.critiques.slice(0, 5).map((c) => (
                  <div key={c.id} className="text-xs text-ivory/70 flex items-start gap-2">
                    <span className="text-gold">→</span>
                    <span>{c.titleAr}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* 6. Methodology */}
          <Section title="06 / Methodology & Limitations" ar="المنهجية والقيود">
            <div className="text-[10px] text-ivory/50 leading-relaxed space-y-1">
              <div>
                • الحسابات مبنية على بيانات رسمية سعودية (NCNP، Vision 2030، GASTAT، KKF)
              </div>
              <div>
                • SROI من دراسات حالة منشورة (دروب 4.9x، وريف 5.49x، التوحد 3.14x، إنسان)
              </div>
              <div>
                • Multiplier تقديري لـSaudi context (IMF Article IV + SAMA)
              </div>
              <div>
                • معاملات Diminishing Returns و Sustainability: SIMULATION ASSUMPTION
              </div>
              <div>
                • Discount rate افتراضي 3% (UK Treasury Green Book)
              </div>
              <div>
                • الأرقام قابلة للتعديل في Sensitivity Analysis
              </div>
            </div>
          </Section>

          {/* 7. Funding Structure */}
          <Section title="07 / Funding Structure" ar="هيكل التمويل">
            {funding.totalMix > 0 ? (
              <>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <BriefStat label="Sustainability" value={formatPercent(funding.sustainabilityScore, 0)} />
                  <BriefStat label="Risk" value={formatPercent(funding.riskScore, 0)} />
                  <BriefStat label="Viability" value={formatPercent(funding.blendedViability, 0)} />
                  <BriefStat label="Dependency" value={formatPercent(funding.governmentDependency, 0)} />
                </div>
                <div className="h-3 flex rounded-sm overflow-hidden border border-ivory/15">
                  {FUNDING_INSTRUMENTS.map((inst) => {
                    const share = fundingMix[inst.id] ?? 0;
                    return (
                      <div
                        key={inst.id}
                        style={{ width: `${share * 100}%`, backgroundColor: fundingColor(inst.id) }}
                        title={`${inst.arName}: ${(share * 100).toFixed(0)}%`}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-xs text-ivory/50">not specified</div>
            )}
          </Section>

          {/* 8. Shock Resilience */}
          <Section title="08 / Shock Resilience" ar="مجابهة الصدمات">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Resilience Score</div>
                <div className="text-lg text-gold font-mono">
                  {formatPercent(metrics.resilienceScore, 0)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Multiplier (Market)</div>
                <div className="text-lg text-blue-300 font-mono">
                  {formatMultiplier(metrics.portfolioMultiplier)}
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-ivory/50 leading-relaxed">
              أُجري اختبار الصدمات في مرحلة "اختبار الصدمات" — المرونة الأقل تعني هشاشة أمام السيناريوهات المفترضة.
            </div>
          </Section>

          {/* 9. PPF Position */}
          <Section title="09 / PPF Position" ar="موقعك على حدود الإمكانية">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Social Value</div>
                <div className="text-lg text-[#10b981] font-mono">
                  {formatSAR(ppf.userPoint.socialValue, { compact: true })}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-ivory/50 font-mono">Economic Impact</div>
                <div className="text-lg text-blue-300 font-mono">
                  {formatSAR(ppf.userPoint.economicImpact, { compact: true })}
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-ivory/50 leading-relaxed">
              كفاءة مقابل الحد: {userEfficiency.toFixed(0)}% —{' '}
              {userEfficiency > 90
                ? 'قريب من الحد الأمثل'
                : userEfficiency > 70
                ? 'يمكن تحسينه'
                : 'بعيد عن الكفاءة القصوى'}
            </div>
          </Section>

          {/* 10. Sensitivity Summary */}
          <Section title="10 / Sensitivity Summary" ar="حساسية الافتراضات">
            {topSensitive.length > 0 ? (
              <div className="space-y-1.5">
                {topSensitive.map((b) => (
                  <div key={b.parameter} className="flex items-center gap-2 text-xs">
                    <span className="text-gold">→</span>
                    <span className="text-ivory/80 flex-1">{b.parameterAr}</span>
                    <span className="font-mono text-ivory/60">
                      {formatSAR(b.range, { compact: true })} أثر
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-ivory/50">no sensitive assumptions</div>
            )}
          </Section>

          {/* Disclaimer */}
          <div className="mt-6 pt-4 border-t border-ivory/10 text-[10px] text-ivory/40 font-mono italic">
            ⚠ Simulation based on stated assumptions and available evidence.
            <br />
            Not a forecast. Not investment advice. Not a recommendation.
            <br />
            Model is open, JSON-driven, auditable.
          </div>
        </motion.div>

        {/* Final message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12"
        >
          <div className="text-2xl md:text-3xl text-ivory/80 font-light leading-relaxed">
            الاقتصاد ليس مجرد أرقام.
            <br />
            <span className="text-gold">إنه قرارات، ومفاضلات، وتكاليف، وآثار.</span>
          </div>
          <div className="text-base text-ivory/50 mt-4 font-mono tracking-wider">
            Every allocation is a choice.
          </div>
        </motion.div>

        {/* Built by */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel p-8 text-center"
        >
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold font-mono">
            BUILT BY
          </div>
          <div className="text-2xl text-ivory mt-2">Joud Abdullah Al-Arjani</div>
          <div className="text-sm text-ivory/60 mt-1">Economics Student</div>
          <a
            href="https://www.linkedin.com/in/joud-al-arjani"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-gold/30 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10 transition"
          >
            <span>LinkedIn</span>
            <span>↗</span>
          </a>
        </motion.div>

        {/* Restart / Credits */}
        <div className="flex items-center justify-center gap-8 mt-8">
          <button
            onClick={() => setStage('credits')}
            className="text-sm text-[#d4a017] hover:text-[#ffd166] font-mono tracking-widest uppercase transition-colors"
          >
            → Credits
          </button>
          <span className="text-ivory/20">•</span>
          <button
            onClick={() => {
              resetProgress();
              setStage('hero');
            }}
            className="text-[10px] text-ivory/40 hover:text-gold font-mono tracking-widest uppercase"
          >
            ↻ Start Over
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Section({ title, ar, children }: { title: string; ar: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">{title}</div>
        <div className="text-xs text-ivory/60">/ {ar}</div>
      </div>
      <div className="border-r-2 border-gold/20 pr-4">{children}</div>
    </div>
  );
}

function BriefStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-ivory/50 font-mono">{label}</div>
      <div className="text-lg text-gold font-mono tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function fundingColor(id: string): string {
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
