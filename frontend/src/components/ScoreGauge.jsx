const COMPONENT_META = [
  { key: 'research_novelty', label: 'Research Novelty' },
  { key: 'patent_strength', label: 'Patent Strength' },
  { key: 'technology_maturity', label: 'Technology Maturity' },
  { key: 'market_potential', label: 'Market Potential' },
  { key: 'funding_relevance', label: 'Funding Relevance' },
];

const SIZE = 220;
const CENTER = SIZE / 2;
const BASE_RADIUS = 44;
const RING_GAP = 14;

export default function ScoreGauge({ score, breakdown }) {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {COMPONENT_META.map((meta, i) => {
          const comp = breakdown?.[meta.key];
          if (!comp) return null;
          const radius = BASE_RADIUS + i * RING_GAP;
          const circumference = 2 * Math.PI * radius;
          const strokeWidth = 6 + comp.weight * 30;
          const pct = Math.max(0, Math.min(comp.score, 100)) / 100;
          const dash = circumference * pct;

          return (
            <g key={meta.key} transform={`rotate(-90 ${CENTER} ${CENTER})`}>
              <circle
                cx={CENTER} cy={CENTER} r={radius}
                fill="none" stroke="var(--border)" strokeWidth={strokeWidth}
              />
              <circle
                cx={CENTER} cy={CENTER} r={radius}
                fill="none" stroke="var(--gold)" strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="butt"
                opacity={0.55 + pct * 0.45}
              />
            </g>
          );
        })}
        <text
          x={CENTER} y={CENTER - 4} textAnchor="middle"
          fontFamily="var(--font-display)" fontSize="30" fill="var(--gold)"
        >
          {score?.toFixed(1)}
        </text>
        <text
          x={CENTER} y={CENTER + 16} textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.1em"
          fill="var(--text-faint)"
        >
          INNOVATION SCORE
        </text>
      </svg>

      <div style={{ minWidth: 220 }}>
        {COMPONENT_META.map((meta) => {
          const comp = breakdown?.[meta.key];
          if (!comp) return null;
          return (
            <div key={meta.key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-dim)' }}>{meta.label}</span>
                <span className="mono" style={{ color: 'var(--text)' }}>
                  {comp.score.toFixed(0)} <span style={{ color: 'var(--text-faint)' }}>· {(comp.weight * 100).toFixed(0)}%</span>
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 4 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(comp.score, 100)}%`,
                    background: 'var(--gold)',
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
