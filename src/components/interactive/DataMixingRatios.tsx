import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const DOMAINS = [
  { key: 'web', label: 'Web Text', color: '#8BA888', capabilities: { reasoning: 0.5, coding: 0.2, language: 0.8, knowledge: 0.7, creativity: 0.6 } },
  { key: 'code', label: 'Code', color: '#C76B4A', capabilities: { reasoning: 0.9, coding: 1.0, language: 0.3, knowledge: 0.4, creativity: 0.3 } },
  { key: 'books', label: 'Books', color: '#D4A843', capabilities: { reasoning: 0.6, coding: 0.1, language: 0.9, knowledge: 0.8, creativity: 0.9 } },
  { key: 'academic', label: 'Academic', color: '#6E8B6B', capabilities: { reasoning: 0.8, coding: 0.3, language: 0.7, knowledge: 1.0, creativity: 0.4 } },
  { key: 'social', label: 'Social/Chat', color: '#7A8B7C', capabilities: { reasoning: 0.3, coding: 0.1, language: 0.6, knowledge: 0.3, creativity: 0.7 } },
];

const PRESETS: Record<string, Record<string, number>> = {
  custom: { web: 40, code: 20, books: 15, academic: 15, social: 10 },
  llama: { web: 67, code: 5, books: 15, academic: 5, social: 8 },
  gpt3: { web: 60, code: 3, books: 16, academic: 14, social: 7 },
};

const CAPABILITY_LABELS: Record<string, string> = {
  reasoning: 'Reasoning',
  coding: 'Coding',
  language: 'Language',
  knowledge: 'Knowledge',
  creativity: 'Creativity',
};

export default function DataMixingRatios() {
  const [rawWeights, setRawWeights] = useState<Record<string, number>>(PRESETS.custom);
  const [activePreset, setActivePreset] = useState<string>('custom');

  const totalRaw = useMemo(() => Object.values(rawWeights).reduce((s, v) => s + v, 0), [rawWeights]);

  const normalized = useMemo(() => {
    const result: Record<string, number> = {};
    for (const d of DOMAINS) {
      result[d.key] = totalRaw > 0 ? (rawWeights[d.key] / totalRaw) * 100 : 0;
    }
    return result;
  }, [rawWeights, totalRaw]);

  const capabilities = useMemo(() => {
    const caps: Record<string, number> = {};
    for (const capKey of Object.keys(CAPABILITY_LABELS)) {
      let total = 0;
      for (const d of DOMAINS) {
        total += (normalized[d.key] / 100) * d.capabilities[capKey as keyof typeof d.capabilities];
      }
      caps[capKey] = Math.min(total * 1.5, 1);
    }
    return caps;
  }, [normalized]);

  const handleSlider = (key: string, value: number) => {
    setActivePreset('custom');
    setRawWeights(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (name: string) => {
    setActivePreset(name);
    setRawWeights({ ...PRESETS[name] });
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Data Mixing Ratios
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Adjust domain weights to see how training data composition affects model capabilities. Weights auto-normalize to 100%.
        </p>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { key: 'custom', label: 'Custom' },
          { key: 'llama', label: 'LLaMA-like' },
          { key: 'gpt3', label: 'GPT-3-like' },
        ].map(p => (
          <button key={p.key} onClick={() => applyPreset(p.key)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
            border: `1px solid ${activePreset === p.key ? '#C76B4A' : '#E5DFD3'}`,
            background: activePreset === p.key ? 'rgba(199, 107, 74, 0.06)' : 'transparent',
            color: activePreset === p.key ? '#C76B4A' : '#5A6B5C',
            fontWeight: activePreset === p.key ? 600 : 400,
            cursor: 'pointer',
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Domain sliders */}
      <div style={{ marginBottom: '1.25rem' }}>
        {DOMAINS.map(d => (
          <div key={d.key} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>{d.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>
                {normalized[d.key].toFixed(1)}%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="range" min={0} max={100} step={1} value={rawWeights[d.key]}
                onChange={e => handleSlider(d.key, Number(e.target.value))}
                style={{ flex: 1, height: '6px', appearance: 'none', WebkitAppearance: 'none', background: `linear-gradient(to right, ${d.color}, ${d.color}40)`, borderRadius: '3px', cursor: 'pointer' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Normalized bar visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Normalized data mix</div>
        <div style={{ display: 'flex', height: '28px', borderRadius: '4px', overflow: 'hidden' }}>
          {DOMAINS.map(d => (
            <div key={d.key} style={{
              width: `${normalized[d.key]}%`,
              background: d.color,
              transition: 'width 0.3s ease',
              minWidth: normalized[d.key] > 0 ? '2px' : '0px',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
          {DOMAINS.map(d => (
            <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#5A6B5C' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />
              {d.label}
            </div>
          ))}
        </div>
      </div>

      {/* Estimated capabilities */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Estimated model capabilities</div>
        {Object.entries(CAPABILITY_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 40px', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
            <div style={{ height: '14px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${capabilities[key] * 100}%`,
                background: capabilities[key] > 0.7 ? '#8BA888' : capabilities[key] > 0.4 ? '#D4A843' : '#C76B4A',
                borderRadius: '3px',
                transition: 'width 0.3s ease, background 0.3s ease',
              }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#7A8B7C', textAlign: 'right' }}>
              {(capabilities[key] * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> Real training mixes are carefully tuned. LLaMA heavily weights web text (~67%) while keeping code low (~5%), whereas code-focused models like StarCoder invert this ratio. The optimal mix depends on the model's intended use case.
      </div>
    </div>
  );
}
