/**
 * Subtle persistent signature — like a watermark.
 * Appears in fixed position during browsing.
 */

import { motion } from 'framer-motion';

export function Signature({ minimal = false }: { minimal?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1.5 }}
      className="fixed bottom-4 left-4 z-40 pointer-events-none select-none"
      dir="ltr"
    >
      <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-ivory/40 font-mono">
        <div className="w-1 h-1 rounded-full bg-gold/60" />
        <span>Joud</span>
        {!minimal && (
          <>
            <span className="text-gold/30">/</span>
            <span>Economic Policy Lab</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
