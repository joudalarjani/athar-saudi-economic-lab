/**
 * Model Explainer Modal
 *
 * A documentation modal that shows all equations, variables, and sources
 * used in the model. Opened from any screen via the help button.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ModelExplainerProps {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    id: 'sroi',
    titleAr: 'SROI — العائد الاجتماعي على الاستثمار',
    titleEn: 'SROI',
    content: [
      {
        type: 'formula' as const,
        text: 'SROI = (Σ Beneficiaries × Financial Proxy × (1 - Deadweight) × Attribution) / Investment',
      },
      {
        type: 'text' as const,
        text: 'SROI يحوّل النتائج الاجتماعية إلى قيمة مالية (welfare, capability, equity). يستخدم deadweight و attribution و displacement و drop-off. كل رقم مبني على دراسات حالة سعودية أو تقديرات موثقة.',
      },
      {
        type: 'list' as const,
        items: [
          'Doroob Scholarships: SROI 4.9× (دراسة منشورة 2019)',
          'Wareef Housing: SROI 5.49× (2024)',
          'Wareef Autism: SROI 3.14× (2023)',
          'Insan Club: SROI ~2.8× (2021)',
        ],
      },
    ],
  },
  {
    id: 'multiplier',
    titleAr: 'المضاعف الاقتصادي — Keynesian Multiplier',
    titleEn: 'Economic Multiplier',
    content: [
      {
        type: 'formula' as const,
        text: 'GDP_Impact = Direct_Income × (1 + m_indirect) × (1 + m_induced) × (1 - Leakage)',
      },
      {
        type: 'text' as const,
        text: 'يقيس الأثر السوقي فقط (market transactions). لا يشمل welfare. القيم تقديرية لـSaudi context (IMF Article IV + SAMA).',
      },
      {
        type: 'list' as const,
        items: [
          'Direct: استثمار → دخل مباشر (MPC ≈ 0.65 افتراضي)',
          'Indirect: دخل → supply chain (0.3-0.5 حسب القطاع)',
          'Induced: worker consumption → إضافي (0.3-0.5)',
          'Leakage: واردات + تحويلات (15-30%)',
        ],
      },
    ],
  },
  {
    id: 'time',
    titleAr: 'الزمن — Time Discounting',
    titleEn: 'Time',
    content: [
      {
        type: 'formula' as const,
        text: 'NPV = Σ_t Impact_t / (1 + r)^t',
      },
      {
        type: 'text' as const,
        text: 'r (discount rate) افتراضي 3% — UK Treasury Green Book methodology. كل قطاع له time profile يحدد متى يتحقق الأثر.',
      },
    ],
  },
  {
    id: 'returns',
    titleAr: 'العوائد المتناقصة — Diminishing Returns',
    titleEn: 'Diminishing Returns',
    content: [
      {
        type: 'formula' as const,
        text: 'D_effective = D_max × (1 - e^(-λ × A))',
      },
      {
        type: 'text' as const,
        text: 'كل ريال إضافي في قطاع مُشبَع يُعطي عائدًا أقل. λ يختلف لكل قطاع.',
      },
    ],
  },
  {
    id: 'resilience',
    titleAr: 'المرونة — Resilience Score',
    titleEn: 'Resilience',
    content: [
      {
        type: 'formula' as const,
        text: 'Resilience = 0.3×(1-HHI) + 0.3×(1-Dependency) + 0.2×CounterCyclicality + 0.2×(1-σ)',
      },
      {
        type: 'text' as const,
        text: 'مؤشر مركّب لـ robustness المحفظة. HHI = Herfindahl-Hirschman Index. σ = التذبذب تحت الصدمات.',
      },
    ],
  },
  {
    id: 'optimization',
    titleAr: 'التحسين — Multi-Objective Optimization',
    titleEn: 'Optimization',
    content: [
      {
        type: 'formula' as const,
        text: 'Max Σ_k w_k × F_k(x), subject to: Σ x_s = 100M, x_s ∈ [min_s, max_s]',
      },
      {
        type: 'text' as const,
        text: 'كل F_k دالة موضوع (efficiency, impact, equity, sustainability, resilience). النتيجة "Optimal under selected objectives and assumptions" — لا توجد محفظة مثلى مطلقة.',
      },
    ],
  },
];

export function ModelExplainer({ open, onClose }: ModelExplainerProps) {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const section = SECTIONS.find((s) => s.id === activeSection) ?? SECTIONS[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-900/90 backdrop-blur"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="glass-panel terminal-border max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-midnight-900/95 backdrop-blur border-b border-gold/20 px-6 py-4 z-10 flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
                  How The Model Works
                </div>
                <div className="text-lg text-ivory mt-1">كيف يعمل النموذج</div>
              </div>
              <button
                onClick={onClose}
                className="text-ivory/60 hover:text-gold text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-[200px_1fr]">
              {/* Section nav */}
              <div className="border-l border-ivory/10 p-4 space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`block w-full text-right px-3 py-2 text-xs transition ${
                      activeSection === s.id
                        ? 'bg-gold/10 text-gold border-r-2 border-gold'
                        : 'text-ivory/60 hover:text-ivory hover:bg-ivory/5'
                    }`}
                  >
                    <div className="font-mono tracking-wider uppercase text-[10px] text-ivory/40">
                      {s.titleEn}
                    </div>
                    <div className="text-xs mt-0.5">{s.titleAr}</div>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl text-gold mb-1">{section.titleEn}</h2>
                <div className="text-sm text-ivory/60 mb-6">{section.titleAr}</div>

                {section.content.map((c, i) => {
                  if (c.type === 'formula') {
                    return (
                      <div
                        key={i}
                        className="bg-midnight-800 border border-gold/30 rounded-sm p-4 mb-4 font-mono text-sm text-gold text-center"
                      >
                        {c.text}
                      </div>
                    );
                  }
                  if (c.type === 'text') {
                    return (
                      <p key={i} className="text-sm text-ivory/80 leading-relaxed mb-4">
                        {c.text}
                      </p>
                    );
                  }
                  if (c.type === 'list') {
                    return (
                      <ul key={i} className="space-y-2 mb-4">
                        {c.items.map((it, j) => (
                          <li key={j} className="text-sm text-ivory/80 flex items-start gap-2">
                            <span className="text-gold">•</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return null;
                })}

                <div className="mt-6 pt-4 border-t border-ivory/10 text-[10px] text-ivory/40 font-mono leading-relaxed">
                  للمزيد من التفاصيل: README.md • src/data/sources.ts •
                  src/engine/*.ts
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
