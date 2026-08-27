import type { EvidenceLevel } from '../../data/sectors';

const LEVEL_CONFIG: Record<EvidenceLevel, { labelAr: string; labelEn: string; color: string; bg: string; icon: string }> = {
  VERIFIED: {
    labelAr: 'بيانات موثقة',
    labelEn: 'VERIFIED',
    color: 'text-emerald-300',
    bg: 'bg-emerald-900/30 border-emerald-700/40',
    icon: '✓',
  },
  CASE_STUDY: {
    labelAr: 'دراسة حالة',
    labelEn: 'CASE STUDY',
    color: 'text-blue-300',
    bg: 'bg-blue-900/30 border-blue-700/40',
    icon: '◆',
  },
  ESTIMATE: {
    labelAr: 'تقدير',
    labelEn: 'ESTIMATE',
    color: 'text-yellow-300',
    bg: 'bg-yellow-900/30 border-yellow-700/40',
    icon: '≈',
  },
  SIMULATION_ASSUMPTION: {
    labelAr: 'فرضية محاكاة',
    labelEn: 'SIM ASSUMPTION',
    color: 'text-orange-300',
    bg: 'bg-orange-900/30 border-orange-700/40',
    icon: '◇',
  },
};

export function EvidenceBadge({
  level,
  size = 'sm',
  showLabel = true,
}: {
  level: EvidenceLevel;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}) {
  const config = LEVEL_CONFIG[level];
  const sizeClass = {
    xs: 'text-[8px] px-1.5 py-0.5',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border ${config.bg} ${config.color} font-mono tracking-wider ${sizeClass}`}
      title={config.labelAr}
    >
      <span className="text-[8px]">{config.icon}</span>
      {showLabel && <span>{config.labelEn}</span>}
    </span>
  );
}
