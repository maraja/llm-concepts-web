import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

// Simulated 2D positions for word embeddings (projected from high-dim space)
const WORDS = [
  { word: 'king', x: 0.7, y: 0.8, group: 'royalty' },
  { word: 'queen', x: 0.75, y: 0.65, group: 'royalty' },
  { word: 'prince', x: 0.65, y: 0.7, group: 'royalty' },
  { word: 'man', x: 0.5, y: 0.75, group: 'gender' },
  { word: 'woman', x: 0.55, y: 0.6, group: 'gender' },
  { word: 'cat', x: 0.2, y: 0.3, group: 'animal' },
  { word: 'dog', x: 0.25, y: 0.35, group: 'animal' },
  { word: 'kitten', x: 0.15, y: 0.25, group: 'animal' },
  { word: 'puppy', x: 0.3, y: 0.4, group: 'animal' },
  { word: 'happy', x: 0.8, y: 0.2, group: 'emotion' },
  { word: 'sad', x: 0.85, y: 0.15, group: 'emotion' },
  { word: 'joy', x: 0.78, y: 0.25, group: 'emotion' },
];

const GROUP_COLORS: Record<string, string> = {
  royalty: '#C76B4A',
  gender: '#D4A843',
  animal: '#8BA888',
  emotion: '#3D5240',
};

export default function EmbeddingSpaceVisualizer() {
  const [selected, setSelected] = useState<number | null>(null);
  const [showGroups, setShowGroups] = useState(true);

  const distances = useMemo(() => {
    if (selected === null) return [];
    const sel = WORDS[selected];
    return WORDS.map((w, i) => ({
      word: w.word,
      dist: Math.sqrt((w.x - sel.x) ** 2 + (w.y - sel.y) ** 2),
      idx: i,
    })).filter((_, i) => i !== selected).sort((a, b) => a.dist - b.dist);
  }, [selected]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Embedding Space
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Token embeddings place semantically similar words close together. Click a word to see its nearest neighbors.
        </p>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '250px', background: '#F0EBE1', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
        {/* Draw group circles when enabled */}
        {showGroups && (
          <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
            {Object.entries(
              WORDS.reduce((acc, w) => {
                if (!acc[w.group]) acc[w.group] = [];
                acc[w.group].push(w);
                return acc;
              }, {} as Record<string, typeof WORDS>)
            ).map(([group, words]) => {
              const cx = words.reduce((s, w) => s + w.x, 0) / words.length;
              const cy = words.reduce((s, w) => s + w.y, 0) / words.length;
              const r = Math.max(0.08, ...words.map(w => Math.sqrt((w.x - cx) ** 2 + (w.y - cy) ** 2))) + 0.04;
              return (
                <circle
                  key={group}
                  cx={`${cx * 100}%`}
                  cy={`${(1 - cy) * 100}%`}
                  r={r * 250}
                  fill={`${GROUP_COLORS[group]}08`}
                  stroke={`${GROUP_COLORS[group]}25`}
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
              );
            })}
          </svg>
        )}

        {WORDS.map((w, i) => (
          <div key={i} onClick={() => setSelected(i === selected ? null : i)} style={{
            position: 'absolute',
            left: `${w.x * 100}%`, top: `${(1 - w.y) * 100}%`,
            transform: 'translate(-50%, -50%)', cursor: 'pointer',
            padding: '0.2rem 0.4rem', borderRadius: '4px',
            background: selected === i ? `${GROUP_COLORS[w.group]}30` : `${GROUP_COLORS[w.group]}15`,
            border: `1px solid ${selected === i ? GROUP_COLORS[w.group] : `${GROUP_COLORS[w.group]}30`}`,
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem',
            color: '#2C3E2D', fontWeight: selected === i ? 700 : 400,
            transition: 'all 0.1s ease', zIndex: selected === i ? 10 : 1,
          }}>
            {w.word}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
        <button onClick={() => setShowGroups(!showGroups)} style={{
          padding: '0.3rem 0.6rem', borderRadius: '5px', border: '1px solid #E5DFD3',
          background: showGroups ? '#C76B4A10' : 'transparent', color: '#5A6B5C',
          fontSize: '0.72rem', cursor: 'pointer',
        }}>
          {showGroups ? 'Hide' : 'Show'} clusters
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: '#7A8B7C' }}>
          {Object.entries(GROUP_COLORS).map(([group, color]) => (
            <span key={group} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              {group}
            </span>
          ))}
        </div>
      </div>

      {selected !== null && distances.length > 0 && (
        <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.4rem', fontWeight: 600 }}>
            Nearest to "{WORDS[selected].word}"
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {distances.slice(0, 5).map((d, i) => (
              <span key={i} style={{
                padding: '0.2rem 0.4rem', borderRadius: '4px',
                background: '#FDFBF7', border: '1px solid #E5DFD3',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#2C3E2D',
              }}>
                {d.word} <span style={{ color: '#7A8B7C', fontSize: '0.6rem' }}>({d.dist.toFixed(2)})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
