import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

interface DatasetConfig {
  name: string;
  totalTokens: string;
  totalTokensNum: number;
  domains: { name: string; fraction: number; color: string }[];
}

const DATASETS: DatasetConfig[] = [
  {
    name: 'GPT-3',
    totalTokens: '300B',
    totalTokensNum: 300,
    domains: [
      { name: 'Common Crawl (filtered)', fraction: 0.60, color: '#C76B4A' },
      { name: 'WebText2', fraction: 0.22, color: '#D4A843' },
      { name: 'Books1 & Books2', fraction: 0.08, color: '#8BA888' },
      { name: 'Wikipedia', fraction: 0.03, color: '#5B8DB8' },
      { name: 'Other', fraction: 0.07, color: '#7A8B7C' },
    ],
  },
  {
    name: 'LLaMA 1',
    totalTokens: '1.4T',
    totalTokensNum: 1400,
    domains: [
      { name: 'Common Crawl', fraction: 0.67, color: '#C76B4A' },
      { name: 'C4', fraction: 0.15, color: '#D4A843' },
      { name: 'GitHub', fraction: 0.045, color: '#8BA888' },
      { name: 'Wikipedia', fraction: 0.045, color: '#5B8DB8' },
      { name: 'Books', fraction: 0.045, color: '#9B7EBD' },
      { name: 'ArXiv', fraction: 0.025, color: '#7A8B7C' },
      { name: 'StackExchange', fraction: 0.02, color: '#B8A05B' },
    ],
  },
  {
    name: 'LLaMA 3',
    totalTokens: '15T',
    totalTokensNum: 15000,
    domains: [
      { name: 'Web data', fraction: 0.50, color: '#C76B4A' },
      { name: 'Code', fraction: 0.17, color: '#8BA888' },
      { name: 'Multilingual', fraction: 0.12, color: '#D4A843' },
      { name: 'Math/Reasoning', fraction: 0.08, color: '#5B8DB8' },
      { name: 'Books/Academic', fraction: 0.08, color: '#9B7EBD' },
      { name: 'Other curated', fraction: 0.05, color: '#7A8B7C' },
    ],
  },
  {
    name: 'Chinchilla',
    totalTokens: '1.4T',
    totalTokensNum: 1400,
    domains: [
      { name: 'MassiveWeb', fraction: 0.45, color: '#C76B4A' },
      { name: 'Books', fraction: 0.15, color: '#D4A843' },
      { name: 'C4', fraction: 0.15, color: '#8BA888' },
      { name: 'Wikipedia', fraction: 0.05, color: '#5B8DB8' },
      { name: 'GitHub', fraction: 0.05, color: '#9B7EBD' },
      { name: 'News', fraction: 0.10, color: '#7A8B7C' },
      { name: 'Other', fraction: 0.05, color: '#B8A05B' },
    ],
  },
];

export default function DatasetCompositionViz() {
  const [selectedDataset, setSelectedDataset] = useState(2); // LLaMA 3

  const dataset = DATASETS[selectedDataset];

  const domainTokens = useMemo(() => {
    return dataset.domains.map(d => ({
      ...d,
      tokens: d.fraction * dataset.totalTokensNum,
    }));
  }, [dataset]);

  // Donut chart rendering
  const donutSegments = useMemo(() => {
    const segments: { startAngle: number; endAngle: number; color: string; name: string; fraction: number }[] = [];
    let currentAngle = -90; // Start from top
    dataset.domains.forEach(d => {
      const angle = d.fraction * 360;
      segments.push({
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: d.color,
        name: d.name,
        fraction: d.fraction,
      });
      currentAngle += angle;
    });
    return segments;
  }, [dataset]);

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Dataset Composition
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare training data composition across major LLMs. Toggle between models to see how data mixtures evolved.
        </p>
      </div>

      {/* Dataset selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {DATASETS.map((ds, i) => (
          <button key={ds.name} onClick={() => setSelectedDataset(i)} style={{
            padding: '0.4rem 0.7rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
            border: `1px solid ${selectedDataset === i ? '#C76B4A' : '#E5DFD3'}`,
            background: selectedDataset === i ? '#C76B4A10' : 'transparent',
            color: selectedDataset === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: selectedDataset === i ? 600 : 400,
            cursor: 'pointer',
          }}>
            {ds.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
        {/* Donut chart */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox="0 0 100 100" style={{ width: '140px', height: '140px' }}>
            {donutSegments.map((seg, i) => (
              <path
                key={i}
                d={describeArc(50, 50, 45, seg.startAngle, seg.endAngle)}
                fill={seg.color}
                stroke="#FDFBF7"
                strokeWidth="0.5"
              />
            ))}
            {/* Center hole */}
            <circle cx="50" cy="50" r="25" fill="#FDFBF7" />
            <text x="50" y="47" textAnchor="middle" style={{ fontSize: '8px', fontWeight: 700, fill: '#2C3E2D', fontFamily: "'JetBrains Mono', monospace" }}>
              {dataset.totalTokens}
            </text>
            <text x="50" y="56" textAnchor="middle" style={{ fontSize: '5px', fill: '#7A8B7C', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>
              tokens
            </text>
          </svg>
        </div>

        {/* Stacked bar + legend */}
        <div>
          {/* Stacked horizontal bar */}
          <div style={{ display: 'flex', height: '28px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            {dataset.domains.map(d => (
              <div key={d.name} style={{
                width: `${d.fraction * 100}%`,
                background: d.color,
                transition: 'width 0.3s ease',
                minWidth: d.fraction > 0.03 ? '2px' : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {d.fraction >= 0.1 && (
                  <span style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{(d.fraction * 100).toFixed(0)}%</span>
                )}
              </div>
            ))}
          </div>

          {/* Domain list */}
          {domainTokens.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.7rem', color: '#2C3E2D', flex: 1 }}>{d.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#C76B4A', fontWeight: 600 }}>{(d.fraction * 100).toFixed(1)}%</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: '#7A8B7C' }}>
                {d.tokens >= 1000 ? `${(d.tokens / 1000).toFixed(1)}T` : `${d.tokens.toFixed(0)}B`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-model comparison: total tokens */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>TOTAL TRAINING TOKENS COMPARISON</div>
        {DATASETS.map((ds, i) => {
          const maxTokens = Math.max(...DATASETS.map(d => d.totalTokensNum));
          return (
            <div key={ds.name} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 50px', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: selectedDataset === i ? 600 : 400, color: selectedDataset === i ? '#C76B4A' : '#7A8B7C' }}>{ds.name}</span>
              <div style={{ height: '16px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(ds.totalTokensNum / maxTokens) * 100}%`,
                  background: selectedDataset === i ? '#C76B4A' : '#8BA888',
                  borderRadius: '3px',
                  transition: 'all 0.3s ease',
                  opacity: selectedDataset === i ? 1 : 0.5,
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#7A8B7C', textAlign: 'right' }}>{ds.totalTokens}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Domains</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{dataset.domains.length}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Largest Source</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#3D5240' }}>{(dataset.domains[0].fraction * 100).toFixed(0)}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total Tokens</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{dataset.totalTokens}</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        <strong>Evolution:</strong> Training datasets have grown ~50x from GPT-3 (300B tokens) to LLaMA 3 (15T tokens). Modern mixtures increasingly emphasize code and math data for reasoning, while web data still forms the largest share. Data quality and mixture ratios often matter more than raw scale.
      </div>
    </div>
  );
}
