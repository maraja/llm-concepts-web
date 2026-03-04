import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const FORMATS = [
  {
    name: 'Chat (ChatML)',
    tokens: [
      { text: '<|im_start|>', type: 'control', desc: 'Turn start marker' },
      { text: 'system', type: 'role', desc: 'Role identifier' },
      { text: '<|im_end|>', type: 'control', desc: 'Turn end marker' },
      { text: '<|im_start|>', type: 'control', desc: 'Turn start marker' },
      { text: 'user', type: 'role', desc: 'Role identifier' },
      { text: 'Hello!', type: 'content', desc: 'User message content' },
      { text: '<|im_end|>', type: 'control', desc: 'Turn end marker' },
      { text: '<|im_start|>', type: 'control', desc: 'Turn start marker' },
      { text: 'assistant', type: 'role', desc: 'Role identifier' },
    ],
  },
  {
    name: 'LLaMA 3',
    tokens: [
      { text: '<|begin_of_text|>', type: 'control', desc: 'Sequence start' },
      { text: '<|start_header_id|>', type: 'control', desc: 'Header open' },
      { text: 'system', type: 'role', desc: 'Role identifier' },
      { text: '<|end_header_id|>', type: 'control', desc: 'Header close' },
      { text: 'You are helpful.', type: 'content', desc: 'System instruction' },
      { text: '<|eot_id|>', type: 'control', desc: 'End of turn' },
      { text: '<|start_header_id|>', type: 'control', desc: 'Header open' },
      { text: 'user', type: 'role', desc: 'Role identifier' },
      { text: '<|end_header_id|>', type: 'control', desc: 'Header close' },
    ],
  },
  {
    name: 'Classic (GPT-2)',
    tokens: [
      { text: '<|endoftext|>', type: 'control', desc: 'Document separator' },
      { text: 'Once upon', type: 'content', desc: 'Document content' },
      { text: ' a time', type: 'content', desc: 'Document content' },
      { text: '<|endoftext|>', type: 'control', desc: 'Document separator' },
      { text: 'In the', type: 'content', desc: 'Next document' },
      { text: ' beginning', type: 'content', desc: 'Next document' },
    ],
  },
];

const TYPE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  control: { bg: '#C76B4A18', border: '#C76B4A35', color: '#C76B4A' },
  role: { bg: '#D4A84318', border: '#D4A84335', color: '#D4A843' },
  content: { bg: '#8BA88818', border: '#8BA88835', color: '#3D5240' },
};

export default function SpecialTokenMap() {
  const [formatIdx, setFormatIdx] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const format = FORMATS[formatIdx];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Special Token Formats
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Hover over tokens to see their purpose. Different models use different control token conventions.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {FORMATS.map((f, i) => (
          <button key={i} onClick={() => { setFormatIdx(i); setHovered(null); }} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${formatIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: formatIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: formatIdx === i ? '#C76B4A' : '#5A6B5C',
            fontWeight: formatIdx === i ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer',
          }}>
            {f.name}
          </button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {format.tokens.map((tok, i) => {
            const style = TYPE_STYLES[tok.type];
            return (
              <span key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: '0.3rem 0.45rem', borderRadius: '4px',
                  background: style.bg, border: `1px solid ${style.border}`,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
                  color: hovered === i ? style.color : '#2C3E2D',
                  fontWeight: hovered === i ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.1s ease',
                  transform: hovered === i ? 'translateY(-2px)' : 'none',
                }}>
                {tok.text}
              </span>
            );
          })}
        </div>
        {hovered !== null && (
          <div style={{ padding: '0.5rem 0.75rem', background: '#FDFBF7', borderRadius: '6px', border: '1px solid #E5DFD3', fontSize: '0.78rem' }}>
            <span style={{ color: TYPE_STYLES[format.tokens[hovered].type].color, fontWeight: 600 }}>{format.tokens[hovered].type}</span>
            <span style={{ color: '#7A8B7C' }}> — </span>
            <span style={{ color: '#5A6B5C' }}>{format.tokens[hovered].desc}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: '#7A8B7C' }}>
        {Object.entries(TYPE_STYLES).map(([type, style]) => (
          <span key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: style.bg, border: `1px solid ${style.border}` }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
