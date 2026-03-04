import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const SEQUENCE = ['<BOS>', 'Today', 'was', 'a', 'great', 'day', 'for', 'learning', 'about', 'attention', 'mechanisms', 'in', 'large', 'language', 'models', '.'];

export default function StreamingLLMDemo() {
  const [windowSize, setWindowSize] = useState(6);
  const [keepSinks, setKeepSinks] = useState(true);
  const sinkCount = 1;

  const currentPos = SEQUENCE.length - 1;

  const getStatus = (idx: number) => {
    if (keepSinks && idx < sinkCount) return 'sink';
    if (idx >= currentPos - windowSize + 1 + (keepSinks ? sinkCount : 0)) return 'window';
    return 'evicted';
  };

  const keptCount = SEQUENCE.filter((_, i) => getStatus(i) !== 'evicted').length;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          StreamingLLM: Keep the Sink
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          StreamingLLM keeps initial "sink" tokens + a rolling window to enable infinite-length generation.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Window Size</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{windowSize}</span>
          </div>
          <input type="range" min={2} max={12} step={1} value={windowSize}
            onChange={e => setWindowSize(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <button onClick={() => setKeepSinks(!keepSinks)} style={{
          padding: '0.4rem 0.8rem', borderRadius: '6px',
          border: `1px solid ${keepSinks ? '#8BA888' : '#E5DFD3'}`,
          background: keepSinks ? '#8BA88815' : 'transparent',
          color: keepSinks ? '#3D5240' : '#7A8B7C',
          fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>
          {keepSinks ? 'Sink: ON' : 'Sink: OFF'}
        </button>
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {SEQUENCE.map((tok, i) => {
            const status = getStatus(i);
            return (
              <span key={i} style={{
                padding: '0.3rem 0.45rem', borderRadius: '4px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
                background: status === 'sink' ? '#C76B4A20' : status === 'window' ? '#8BA88820' : '#E5DFD350',
                border: `1px solid ${status === 'sink' ? '#C76B4A40' : status === 'window' ? '#8BA88840' : '#E5DFD3'}`,
                color: status === 'evicted' ? '#B0A898' : '#2C3E2D',
                fontWeight: status === 'sink' ? 700 : status === 'window' ? 500 : 400,
                opacity: status === 'evicted' ? 0.4 : 1,
                textDecoration: status === 'evicted' ? 'line-through' : 'none',
                transition: 'all 0.15s ease',
              }}>
                {tok}
              </span>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.68rem', color: '#7A8B7C' }}>
          <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: '#C76B4A30', border: '1px solid #C76B4A', marginRight: '3px', verticalAlign: 'middle' }} />Sink token</span>
          <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: '#8BA88830', border: '1px solid #8BA888', marginRight: '3px', verticalAlign: 'middle' }} />Active window</span>
          <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: '#E5DFD3', marginRight: '3px', verticalAlign: 'middle' }} />Evicted</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>KV Cache</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{keptCount}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Evicted</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#C76B4A' }}>{SEQUENCE.length - keptCount}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Memory</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>Fixed!</div>
        </div>
      </div>
    </div>
  );
}
