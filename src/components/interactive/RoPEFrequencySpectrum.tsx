import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function RoPEFrequencySpectrum() {
  const [baseFreq, setBaseFreq] = useState(10000);
  const [dModel, setDModel] = useState(64);

  const numPairs = Math.floor(dModel / 2);
  const frequencies = useMemo(() => {
    return Array.from({ length: numPairs }, (_, i) => ({
      pair: i,
      freq: 1 / Math.pow(baseFreq, (2 * i) / dModel),
      wavelength: 2 * Math.PI * Math.pow(baseFreq, (2 * i) / dModel),
    }));
  }, [baseFreq, dModel, numPairs]);

  const maxFreq = frequencies[0]?.freq || 1;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          RoPE Frequency Spectrum
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Each dimension pair rotates at a different frequency. Low pairs capture local position, high pairs capture long-range position.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Base frequency</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{baseFreq.toLocaleString()}</span>
          </div>
          <input type="range" min={100} max={1000000} step={100} value={baseFreq}
            onChange={e => setBaseFreq(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
            <span>100</span><span>Default: 10,000</span><span>1,000,000</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}><i style={{ fontFamily: "'KaTeX_Math', 'Times New Roman', serif" }}>d</i><sub style={{ fontSize: '0.75em' }}>model</sub></span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{dModel}</span>
          </div>
          <input type="range" min={16} max={256} step={16} value={dModel}
            onChange={e => setDModel(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Rotation frequency by dimension pair ({numPairs} pairs)
        </div>
        <div style={{ display: 'flex', gap: '2px', height: '100px', alignItems: 'flex-end' }}>
          {frequencies.map((f, i) => {
            const height = Math.max(2, (Math.log(f.freq + 1e-10) - Math.log(frequencies[frequencies.length - 1].freq)) /
              (Math.log(maxFreq) - Math.log(frequencies[frequencies.length - 1].freq)) * 100);
            const hue = 140 - (i / numPairs) * 100;
            return (
              <div key={i} style={{
                flex: 1, minWidth: '2px', borderRadius: '2px 2px 0 0',
                height: `${height}%`,
                background: `hsl(${hue}, 40%, 50%)`,
                transition: 'height 0.2s ease',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.6rem', color: '#7A8B7C' }}>
          <span>Pair 0 (high freq, local)</span>
          <span>Pair {numPairs - 1} (low freq, global)</span>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        Higher base → slower rotation → longer effective context. LLaMA 3.1 uses base <strong>500,000</strong> (vs. default 10,000) for 128K context.
      </div>
    </div>
  );
}
