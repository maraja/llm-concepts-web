import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const CAPABILITY_AXES = [
  { key: 'reasoning', label: 'Reasoning', angle: -90 },
  { key: 'coding', label: 'Coding', angle: -18 },
  { key: 'creativity', label: 'Creativity', angle: 54 },
  { key: 'language', label: 'Language', angle: 126 },
  { key: 'knowledge', label: 'Knowledge', angle: 198 },
];

const DOMAINS = [
  {
    key: 'code',
    label: 'Code',
    color: '#C76B4A',
    impact: { reasoning: 0.8, coding: 1.0, creativity: 0.2, language: 0.2, knowledge: 0.3 },
    tradeoff: { reasoning: 0.1, coding: -0.5, creativity: 0.3, language: 0.4, knowledge: 0.3 },
  },
  {
    key: 'books',
    label: 'Books',
    color: '#D4A843',
    impact: { reasoning: 0.4, coding: 0.05, creativity: 0.9, language: 0.95, knowledge: 0.6 },
    tradeoff: { reasoning: 0.3, coding: 0.4, creativity: -0.3, language: -0.4, knowledge: 0.2 },
  },
  {
    key: 'academic',
    label: 'Academic Papers',
    color: '#6E8B6B',
    impact: { reasoning: 0.85, coding: 0.2, creativity: 0.3, language: 0.5, knowledge: 1.0 },
    tradeoff: { reasoning: -0.1, coding: 0.3, creativity: 0.4, language: 0.3, knowledge: -0.5 },
  },
  {
    key: 'web',
    label: 'Web Text',
    color: '#8BA888',
    impact: { reasoning: 0.5, coding: 0.15, creativity: 0.55, language: 0.7, knowledge: 0.65 },
    tradeoff: { reasoning: 0.2, coding: 0.3, creativity: 0.2, language: 0.1, knowledge: 0.1 },
  },
];

export default function DomainWeightImpact() {
  const [selectedDomain, setSelectedDomain] = useState(0);
  const [domainWeight, setDomainWeight] = useState(30);

  const domain = DOMAINS[selectedDomain];

  const capabilities = useMemo(() => {
    const w = domainWeight / 100;
    const result: Record<string, number> = {};
    for (const axis of CAPABILITY_AXES) {
      const base = 0.35;
      const domainBoost = domain.impact[axis.key as keyof typeof domain.impact] * w;
      const otherPenalty = domain.tradeoff[axis.key as keyof typeof domain.tradeoff] * (1 - w) * 0.5;
      result[axis.key] = Math.min(Math.max(base + domainBoost + otherPenalty, 0.05), 1);
    }
    return result;
  }, [selectedDomain, domainWeight, domain]);

  const radarSize = 220;
  const center = radarSize / 2;
  const maxRadius = 85;

  const getPoint = (angle: number, value: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + Math.cos(rad) * maxRadius * value,
      y: center + Math.sin(rad) * maxRadius * value,
    };
  };

  const radarPoints = CAPABILITY_AXES.map(axis => getPoint(axis.angle, capabilities[axis.key]));
  const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Domain Weight Impact
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how increasing a single domain's weight reshapes model capabilities. Higher weight in one area means less budget for others.
        </p>
      </div>

      {/* Domain selector */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {DOMAINS.map((d, i) => (
          <button key={d.key} onClick={() => setSelectedDomain(i)} style={{
            padding: '0.35rem 0.65rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
            border: `1px solid ${selectedDomain === i ? d.color : '#E5DFD3'}`,
            background: selectedDomain === i ? `${d.color}10` : 'transparent',
            color: selectedDomain === i ? d.color : '#5A6B5C',
            fontWeight: selectedDomain === i ? 600 : 400,
            cursor: 'pointer',
          }}>
            {d.label}
          </button>
        ))}
      </div>

      {/* Weight slider */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>{domain.label} weight in training mix</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{domainWeight}%</span>
        </div>
        <input type="range" min={0} max={80} step={1} value={domainWeight}
          onChange={e => setDomainWeight(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: `linear-gradient(to right, #8BA888, ${domain.color})`, borderRadius: '3px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.15rem' }}>
          <span>0% (none)</span>
          <span>80% (dominant)</span>
        </div>
      </div>

      {/* Radar chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', display: 'inline-block' }}>
          <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
            {/* Grid rings */}
            {[0.25, 0.5, 0.75, 1].map(r => (
              <polygon key={r}
                points={CAPABILITY_AXES.map(a => {
                  const p = getPoint(a.angle, r);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none" stroke="#E5DFD3" strokeWidth={1}
              />
            ))}
            {/* Axis lines */}
            {CAPABILITY_AXES.map(axis => {
              const end = getPoint(axis.angle, 1);
              return <line key={axis.key} x1={center} y1={center} x2={end.x} y2={end.y} stroke="#E5DFD3" strokeWidth={1} />;
            })}
            {/* Data polygon */}
            <path d={radarPath} fill={`${domain.color}25`} stroke={domain.color} strokeWidth={2} />
            {/* Data points */}
            {radarPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill={domain.color} />
            ))}
            {/* Labels */}
            {CAPABILITY_AXES.map(axis => {
              const labelPos = getPoint(axis.angle, 1.2);
              return (
                <text key={axis.key} x={labelPos.x} y={labelPos.y}
                  textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: '10px', fill: '#2C3E2D', fontWeight: 600, fontFamily: "'Source Sans 3', sans-serif" }}>
                  {axis.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Capability scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
        {CAPABILITY_AXES.map(axis => (
          <div key={axis.key} style={{ padding: '0.5rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{axis.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: capabilities[axis.key] > 0.7 ? '#3D5240' : capabilities[axis.key] > 0.4 ? '#D4A843' : '#C76B4A' }}>
              {(capabilities[axis.key] * 100).toFixed(0)}
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Tradeoff:</strong> At {domainWeight}% {domain.label.toLowerCase()}, the model {domainWeight > 50 ? 'strongly specializes, gaining depth in its focus area but losing breadth elsewhere' : domainWeight > 25 ? 'shows a balanced profile with moderate specialization' : 'maintains broad capabilities but lacks domain depth'}. Real models tune these ratios over months of experimentation.
      </div>
    </div>
  );
}
