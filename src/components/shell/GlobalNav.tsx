import { motion } from 'framer-motion';
import { useLabStore, type Stage } from '../../state/labStore';
import { getLevelForStage, isStageUnlocked, LEVEL_STAGES, stageLabel } from '../../lib/levels';
import { BrandTag } from '../shared/LevelHud';

export function GlobalNav() {
  const stage = useLabStore((s) => s.stage);
  const visited = useLabStore((s) => s.visited);
  const setStage = useLabStore((s) => s.setStage);
  const setShowModelExplainer = useLabStore((s) => s.setShowModelExplainer);
  const setShowSources = useLabStore((s) => s.setShowSources);

  const currentLevel = getLevelForStage(stage);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40"
    >
      {/* Top thin progress line showing current level */}
      <motion.div
        className="h-0.5"
        style={{ background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}cc)` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8 }}
      />

      <div className="backdrop-blur-xl bg-[#05070f]/70 border-b border-[rgba(212,160,23,0.14)]">
        <div className="px-3 md:px-6 py-2.5 flex items-center gap-3 md:gap-5">
          {/* Brand mark */}
          <button
            onClick={() => setStage('hero')}
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <span className="text-lg text-[#d4a017] leading-none group-hover:drop-shadow-[0_0_8px_rgba(212,160,23,0.6)]">أثر</span>
            <span className="hidden lg:block text-[9px] tracking-[0.3em] text-[rgba(240,230,211,0.45)] font-mono uppercase">
              Policy Lab
            </span>
          </button>

          <div className="w-px h-5 bg-[rgba(212,160,23,0.2)]" />

          {/* Level grouping */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-4 min-w-max">
              {LEVEL_STAGES.map((group) => {
                const activeInLevel = currentLevel.id === group.level.id;
                return (
                  <div key={group.level.id} className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono tracking-widest ${
                        activeInLevel ? 'text-[#f0d67c]' : 'text-[rgba(240,230,211,0.3)]'
                      }`}
                    >
                      {group.level.code}
                    </span>
                    <span
                      className={`text-[9px] font-mono tracking-widest ${
                        activeInLevel ? '' : 'text-[rgba(240,230,211,0.35)]'
                      }`}
                      style={{ color: activeInLevel ? group.level.color : undefined }}
                    >
                      {group.level.nameEn}
                    </span>
                    <div className="flex items-center gap-0.5 mr-1">
                      {group.stages.map((sid: Stage) => {
                        const active = stage === sid;
                        const unlocked = isStageUnlocked(sid, visited);
                        const base = `px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider transition rounded-sm ${
                          active
                            ? 'text-[#f0d67c] cursor-default'
                            : unlocked
                              ? 'text-[rgba(240,230,211,0.4)] hover:text-[rgba(240,230,211,0.8)] hover:bg-[rgba(255,255,255,0.04)] cursor-pointer'
                              : 'text-[rgba(240,230,211,0.18)] cursor-not-allowed'
                        }`;
                        return (
                          <button
                            key={sid}
                            onClick={() => unlocked && setStage(sid)}
                            disabled={!unlocked}
                            className={base}
                            title={unlocked ? `Go to ${sid}` : '🔒 أكمل المراحل السابقة أولاً'}
                            style={active ? { boxShadow: `0 0 10px ${group.level.color}40`, border: `1px solid ${group.level.color}60` } : { border: '1px solid transparent' }}
                          >
                            {!unlocked && !active ? <span className="mr-0.5">🔒</span> : null}
                            {stageLabel(sid).ar}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSources(true)}
              className="hidden md:block text-[9px] tracking-widest text-[rgba(212,160,23,0.75)] hover:text-[#d4a017] uppercase font-mono border border-[rgba(212,160,23,0.3)] px-2 py-1 rounded-sm"
            >
              المصادر
            </button>
            <button
              onClick={() => setShowModelExplainer(true)}
              className="text-[9px] tracking-widest text-[rgba(212,160,23,0.75)] hover:text-[#d4a017] uppercase font-mono border border-[rgba(212,160,23,0.3)] px-2 py-1 rounded-sm"
            >
              How it works
            </button>
          </div>

          <BrandTag className="hidden xl:block" />
        </div>
      </div>
    </motion.div>
  );
}
