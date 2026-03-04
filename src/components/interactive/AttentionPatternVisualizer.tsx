import { useState } from 'react';

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

const PATTERNS: Record<string, number[][]> = {
  'Uniform': TOKENS.map(() => TOKENS.map(() => 1 / TOKENS.length)),
  'Local (adjacent)': TOKENS.map((_, i) =>
    TOKENS.map((_, j) => Math.abs(i - j) <= 1 ? (Math.abs(i - j) === 0 ? 0.5 : 0.25) : 0)
  ),
  'Positional (attend to start)': TOKENS.map(() =>
    TOKENS.map((_, j) => j === 0 ? 0.6 : 0.08)
  ),
  'Semantic (noun→noun)': [
    [0.2, 0.4, 0.1, 0.1, 0.1, 0.1],
    [0.1, 0.3, 0.1, 0.1, 0.1, 0.3],
    [0.15, 0.15, 0.3, 0.15, 0.15, 0.1],
    [0.1, 0.1, 0.2, 0.3, 0.2, 0.1],
    [0.2, 0.1, 0.1, 0.1, 0.3, 0.2],
    [0.05, 0.35, 0.05, 0.05, 0.1, 0.4],
  ],
};

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function AttentionPatternVisualizer() {
  const [pattern, setPattern] = useState<string>('Semantic (noun→noun)');
  const [hovered, setHovered] = useState<[number, number] | null>(null);
  const matrix = PATTERNS[pattern];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Attention Pattern Explorer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Different attention heads learn different patterns. Hover over the heatmap to see attention weights.
        </p>
      </div>

      {/* Pattern selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {Object.keys(PATTERNS).map(p => (
          <button
            key={p}
            onClick={() => setPattern(p)}
            style={{
              padding: '0.35rem 0.7rem', borderRadius: '6px',
              border: `1px solid ${pattern === p ? '#C76B4A' : '#E5DFD3'}`,
              background: pattern === p ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
              color: pattern === p ? '#C76B4A' : '#5A6B5C',
              fontWeight: pattern === p ? 600 : 400,
              fontSize: '0.75rem', cursor: 'pointer',
              fontFamily: "'Source Sans 3', system-ui, sans-serif",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', overflowX: 'auto' }}>
        {/* Column headers (Keys) */}
        <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${TOKENS.length}, 1fr)`, gap: '2px', marginBottom: '2px' }}>
          <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textAlign: 'center' }}>Q↓ K→</div>
          {TOKENS.map((t, j) => (
            <div key={j} style={{
              fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace",
              color: hovered && hovered[1] === j ? '#C76B4A' : '#5A6B5C',
              fontWeight: hovered && hovered[1] === j ? 600 : 400,
              textAlign: 'center',
            }}>
              {t}
            </div>
          ))}
        </div>

        {/* Rows */}
        {matrix.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: `60px repeat(${TOKENS.length}, 1fr)`, gap: '2px', marginBottom: '2px' }}>
            <div style={{
              fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace",
              color: hovered && hovered[0] === i ? '#C76B4A' : '#5A6B5C',
              fontWeight: hovered && hovered[0] === i ? 600 : 400,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem',
            }}>
              {TOKENS[i]}
            </div>
            {row.map((val, j) => {
              const isHovered = hovered && hovered[0] === i && hovered[1] === j;
              const intensity = Math.round(val * 255);
              return (
                <div
                  key={j}
                  onMouseEnter={() => setHovered([i, j])}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    aspectRatio: '1',
                    background: `rgba(199, 107, 74, ${val * 0.85 + 0.05})`,
                    borderRadius: '3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: val > 0.3 ? '#FDFBF7' : '#5A6B5C',
                    cursor: 'pointer',
                    outline: isHovered ? '2px solid #C76B4A' : 'none',
                    outlineOffset: '-1px',
                    transition: 'outline 0.1s ease',
                    minHeight: '32px',
                  }}
                >
                  {isHovered ? val.toFixed(2) : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {hovered && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#5A6B5C', textAlign: 'center' }}>
          "<strong style={{ color: '#2C3E2D' }}>{TOKENS[hovered[0]]}</strong>" attends to "<strong style={{ color: '#C76B4A' }}>{TOKENS[hovered[1]]}</strong>" with weight <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#C76B4A' }}>{matrix[hovered[0]][hovered[1]].toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
