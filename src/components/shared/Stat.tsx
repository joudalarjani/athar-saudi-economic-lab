import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { formatNumber, formatSAR, formatPercent, formatMultiplier } from '../../lib/format';

type StatFormat = 'sar' | 'sar-compact' | 'number' | 'percent' | 'multiplier';

interface StatProps {
  label: string;
  value: number;
  format?: StatFormat;
  decimals?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  prefix?: string;
  suffix?: string;
  /** Direction hint for color (positive = emerald, negative = coral) */
  trend?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
}

export function Stat({
  label,
  value,
  format = 'number',
  decimals = 0,
  color = 'text-ivory',
  size = 'md',
  prefix = '',
  suffix = '',
  trend,
  subtitle,
}: StatProps) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (v) => {
    if (format === 'sar') return formatSAR(v, { decimals });
    if (format === 'sar-compact') return formatSAR(v, { compact: true });
    if (format === 'percent') return formatPercent(v, decimals);
    if (format === 'multiplier') return formatMultiplier(v);
    return formatNumber(v, decimals);
  });

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: 'easeOut' });
    return controls.stop;
  }, [value, motionValue]);

  const sizeClass = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }[size];

  const trendColor =
    trend === 'positive'
      ? 'text-[#10b981]'
      : trend === 'negative'
      ? 'text-red-400'
      : color;

  return (
    <div className="flex flex-col">
      <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 font-mono mb-1">{label}</div>
      <motion.div
        className={`font-mono font-semibold tabular-nums ${sizeClass} ${trendColor}`}
      >
        {prefix}
        <motion.span>{display}</motion.span>
        {suffix}
      </motion.div>
      {subtitle && <div className="text-[10px] text-ivory/40 mt-1">{subtitle}</div>}
    </div>
  );
}
