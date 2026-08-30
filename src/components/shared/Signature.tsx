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
      <div className="flex items-center gap-2 font-mono uppercase" style={{ letterSpacing: '0.35em', fontSize: '9px', color: 'rgba(240,230,211,0.38)' }}>
        <span className="text-gold/70">/</span>
        <span className="text-gold/90">J O U D</span>
        {!minimal && (
          <>
            <span className="text-gold/30">—</span>
            <span>ECONOMIC POLICY LAB</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
