import { useLabStore } from '../../state/labStore';
import { getNextStage, getPrevStage, stageLabel } from '../../lib/levels';

/**
 * Sequential Journey navigation.
 * Forward always leads to the canonical next stage; backward to the previous.
 * The store gate still blocks any attempt to leap ahead, but this keeps
 * forward buttons coherent and hides the "next" button at the journey's end.
 */
export function StageNav() {
  const stage = useLabStore((s) => s.stage);
  const visited = useLabStore((s) => s.visited);
  const setStage = useLabStore((s) => s.setStage);

  const prev = getPrevStage(stage);
  const next = getNextStage(stage, visited);

  return (
    <div className="flex gap-3">
      {prev ? (
        <button
          onClick={() => setStage(prev)}
          className="flex-1 py-3 border border-ivory/20 text-ivory/70 text-xs font-mono tracking-widest uppercase hover:bg-ivory/5 cursor-pointer"
        >
          ← {stageLabel(prev).en}
        </button>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <button
          onClick={() => setStage(next)}
          className="flex-1 py-3 border border-gold/30 text-gold text-xs font-mono tracking-widest uppercase hover:bg-gold/10 cursor-pointer"
        >
          → {stageLabel(next).en}
        </button>
      ) : (
        <span className="flex-1" />
      )}
    </div>
  );
}
