import { motion } from 'framer-motion';
import { useLabStore } from '../../state/labStore';
import { getLevelForStage } from '../../lib/levels';

/**
 * Level HUD pill — shows LEVEL 0X / block name for the current stage.
 * Replaces the flat "Stage 0X / .." text throughout the lab.
 */
export function LevelHud({ compact = false }: { compact?: boolean }) {
  const stage = useLabStore((s) => s.stage);
  const level = getLevelForStage(stage);

  if (compact) {
    return (
      <div className="level-hud">
        <span className="level-num">LVL {level.code}</span>
        <span>{level.nameEn}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="level-hud"
    >
      <span className="level-num">LEVEL {level.code}</span>
      <span className="level-bar">
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ backgroundColor: level.color }}
        />
      </span>
      <span>{level.nameEn} / {level.nameAr}</span>
    </motion.div>
  );
}

/**
 * Repetitive brand tag — / J O U D — ECONOMIC POLICY LAB
 */
export function BrandTag({ className = '' }: { className?: string }) {
  return (
    <div className={`brand-tag ${className}`}>
      / <em>J O U D</em> — ECONOMIC POLICY LAB
    </div>
  );
}
