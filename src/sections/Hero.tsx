import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";

const SECTOR_ICONS = [
  { icon: "🎓", label: "التعليم" },
  { icon: "🏥", label: "الصحة" },
  { icon: "🏠", label: "الإسكان" },
  { icon: "💼", label: "التمكين الاقتصادي" },
  { icon: "👩", label: "تمكين المرأة" },
  { icon: "🌿", label: "البيئة" },
  { icon: "🕋", label: "خدمات الحج والمعتمر" },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    text: "عوائد اجتماعية واقتصادية",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    text: "تحليل المخاطر والفرص",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    text: "محاكاة سيناريوهات المستقبل",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    text: "اتخذ قرارك... وشاهد الأثر يتضاعف",
  },
];

export function Hero() {
  const setPhase = useStore((s) => s.setPhase);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const delays = [200, 500, 800, 1100, 1400, 1700, 2000, 2400];
    const timers = delays.map((d, i) => setTimeout(() => setStep(i), d));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="hero-root">
      <div className="hero-content">
        {/* Top bar */}
        <header className="hero-top-bar">
          <div className={`hero-reveal ${step >= 0 ? "visible" : ""}`}>
            <span className="hero-brand-small">ATHAR</span>
            <span className="hero-brand-divider">|</span>
            <span className="hero-brand-ar">أثر</span>
          </div>
        </header>

        {/* Main poster layout */}
        <div className="hero-main">
          {/* Left column */}
          <div className="hero-left">
            {/* Top label */}
            <div className={`hero-reveal ${step >= 1 ? "visible" : ""}`}>
              <div className="hero-top-label">تجربة اقتصادية تفاعلية</div>
            </div>

            {/* Headline */}
            <div className={`hero-reveal ${step >= 2 ? "visible" : ""}`}>
              <h1 className="hero-headline">
                لو كنت المستثمر الاجتماعي للسعودية...
              </h1>
            </div>

            {/* Subtext */}
            <div className={`hero-reveal ${step >= 3 ? "visible" : ""}`}>
              <p className="hero-subtext">
                كيف ستخصص موارد محدودة لتحقيق أكبر أثر ممكن؟
              </p>
            </div>

            {/* Sector icons row */}
            <div className={`hero-reveal ${step >= 4 ? "visible" : ""}`}>
              <div className="hero-sectors-row">
                {SECTOR_ICONS.map((s, i) => (
                  <div className="hero-sector-icon" key={i}>
                    <span className="icon">{s.icon}</span>
                    <span className="label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saudi Map */}
            <div className={`hero-reveal ${step >= 5 ? "visible" : ""}`}>
              <div className="hero-map-container">
                <svg className="hero-map-svg" viewBox="0 0 400 340" fill="none">
                  {/* Simplified Saudi Arabia outline */}
                  <path
                    d="M 80 40 L 140 25 L 200 30 L 260 20 L 310 40 L 350 80 L 370 130 L 360 180 L 340 220 L 310 250 L 270 270 L 230 285 L 190 290 L 150 275 L 120 250 L 100 220 L 80 190 L 65 150 L 60 110 L 65 70 Z"
                    fill="rgba(16,185,129,0.04)"
                    stroke="rgba(212,160,23,0.3)"
                    strokeWidth="1"
                  />

                  {/* Connecting lines between cities */}
                  <line x1="200" y1="170" x2="110" y2="195" stroke="rgba(212,160,23,0.15)" strokeWidth="0.8" strokeDasharray="4,4" />
                  <line x1="200" y1="170" x2="320" y2="140" stroke="rgba(212,160,23,0.15)" strokeWidth="0.8" strokeDasharray="4,4" />
                  <line x1="200" y1="170" x2="150" y2="230" stroke="rgba(212,160,23,0.15)" strokeWidth="0.8" strokeDasharray="4,4" />
                  <line x1="150" y1="230" x2="130" y2="200" stroke="rgba(212,160,23,0.15)" strokeWidth="0.8" strokeDasharray="4,4" />

                  {/* City groups — each has pulse rings + dot */}
                  {/* Riyadh (center) */}
                  <circle cx="200" cy="170" r="4" className="city-pulse" />
                  <circle cx="200" cy="170" r="4" className="city-pulse" />
                  <circle cx="200" cy="170" r="3" className="city-dot" />
                  <text x="200" y="162" textAnchor="middle" fill="rgba(212,160,23,0.6)" fontSize="8" fontFamily="'Noto Sans Arabic', sans-serif">الرياض</text>

                  {/* Jeddah (west) */}
                  <circle cx="110" cy="195" r="4" className="city-pulse" />
                  <circle cx="110" cy="195" r="4" className="city-pulse" />
                  <circle cx="110" cy="195" r="3" className="city-dot" />
                  <text x="110" y="210" textAnchor="middle" fill="rgba(212,160,23,0.6)" fontSize="8" fontFamily="'Noto Sans Arabic', sans-serif">جدة</text>

                  {/* Dammam (east) */}
                  <circle cx="320" cy="140" r="4" className="city-pulse" />
                  <circle cx="320" cy="140" r="4" className="city-pulse" />
                  <circle cx="320" cy="140" r="3" className="city-dot" />
                  <text x="320" y="132" textAnchor="middle" fill="rgba(212,160,23,0.6)" fontSize="8" fontFamily="'Noto Sans Arabic', sans-serif">الدمام</text>

                  {/* Mecca (southwest) */}
                  <circle cx="130" cy="210" r="4" className="city-pulse" />
                  <circle cx="130" cy="210" r="4" className="city-pulse" />
                  <circle cx="130" cy="210" r="3" className="city-dot" />
                  <text x="130" y="224" textAnchor="middle" fill="rgba(212,160,23,0.6)" fontSize="8" fontFamily="'Noto Sans Arabic', sans-serif">مكة</text>

                  {/* Medina (northwest) */}
                  <circle cx="135" cy="150" r="4" className="city-pulse" />
                  <circle cx="135" cy="150" r="4" className="city-pulse" />
                  <circle cx="135" cy="150" r="3" className="city-dot" />
                  <text x="135" y="142" textAnchor="middle" fill="rgba(212,160,23,0.6)" fontSize="8" fontFamily="'Noto Sans Arabic', sans-serif">المدينة</text>
                </svg>
              </div>
            </div>

            {/* Quote */}
            <div className={`hero-reveal ${step >= 6 ? "visible" : ""}`}>
              <div className="hero-quote">
                <p>"الأثر لا يُقاس بحجم الاستثمار فقط، بل بمدى ذكاء القرار"</p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="hero-right">
            {/* Capital card */}
            <div className={`hero-reveal ${step >= 2 ? "visible" : ""}`}>
              <div className="hero-capital-card">
                <div className="hero-capital-top">
                  <div>
                    <div className="hero-capital-label">رأس مالك</div>
                    <div className="hero-capital-amount">100,000,000</div>
                    <div className="hero-capital-currency">ريال سعودي</div>
                  </div>
                  <div className="hero-orb" />
                </div>
              </div>
            </div>

            {/* Feature list */}
            <div className={`hero-reveal ${step >= 4 ? "visible" : ""}`}>
              <div className="hero-features">
                {FEATURES.map((f, i) => (
                  <div className="hero-feature-item" key={i}>
                    <div className="hero-feature-icon">{f.icon}</div>
                    <span className="hero-feature-text">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className={`hero-reveal ${step >= 5 ? "visible" : ""}`}>
              <div className="hero-badges">
                <div className="hero-badge">
                  <span className="hero-badge-dot" />
                  بيانات موثوقة ومصادر شفافة
                </div>
                <div className="hero-badge">
                  <span className="hero-badge-dot" />
                  نماذج اقتصادية متقدمة
                </div>
                <div className="hero-badge">
                  <span className="hero-badge-dot" />
                  تجربة بصرية غامرة وتفاعلية
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand center */}
        <div className={`hero-reveal ${step >= 5 ? "visible" : ""}`}>
          <div className="hero-brand-center">
            <div className="brand-name">
              <span>ATHAR</span> | أثر
            </div>
            <div className="brand-sub">Saudi Social Investment & Economic Policy Lab</div>
          </div>
        </div>

        {/* CTA */}
        <div className="hero-cta-wrapper">
          <div className={`hero-reveal ${step >= 6 ? "visible" : ""}`}>
            <button className="hero-cta" onClick={() => setPhase("lab")}>
              <span>ادخل المختبر — ENTER THE LAB</span>
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className={`hero-footer ${step >= 7 ? "visible" : ""}`}>
          <div className="hero-footer-left">
            <span className="hero-footer-name">Joud Abdullah Al-Arjani</span>
            <span className="hero-footer-role">Economics Student</span>
          </div>
          <div className="hero-footer-right">
            <a
              href="https://www.linkedin.com/in/joud-al-arjani"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-footer-link"
            >
              linkedin.com/in/joud-al-arjani
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
