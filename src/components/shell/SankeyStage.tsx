import { motion } from 'framer-motion';
import { SankeyFlow } from '../analysis/SankeyFlow';
import { LevelHud } from '../shared/LevelHud';
import { StageNav } from '../shared/StageNav';
import { GlossaryTag } from '../shared/GlossaryModal';

export function SankeyStage() {
  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <LevelHud />
          <h1 className="text-3xl md:text-4xl text-ivory font-light mt-2">
            خريطة تدفق الأثر
          </h1>
          <p className="text-ivory/60 mt-2 text-sm">
            <GlossaryTag id="multiplier">رؤية سلسلة القيمة</GlossaryTag> — من رأس المال إلى الأثر
          </p>
        </div>

        <SankeyFlow />

        <div className="mt-8">
          <StageNav />
        </div>
      </motion.div>
    </div>
  );
}
