import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function BackpropChainRule() {
  const [inputVal, setInputVal] = useState(1.5);
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(-0.5);
  const [w3, setW3] = useState(1.2);

  const network = useMemo(() => {
    // Forward pass: x -> h1 = relu(w1*x) -> h2 = relu(w2*h1) -> out = w3*h2
    const z1 = w1 * inputVal;
    const h1 = Math.max(0, z1); // ReLU
    const z2 = w2 * h1;
    const h2 = Math.max(0, z2); // ReLU
    const out = w3 * h2;
    const target = 1.0;
    const loss = 0.5 * (out - target) ** 2;

    // Backward pass
    const dLoss_dOut = out - target;
    const dOut_dH2 = w3;
    const dH2_dZ2 = z2 > 0 ? 1 : 0; // ReLU derivative
    const dZ2_dH1 = w2;
    const dH1_dZ1 = z1 > 0 ? 1 : 0; // ReLU derivative
    const dZ1_dX = w1;

    // Chain rule gradients at each layer
    const grad_out = dLoss_dOut;
    const grad_h2 = dLoss_dOut * dOut_dH2;
    const grad_z2 = grad_h2 * dH2_dZ2;
    const grad_h1 = grad_z2 * dZ2_dH1;
    const grad_z1 = grad_h1 * dH1_dZ1;
    const grad_x = grad_z1 * dZ1_dX;

    // Gradients w.r.t. weights
    const grad_w3 = dLoss_dOut * h2;
    const grad_w2 = grad_h2 * dH2_dZ2 * h1;
    const grad_w1 = grad_z2 * dZ2_dH1 * dH1_dZ1 * inputVal;

    return {
      forward: [
        { label: 'Input (x)', value: inputVal },
        { label: 'z1 = w1 * x', value: z1 },
        { label: 'h1 = ReLU(z1)', value: h1 },
        { label: 'z2 = w2 * h1', value: z2 },
        { label: 'h2 = ReLU(z2)', value: h2 },
        { label: 'out = w3 * h2', value: out },
      ],
      gradients: [
        { label: 'dL/dout', value: grad_out },
        { label: 'dL/dh2', value: grad_h2 },
        { label: 'dL/dz2', value: grad_z2 },
        { label: 'dL/dh1', value: grad_h1 },
        { label: 'dL/dz1', value: grad_z1 },
        { label: 'dL/dx', value: grad_x },
      ],
      weightGrads: [
        { label: 'dL/dw3', value: grad_w3, weight: 'w3' },
        { label: 'dL/dw2', value: grad_w2, weight: 'w2' },
        { label: 'dL/dw1', value: grad_w1, weight: 'w1' },
      ],
      loss,
      deadReLU: z1 <= 0 || z2 <= 0,
    };
  }, [inputVal, w1, w2, w3]);

  const maxGrad = Math.max(...network.gradients.map(g => Math.abs(g.value)), 0.01);

  const gradColor = (val: number) => {
    const intensity = Math.min(Math.abs(val) / maxGrad, 1);
    if (val === 0) return '#E5DFD3';
    if (val > 0) return `rgba(139, 168, 136, ${0.3 + intensity * 0.7})`;
    return `rgba(199, 107, 74, ${0.3 + intensity * 0.7})`;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Backpropagation Chain Rule
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch gradients flow backward through a 3-layer network. Adjust inputs and weights to see how the chain rule multiplies local gradients.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Input (x)', value: inputVal, set: setInputVal, min: -2, max: 2, step: 0.1 },
          { label: 'Weight w1', value: w1, set: setW1, min: -2, max: 2, step: 0.1 },
          { label: 'Weight w2', value: w2, set: setW2, min: -2, max: 2, step: 0.1 },
          { label: 'Weight w3', value: w3, set: setW3, min: -2, max: 2, step: 0.1 },
        ].map(({ label, value, set, min, max, step }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#C76B4A', fontWeight: 600 }}>{value.toFixed(1)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      {/* Forward pass visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Forward Pass (left to right)
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          {network.forward.map((node, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                padding: '0.4rem 0.3rem', background: '#FDFBF7', borderRadius: '6px',
                border: '1px solid #E5DFD3', textAlign: 'center', flex: 1,
              }}>
                <div style={{ fontSize: '0.55rem', color: '#7A8B7C', marginBottom: '0.15rem' }}>{node.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', fontWeight: 600, color: node.value === 0 && i > 0 ? '#7A8B7C' : '#2C3E2D' }}>
                  {node.value.toFixed(2)}
                </div>
              </div>
              {i < network.forward.length - 1 && (
                <div style={{ color: '#8BA888', fontSize: '0.8rem', padding: '0 0.15rem' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backward pass visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          Backward Pass -- Gradients (right to left)
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', direction: 'rtl' }}>
          {network.gradients.map((grad, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, direction: 'ltr' }}>
              <div style={{
                padding: '0.4rem 0.3rem', background: gradColor(grad.value), borderRadius: '6px',
                border: `1px solid ${grad.value === 0 ? '#E5DFD3' : 'transparent'}`, textAlign: 'center', flex: 1,
                transition: 'background 0.3s ease',
              }}>
                <div style={{ fontSize: '0.55rem', color: grad.value === 0 ? '#7A8B7C' : '#2C3E2D', marginBottom: '0.15rem' }}>{grad.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', fontWeight: 600, color: grad.value === 0 ? '#7A8B7C' : '#2C3E2D' }}>
                  {grad.value.toFixed(3)}
                </div>
              </div>
              {i < network.gradients.length - 1 && (
                <div style={{ color: '#C76B4A', fontSize: '0.8rem', padding: '0 0.15rem' }}>←</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weight gradients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {network.weightGrads.map(wg => (
          <div key={wg.label} style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>{wg.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: wg.value === 0 ? '#7A8B7C' : '#C76B4A' }}>
              {wg.value.toFixed(3)}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#7A8B7C' }}>{wg.weight} = {wg.weight === 'w1' ? w1.toFixed(1) : wg.weight === 'w2' ? w2.toFixed(1) : w3.toFixed(1)}</div>
          </div>
        ))}
      </div>

      {/* Loss */}
      <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Loss (target = 1.0)</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 600, color: '#D4A843' }}>{network.loss.toFixed(4)}</div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {network.deadReLU
            ? 'A ReLU neuron is "dead" (output = 0), blocking gradient flow. This is the vanishing gradient problem -- gradients become zero and weights stop updating. Try adjusting weights to make all activations positive.'
            : Math.abs(network.gradients[5].value) < 0.01
            ? 'Gradients have nearly vanished by the time they reach the input. The chain rule multiplies many small values together, causing gradients to shrink exponentially with depth.'
            : 'Gradients flow successfully through all layers. Each gradient is the product of all local derivatives along the path -- this is the chain rule in action. Deeper networks multiply more terms.'}
        </div>
      </div>
    </div>
  );
}
