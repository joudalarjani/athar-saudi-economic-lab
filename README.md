# ATHAR | أثر
## Saudi Social Investment & Economic Policy Lab

> **مختبر تفاعلي يحاكي مفاضلات تخصيص رأس المال في الاقتصاد الاجتماعي السعودي**

مشروع Portfolio لطالبة اقتصاد. أداة تفاعلية ثلاثية الأبعاد تحوّل بيانات رسمية سعودية ودراسات SROI منشورة إلى تجربة اقتصادية قابلة للاستكشاف.

---

## 🎯 الفكرة

المستخدم يحصل على **رأس مال قابل للتعديل** (افتراضيًا **100 مليون ريال**) ويتحول إلى **Social Investor**. يخصص الميزانية بين 7 قطاعات، ثم يستكشف:

| المرحلة | الوصف |
|---|---|
| **Lab** | محاكي 3D تفاعلي — Capital Pool مركزي مع 7 Sector Nodes + Money Flow |
| **Analysis** | SROI vs Economic Multiplier — فصل صارم بين القيمة الاجتماعية والأثر السوقي |
| **Optimize** | Multi-Objective Optimization مع 5 أوزان قابلة للتعديل |
| **PPF** | منحنى إمكانية الإنتاج + **Knee Point** (نقطة التوازن المثلى) |
| **Marginal Returns** | تحليل العائد الحدي لكل قطاع |
| **Sensitivity** | Tornado chart — أي افتراض يؤثر أكثر |
| **Trade-off** | المفاضلة بين الأهداف مع قياس تكلفة الفرصة |
| **Monte-Carlo** | توزيع النتائج المحتملة — P5/P50/P95 + احتمال الهبوط |
| **Stress Test** | 6 سيناريوهات صدمات تاريخية (Inflation, Pandemic, Oil Shock, etc.) |
| **Capital Stack** | بناء هيكل التمويل (Grants, Waqf, Impact Investment, CSR, Crowdfunding) |
| **Regional** | مقارنة Population-based vs Gap-based لـ 13 منطقة سعودية |
| **Consequence Lab** | محاكاة عواقب القرار (Gain/Effect/Side) |
| **Defend Decision** | مراجعة نقدية للقرار مع أسئلة محكمة |
| **Critique** | Economic Policy Review بقواعد بنيوية |
| **Brief** | Policy Brief مولّد — جاهز للمشاركة |

> **الميزانية قابلة للتعديل** — لا تقتصر على 100 مليون ثابت؛ يختار المستخدم من عرض مسبق (SME / ترليون) أو قيمة مخصصة، وتُعاد معايرة كل الحسابات والحدود والمحسّن تلقائيًا.

---

## 🧠 الدقة الاقتصادية

| المقياس | المنهجية | المصدر |
|---|---|---|
| **SROI** | Social Return on Investment | دراسات سعودية: دروب 4.9x، وريف 5.49x، التوحد 3.14x، إنسان |
| **Multiplier** | Keynesian cascade (Direct + Indirect + Induced) | IMF Article IV + SAMA (مُعلم كـ SIMULATION ASSUMPTION) |
| **Time Profile** | Year-by-year impact realization | Sector-specific empirical patterns |
| **Diminishing Returns** | Saturation function: D = D_max × (1 - e^(-λx)) | Parameterized |
| **Resilience** | HHI + Dependency + Counter-cyclicality + σ | Composite formula موثقة |
| **Tornado** | Sensitivity to ±10% parameter changes | All scenarios |
| **Monte-Carlo** | Seeded mulberry32 — SROI داخل نطاق دراسات الحالة الحقيقية + ضجيج مضاعِف σ≈10% | Case-study ranges + stated assumptions |
| **Opportunity Cost** | Trade-off engine + PPF knee point (أقصى مسافة من خط الأطراف) | Frontier geometry |

**مبدأ حاكم:** SROI ≠ Economic Multiplier. كل رقم له Evidence Badge مرئي:
- 🟢 **VERIFIED** — من تقرير رسمي سعودي
- 🔵 **CASE_STUDY** — من دراسة SROI أو تقييم منشور
- 🟡 **ESTIMATE** — مبني على بيانات متعددة
- 🟠 **SIMULATION_ASSUMPTION** — افتراض واضح قابل للتعديل

---

## 🚀 التشغيل

```bash
# في OpenCode
cd athar
npm install
npm run dev
```

ثم افتح [http://localhost:5173](http://localhost:5173)

```bash
# اختبارات
npm run test

# بناء production
npm run build
```

---

## 📂 بنية المشروع

```
athar/
├── src/
│   ├── data/          # مصادر البيانات (7 ملفات)
│   ├── engine/        # Economic Engine (21 ملف pure functions)
│   ├── state/         # Zustand state
│   ├── components/
│   │   ├── 3d/        # React Three Fiber (4 ملفات)
│   │   ├── shell/     # 21 شاشة رئيسية
│   │   ├── controls/  # Sliders
│   │   ├── analysis/  # Impact panels
│   │   └── shared/    # EvidenceBadge, Signature, Stat, ModelExplainer
│   ├── lib/           # format, perf
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── preview.html        # Static preview (open in browser without npm)
├── tsconfig.json
└── README.md
```

---

## 📊 مصادر البيانات

### تقارير رسمية سعودية
- **NCNP Annual Report 2025** (المركز الوطني لتنمية القطاع غير الربحي)
- **Vision 2030** — Nonprofit Sector Priority KPIs
- **GASTAT** — Nonprofit Sector Statistics 2023
- **KKF Nonprofit Outlook 2025** (مؤسسة الملك خالد)
- **MHRSD Social Impact Investment Rules 2025**
- **Awqaf Authority Endowment Reports**

### دراسات SROI سعودية منشورة
- **Doroob Scholarships SROI 2019** — 4.9×
- **Wareef Housing SROI 2024** — 5.49×
- **Wareef Autism Research 2023** — 3.14×
- **Insan Club SROI 2021**
- **Zamzam Health Society 2021**

### Macro / Methodology
- **IMF Article IV — Saudi Arabia 2024**
- **SAMA Annual Reports**
- **UK HM Treasury Green Book** (Discount rate methodology)
- **Social Value International SROI Guide**

كل مصدر موثّق في `src/data/sources.ts`.

---

## 🎨 المبادئ البصرية

- **Premium + Academic + Institutional + Futuristic + Saudi**
- لوحة ألوان: Midnight + Gold + Emerald
- خطوط: IBM Plex Sans Arabic + Inter + JetBrains Mono
- 3D عبر React Three Fiber + Drei
- Bloom + Vignette post-processing
- Terminal HUD aesthetic (Bloomberg Terminal + Apple Vision Pro)
- 2D fallback تلقائي للأجهزة الضعيفة
- prefers-reduced-motion مدعوم

---

## ⚠️ القيود

- المضاعفات الاقتصادية تقديرية لـSaudi context.
- دراسات SROI سعودية محدودة (~8 منشورة) — generalization ضعيف.
- Diminishing Returns و Sustainability: SIMULATION ASSUMPTION.
- كل الحسابات client-side، بدون backend.
- AI features (NLP critique) غير مدمجة في MVP.

---

## 🧪 الاختبارات

```bash
npm run test
```

---

## 👤 Built By

**Joud Abdullah Al-Arjani**
Economics Student

[LinkedIn](https://www.linkedin.com/in/joud-al-arjani)

---

## 📜 License

Open source for educational purposes. Data sources retain their original copyrights.
