import { useState, useEffect } from 'react';
import { EconomicWorld } from '../3d/EconomicWorld';
import { AllocationPanel } from '../controls/AllocationPanel';
import { ImpactPanel } from '../analysis/ImpactPanel';
import { TimeSlider } from '../controls/TimeSlider';
import { useLabStore } from '../../state/labStore';
import { SECTORS } from '../../data/sectors';
import { detectLowEndDevice } from '../../lib/perf';

export function Lab() {
  const prefer2D = useLabStore((s) => s.prefer2D);
  const setPrefer2D = useLabStore((s) => s.setPrefer2D);
  const cameraMode = useLabStore((s) => s.cameraMode);
  const setCameraMode = useLabStore((s) => s.setCameraMode);

  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    if (detectLowEndDevice()) {
      setShow3D(false);
      setPrefer2D(true);
    }
  }, [setPrefer2D]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Camera / View controls (top-right) */}
      <div className="fixed top-16 right-3 z-20 flex items-center gap-1">
        {show3D && !prefer2D && (
          <>
            <button
              onClick={() => setCameraMode('cinematic')}
              className={`text-[10px] px-2 py-1 font-mono uppercase rounded-sm ${
                cameraMode === 'cinematic'
                  ? 'bg-gold/20 text-gold border border-gold/50'
                  : 'text-ivory/40 hover:text-ivory border border-ivory/15'
              }`}
            >
              Cinema
            </button>
            <button
              onClick={() => setCameraMode('top')}
              className={`text-[10px] px-2 py-1 font-mono uppercase rounded-sm ${
                cameraMode === 'top'
                  ? 'bg-gold/20 text-gold border border-gold/50'
                  : 'text-ivory/40 hover:text-ivory border border-ivory/15'
              }`}
            >
              Top
            </button>
          </>
        )}
        <button
          onClick={() => {
            setShow3D(!show3D);
            setPrefer2D(!show3D);
          }}
          className="text-[10px] px-2 py-1 font-mono uppercase text-ivory/50 hover:text-ivory border border-ivory/20 rounded-sm"
          title="Toggle 2D / 3D"
        >
          {show3D && !prefer2D ? '2D' : '3D'}
        </button>
      </div>

      {/* Main layout */}
      <div className="pt-14 min-h-screen flex">
        {/* Left: 3D World (or 2D placeholder) */}
        <div className="flex-1 relative">
          {show3D && !prefer2D ? (
            <EconomicWorld />
          ) : (
            <Lab2DPlaceholder />
          )}

          {/* Overlay label */}
          <div className="absolute top-4 left-4 z-10">
            <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/40 font-mono">
              {show3D && !prefer2D ? '3D Economic World' : '2D View'}
            </div>
            <div className="text-lg text-ivory/70 mt-1">المختبر الاقتصادي</div>
          </div>
        </div>

        {/* Right: Controls + Analysis */}
        <div className="w-full md:w-[420px] lg:w-[460px] p-4 md:p-6 space-y-4 overflow-y-auto max-h-screen pt-6 border-l border-ivory/5">
          <AllocationPanel />
          <ImpactPanel />
          <TimeSlider />
        </div>
      </div>
    </div>
  );
}

function Lab2DPlaceholder() {
  const allocations = useLabStore((s) => s.allocations);
  return (
    <div className="w-full h-full flex items-center justify-center grid-bg">
      <div className="text-center">
        <div className="relative w-64 h-64 mx-auto">
          <div className="absolute inset-0 rounded-full bg-gold/10 blur-3xl animate-pulse" />
          <div className="relative w-full h-full rounded-full border-2 border-gold/30 flex items-center justify-center">
            <div>
              <div className="text-[10px] tracking-widest text-gold/60 font-mono">2D MODE</div>
              <div className="text-2xl text-gold font-mono mt-2">100M</div>
            </div>
          </div>
          {Object.entries(allocations).map(([id, val], i) => {
            const angle = (i / SECTORS.length) * Math.PI * 2 - Math.PI / 2;
            const r = 130;
            return (
              <div
                key={id}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * r}px - 6px)`,
                  top: `calc(50% + ${Math.sin(angle) * r}px - 6px)`,
                  backgroundColor: `var(--sector-${id}, #C7A04A)`,
                  opacity: Math.max(0.3, val / 20_000_000),
                }}
              />
            );
          })}
        </div>
        <div className="mt-8 text-[10px] text-ivory/40 font-mono">
          Performance-limited device detected.
          <br />
          Showing 2D fallback. Toggle to 3D for full experience.
        </div>
      </div>
    </div>
  );
}
