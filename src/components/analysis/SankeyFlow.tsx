import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { useLabStore } from '../../state/labStore';
import { SECTORS, TOTAL_BUDGET } from '../../data/sectors';
import { EvidenceBadge } from '../shared/EvidenceBadge';

const W = 920;
const H = 520;

interface SFNode {
  name: string;
  value: number;
  color: string;
  level: number;
}

interface SFLink {
  source: number | SFNode;
  target: number | SFNode;
  value: number;
}

interface RenderedNode {
  name: string;
  color: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  value: number;
}

interface RenderedLink {
  path: string | null;
  fromColor: string;
  toColor: string;
  value: number;
}

const IMPACT_COLOR = 'rgba(16, 185, 129, 0.6)';
const OUTCOME_COLOR = 'rgba(212, 160, 23, 0.6)';

export function SankeyFlow() {
  const allocations = useLabStore((s) => s.allocations);

  const { nodes, links } = useMemo(() => {
    const sectorNodes = SECTORS.filter((s) => (allocations[s.id] ?? 0) > 1)
      .map((s) => ({
        name: s.arName,
        value: allocations[s.id] ?? 0,
        color: '#10b981',
        level: 1,
      }));

    const impactTypes = [
      { name: 'Direct', color: IMPACT_COLOR },
      { name: 'Indirect', color: IMPACT_COLOR },
      { name: 'Induced', color: IMPACT_COLOR },
    ];
    const impactNodes = impactTypes.map((it) => ({
      name: it.name,
      value: 0,
      color: it.color,
      level: 2,
    }));

    const outcomes = [
      { name: 'Jobs', color: OUTCOME_COLOR },
      { name: 'Families', color: OUTCOME_COLOR },
      { name: 'GDP', color: OUTCOME_COLOR },
    ];
    const outcomeNodes = outcomes.map((o) => ({
      name: o.name,
      value: 0,
      color: o.color,
      level: 3,
    }));

    const graphNodes: SFNode[] = [
      { name: 'رأس المال', value: TOTAL_BUDGET, color: '#d4a017', level: 0 },
      ...sectorNodes,
      ...impactNodes,
      ...outcomeNodes,
    ];

    const links: SFLink[] = [];
    // Source -> Sectors
    sectorNodes.forEach((_, i) => {
      links.push({ source: 0, target: i + 1, value: graphNodes[i + 1].value });
    });
    // Sectors -> Impact types (direct/indirect/induced splits)
    sectorNodes.forEach((sn, i) => {
      const sector = SECTORS.filter((s) => (allocations[s.id] ?? 0) > 1)[i];
      if (!sector) return;
      const m = sector.multiplier;
      const A = sn.value;
      const direct = A * m.direct;
      const indirect = direct * m.indirect;
      const induced = (direct + indirect) * m.induced;
      const total = direct + indirect + induced || 1;
      const scaling = A / total;
      const d = direct * scaling;
      const ind = indirect * scaling;
      const indc = induced * scaling;
      const impactStart = 1 + sectorNodes.length;
      links.push({ source: i + 1, target: impactStart + 0, value: d });
      links.push({ source: i + 1, target: impactStart + 1, value: ind });
      links.push({ source: i + 1, target: impactStart + 2, value: indc });
    });
    // Impact types -> Outcomes
    const impactStart = 1 + sectorNodes.length;
    const outcomeStart = impactStart + 3;
    const impactTotals = [0, 1, 2].map((k) =>
      links
        .filter((l) => l.source === impactStart + k)
        .reduce((s, l) => s + l.value, 0)
    );
    links.push({ source: impactStart + 0, target: outcomeStart + 1, value: impactTotals[0] * 0.6 }); // direct -> families
    links.push({ source: impactStart + 0, target: outcomeStart + 0, value: impactTotals[0] * 0.4 }); // direct -> jobs
    links.push({ source: impactStart + 1, target: outcomeStart + 2, value: impactTotals[1] });       // indirect -> gdp
    links.push({ source: impactStart + 2, target: outcomeStart + 0, value: impactTotals[2] * 0.5 }); // induced -> jobs
    links.push({ source: impactStart + 2, target: outcomeStart + 2, value: impactTotals[2] * 0.5 }); // induced -> gdp

    return { nodes: graphNodes, links };
  }, [allocations]);

  const { renderedNodes, renderedLinks } = useMemo(() => {
    const gen = (sankey as any)()
      .nodeWidth(16)
      .nodePadding(18)
      .extent([
        [10, 10],
        [W - 10, H - 10],
      ]);
    const graph = gen({ nodes, links });
    const rn = (graph.nodes as any[]).map((n) => ({
      name: (n as SFNode).name,
      color: (n as SFNode).color,
      x0: n.x0,
      x1: n.x1,
      y0: n.y0,
      y1: n.y1,
      value: n.value as number,
    })) as RenderedNode[];
    const linkPath = sankeyLinkHorizontal();
    const rl = (graph.links as any[])
      .map((l) => {
        const d = linkPath(l);
        const srcColor = (l.source as SFNode).color ?? '#d4a017';
        const tgtColor = (l.target as SFNode).color ?? '#d4a017';
        return { path: d as unknown as string | null, fromColor: srcColor, toColor: tgtColor, value: l.value as number };
      })
      .filter((l) => l.path && l.value > 0);
    return { renderedNodes: rn, renderedLinks: rl };
  }, [nodes, links]);

  const maxValue = Math.max(1, ...renderedNodes.map((n) => n.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel terminal-border p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="text-[10px] tracking-widest uppercase text-gold font-mono">
          خريطة تدفق الأثر
        </div>
        <EvidenceBadge level="SIMULATION_ASSUMPTION" size="xs" />
      </div>
      <div className="text-xs text-ivory/60 mb-4">
        كيف يتحول رأس المال إلى أثر اجتماعي واقتصادي — يتحدث تلقائيًا مع تخصيصك
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="خريطة تدفق الأثر: من رأس المال إلى القطاعات إلى أنواع الأثر إلى النتائج"
      >
        <defs>
          <linearGradient id="sankeyLinkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d4a017" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Links */}
        {renderedLinks.map((l, i) => (
          <path
            key={i}
            d={l.path ?? undefined}
            fill="none"
            stroke="url(#sankeyLinkGrad)"
            strokeOpacity={0.35}
            strokeWidth={Math.max(1, (l.value / maxValue) * 40)}
          />
        ))}

        {/* Nodes */}
        {renderedNodes.map((n, i) => (
          <g key={i}>
            <rect
              x={n.x0}
              y={n.y0}
              width={n.x1 - n.x0}
              height={Math.max(2, n.y1 - n.y0)}
              fill={n.color}
              rx={2}
            />
            <text
              x={n.x1 + 6}
              y={(n.y0 + n.y1) / 2}
              dominantBaseline="middle"
              fill="#f0e6d3"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
            >
              {n.name}
              <tspan fill="#d4a017"> · {(n.value / 1_000_000).toFixed(1)}M</tspan>
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-4 text-[10px] text-ivory/50 leading-relaxed">
        عرض مرئي لكيفية تحول رأس المال إلى أثر اجتماعي واقتصادي عبر سلسلة التأثير.
        <span className="font-mono text-ivory/30"> (Simulation based on stated assumptions)</span>
      </div>
      <div className="mt-2 text-[9px] font-mono text-gold/50 uppercase text-center" style={{ letterSpacing: '0.3em' }}>
        Joud Al-Arjani
      </div>
    </motion.div>
  );
}
