import { useState } from 'react';

const TOKENS = ['Once', 'upon', 'a', 'time', 'there', 'lived', 'a', 'wise', 'old', 'owl', 'who', 'knew'];

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function SlidingWindowVisualizer() {
  const [windowSize, setWindowSize] = useState(4);
  const [selectedPos, setSelectedPos] = useState(7);

  const inWindow = (queryIdx: number, keyIdx: number) =>
    keyIdx >= queryIdx - windowSize + 1 && keyIdx <= queryIdx && keyIdx >= 0;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Sliding Window Attention
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Each token only attends to a fixed window of recent tokens. Adjust the window size and click tokens to explore.
        </p>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>Window Size</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#C76B4A' }}>{windowSize}</span>
        </div>
        <input type="range" min={1} max={TOKENS.length} step={1} value={windowSize}
          onChange={e => setWindowSize(Number(e.target.value))}
          style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
        />
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#7A8B7C', marginBottom: '0.75rem' }}>Click a token to see its attention window:</div>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {TOKENS.map((tok, i) => {
            const isSelected = i === selectedPos;
            const isInWin = inWindow(selectedPos, i);
            return (
              <button key={i} onClick={() => setSelectedPos(i)} style={{
                padding: '0.35rem 0.5rem', borderRadius: '5px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
                border: isSelected ? '2px solid #C76B4A' : `1px solid ${isInWin ? '#8BA888' : '#E5DFD3'}`,
                background: isSelected ? '#C76B4A15' : isInWin ? '#8BA88820' : 'transparent',
                color: isSelected ? '#C76B4A' : isInWin ? '#2C3E2D' : '#B0A898',
                fontWeight: isSelected || isInWin ? 600 : 400,
                cursor: 'pointer', opacity: isInWin || isSelected ? 1 : 0.4,
                transition: 'all 0.15s ease',
              }}>
                {tok}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Window</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#2C3E2D' }}>{windowSize}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Visible</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#8BA888' }}>
            {TOKENS.filter((_, i) => inWindow(selectedPos, i)).length}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Complexity</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: '#D4A843' }}>
            O(n·{windowSize})
          </div>
        </div>
      </div>
    </div>
  );
}
