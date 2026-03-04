import { useState } from 'react';

const LAYERS = [
  { id: 'input', label: 'Input Embedding', desc: 'Token + position embeddings', color: '#8BA888', fixed: true },
  { id: 'attn', label: 'Multi-Head Attention', desc: 'Parallel self-attention heads', color: '#C76B4A' },
  { id: 'norm1', label: 'Layer Norm', desc: 'Normalize activations', color: '#D4A843' },
  { id: 'ffn', label: 'Feed-Forward Network', desc: 'Two linear layers + activation', color: '#6E8B6B' },
  { id: 'norm2', label: 'Layer Norm', desc: 'Second normalization', color: '#D4A843' },
  { id: 'residual', label: 'Residual Connections', desc: 'Skip connections around sub-layers', color: '#7A8B7C' },
  { id: 'output', label: 'Output Projection', desc: 'Linear → logits → softmax', color: '#8BA888', fixed: true },
];

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function TransformerLayerBuilder() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    input: true, attn: true, norm1: true, ffn: true, norm2: true, residual: true, output: true,
  });

  const toggle = (id: string) => {
    const layer = LAYERS.find(l => l.id === id);
    if (layer?.fixed) return;
    setEnabled(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCount = Object.values(enabled).filter(Boolean).length;
  const hasAttn = enabled.attn;
  const hasFFN = enabled.ffn;
  const hasNorm = enabled.norm1 || enabled.norm2;
  const hasResidual = enabled.residual;

  const getVerdict = () => {
    if (hasAttn && hasFFN && hasNorm && hasResidual) return { text: 'Standard Transformer Block', color: '#3D5240' };
    if (hasAttn && hasFFN && !hasNorm) return { text: 'Unstable — will diverge without normalization', color: '#C76B4A' };
    if (!hasAttn && hasFFN) return { text: 'No attention — tokens can\'t interact', color: '#C76B4A' };
    if (hasAttn && !hasFFN) return { text: 'No FFN — limited representation capacity', color: '#D4A843' };
    if (!hasResidual) return { text: 'No residuals — gradients will vanish in deep networks', color: '#D4A843' };
    return { text: 'Incomplete block', color: '#7A8B7C' };
  };

  const verdict = getVerdict();

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Transformer Block Builder
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Toggle components on/off to see what makes a transformer block work — and what breaks when you remove parts.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {LAYERS.map((layer) => {
          const isOn = enabled[layer.id];
          return (
            <button
              key={layer.id}
              onClick={() => toggle(layer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${isOn ? layer.color + '40' : '#E5DFD3'}`,
                background: isOn ? layer.color + '0A' : '#F5F0E8',
                cursor: layer.fixed ? 'default' : 'pointer',
                opacity: isOn ? 1 : 0.4,
                transition: 'all 0.15s ease',
                fontFamily: "'Source Sans 3', system-ui, sans-serif",
                textAlign: 'left' as const,
              }}
            >
              <div style={{
                width: '10px', height: '10px', borderRadius: '3px',
                background: isOn ? layer.color : '#C4BFB3',
                transition: 'background 0.15s ease',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isOn ? '#2C3E2D' : '#7A8B7C' }}>
                  {layer.label}
                  {layer.fixed && <span style={{ fontSize: '0.7rem', color: '#7A8B7C', marginLeft: '0.5rem' }}>(always on)</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7A8B7C' }}>{layer.desc}</div>
              </div>
              {!layer.fixed && (
                <span style={{ fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace", color: isOn ? '#5A6B5C' : '#B0A898' }}>
                  {isOn ? 'ON' : 'OFF'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: verdict.color }}>{verdict.text}</div>
          <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginTop: '0.2rem' }}>{activeCount} of {LAYERS.length} components active</div>
        </div>
        <button
          onClick={() => setEnabled({ input: true, attn: true, norm1: true, ffn: true, norm2: true, residual: true, output: true })}
          style={{ fontSize: '0.72rem', color: '#C76B4A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
        >
          Reset all
        </button>
      </div>
    </div>
  );
}
