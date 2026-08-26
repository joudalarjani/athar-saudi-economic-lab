import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { HeroScene } from "../three/HeroScene";

export function Hero() {
  const setPhase = useStore((s) => s.setPhase);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const delays = [300, 1100, 1900, 2800, 3800, 4600, 5200];
    const timers = delays.map((d, i) => setTimeout(() => setStep(i), d));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="hero-root">
      <HeroScene />

      <div className="hero-content">
        {/* Top: brand identity */}
        <header className="hero-top-bar">
          <div className={`hero-reveal ${step >= 0 ? "visible" : ""}`} style={{ transitionDelay: "0ms" }}>
            <span className="hero-brand-small">ATHAR</span>
            <span className="hero-brand-divider">|</span>
            <span className="hero-brand-ar">أثر</span>
          </div>
        </header>

        {/* Center: main sequence */}
        <main className="hero-center">
          <div className="hero-center-inner">
            {/* English subtitle */}
            <div
              className={`hero-reveal ${step >= 1 ? "visible" : ""}`}
              style={{ transitionDelay: "0ms" }}
            >
              <p className="hero-tagline-en">
                Saudi Social Investment & Economic Policy Lab
              </p>
            </div>

            {/* Arabic invitation */}
            <div
              className={`hero-reveal ${step >= 2 ? "visible" : ""}`}
              style={{ transitionDelay: "0ms" }}
            >
              <p className="hero-subtitle-ar">
                لو كنت المستثمر الاجتماعي للسعودية...
              </p>
            </div>

            {/* THE NUMBER */}
            <div
              className={`hero-reveal ${step >= 3 ? "visible" : ""}`}
              style={{ transitionDelay: "0ms" }}
            >
              <div className="hero-amount-block">
                <span className="hero-amount">100,000,000</span>
                <span className="hero-currency">SAR</span>
              </div>
            </div>

            {/* Question */}
            <div
              className={`hero-reveal ${step >= 4 ? "visible" : ""}`}
              style={{ transitionDelay: "0ms" }}
            >
              <p className="hero-question">
                كيف ستخصص موارد محدودة لتحقيق أكبر أثر ممكن؟
              </p>
            </div>

            {/* CTA */}
            <div
              className={`hero-reveal ${step >= 5 ? "visible" : ""}`}
              style={{ transitionDelay: "0ms" }}
            >
              <button className="hero-cta" onClick={() => setPhase("lab")}>
                <span>ENTER THE LAB</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </main>

        {/* Footer: identity + credits */}
        <footer className={`hero-footer ${step >= 6 ? "visible" : ""}`}>
          <div className="hero-footer-left">
            <span className="hero-footer-name">Joud Al-Arjani</span>
          </div>
          <div className="hero-footer-center">
            <span className="hero-footer-tagline">
              Interactive Economic Policy Simulation
            </span>
          </div>
          <div className="hero-footer-right">
            <a
              href="https://www.linkedin.com/in/joud-al-arjani"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-footer-link"
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
