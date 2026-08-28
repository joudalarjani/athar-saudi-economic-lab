import { useEffect } from 'react';
import { useLabStore } from './state/labStore';
import { Hero } from './components/shell/Hero';
import { SaudiMap } from './components/shell/SaudiMap';
import { Lab } from './components/shell/Lab';
import { Analysis } from './components/shell/Analysis';
import { Optimization } from './components/shell/Optimization';
import { StressTest } from './components/shell/StressTest';
import { Sensitivity } from './components/shell/Sensitivity';
import { CapitalStack } from './components/shell/CapitalStack';
import { Regional } from './components/shell/Regional';
import { Critique } from './components/shell/Critique';
import { Brief } from './components/shell/Brief';
import { Signature } from './components/shared/Signature';
import { ModelExplainer } from './components/shared/ModelExplainer';
import { GlossaryModal } from './components/shared/GlossaryModal';
import { SourcesPanel } from './components/shared/SourcesPanel';
import { GlobalNav } from './components/shell/GlobalNav';

function App() {
  const stage = useLabStore((s) => s.stage);
  const setIsMobile = useLabStore((s) => s.setIsMobile);
  const showModelExplainer = useLabStore((s) => s.showModelExplainer);
  const setShowModelExplainer = useLabStore((s) => s.setShowModelExplainer);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  useEffect(() => {
    const loader = document.querySelector('.loader') as HTMLElement | null;
    if (loader) loader.remove();
  }, []);

  return (
    <div className="min-h-screen bg-midnight-900 text-ivory">
      {stage !== 'hero' && stage !== 'map' && <GlobalNav />}
      {stage === 'hero' && <Hero />}
      {stage === 'map' && <SaudiMap />}
      {stage === 'lab' && <Lab />}
      {stage === 'analysis' && <Analysis />}
      {stage === 'optimization' && <Optimization />}
      {stage === 'stress' && <StressTest />}
      {stage === 'sensitivity' && <Sensitivity />}
      {stage === 'capitalStack' && <CapitalStack />}
      {stage === 'regional' && <Regional />}
      {stage === 'critique' && <Critique />}
      {stage === 'brief' && <Brief />}
      <Signature />
      <ModelExplainer
        open={showModelExplainer}
        onClose={() => setShowModelExplainer(false)}
      />
      <GlossaryModal />
      <SourcesPanel />
    </div>
  );
}

export default App;
