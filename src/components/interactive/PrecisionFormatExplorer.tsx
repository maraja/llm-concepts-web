import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

interface FormatInfo {
  name: string;
  totalBits: number;
  signBits: number;
  exponentBits: number;
  mantissaBits: number;
  maxVal: number;
  minPositive: number;
  color: string;
}

const FORMATS: FormatInfo[] = [
  { name: 'FP32', totalBits: 32, signBits: 1, exponentBits: 8, mantissaBits: 23, maxVal: 3.4028235e+38, minPositive: 1.175494e-38, color: '#C76B4A' },
  { name: 'FP16', totalBits: 16, signBits: 1, exponentBits: 5, mantissaBits: 10, maxVal: 65504, minPositive: 6.1035e-5, color: '#D4A843' },
  { name: 'BF16', totalBits: 16, signBits: 1, exponentBits: 8, mantissaBits: 7, maxVal: 3.39e+38, minPositive: 1.175494e-38, color: '#8BA888' },
];

function representValue(value: number, fmt: FormatInfo): { stored: number; error: number; overflow: boolean; underflow: boolean } {
  if (value === 0) return { stored: 0, error: 0, overflow: false, underflow: false };
  const absVal = Math.abs(value);
  const overflow = absVal > fmt.maxVal;
  const underflow = absVal > 0 && absVal < fmt.minPositive;
  // Simulate precision loss based on mantissa bits
  const mantissaSteps = Math.pow(2, fmt.mantissaBits);
  const exponent = Math.floor(Math.log2(absVal));
  const quantum = Math.pow(2, exponent) / mantissaSteps;
  const stored = Math.round(value / quantum) * quantum;
  const error = Math.abs(value - stored);
  return { stored, error, overflow, underflow };
}

export default function PrecisionFormatExplorer() {
  const [inputValue, setInputValue] = useState(3.14159);
  const [logScale, setLogScale] = useState(0);

  const actualValue = useMemo(() => {
    if (logScale === 0) return inputValue;
    return inputValue * Math.pow(10, logScale);
  }, [inputValue, logScale]);

  const representations = useMemo(() => {
    return FORMATS.map(fmt => ({
      format: fmt,
      ...representValue(actualValue, fmt),
    }));
  }, [actualValue]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Precision Format Explorer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare how FP32, FP16, and BF16 represent the same number. See the bit layout, precision loss, and overflow risks.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Base Value</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>{inputValue.toFixed(5)}</span>
          </div>
          <input type="range" min={0.001} max={9.999} step={0.001} value={inputValue}
            onChange={e => setInputValue(parseFloat(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2C3E2D' }}>Scale (10^x)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#C76B4A', fontWeight: 600 }}>10^{logScale}</span>
          </div>
          <input type="range" min={-6} max={6} step={1} value={logScale}
            onChange={e => setLogScale(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: '#7A8B7C', marginRight: '0.5rem' }}>Target value:</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#2C3E2D' }}>
          {actualValue.toExponential(6)}
        </span>
      </div>

      {/* Bit layout comparison */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>BIT LAYOUT</div>
        {FORMATS.map(fmt => {
          const signWidth = (fmt.signBits / fmt.totalBits) * 100;
          const expWidth = (fmt.exponentBits / fmt.totalBits) * 100;
          const mantWidth = (fmt.mantissaBits / fmt.totalBits) * 100;
          return (
            <div key={fmt.name} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: fmt.color, width: '36px' }}>{fmt.name}</span>
                <span style={{ fontSize: '0.65rem', color: '#7A8B7C' }}>{fmt.totalBits} bits</span>
              </div>
              <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #E5DFD3' }}>
                <div style={{ width: `${signWidth}%`, background: '#7A8B7C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 600 }}>S</span>
                </div>
                <div style={{ width: `${expWidth}%`, background: fmt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
                  <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 600 }}>Exp ({fmt.exponentBits})</span>
                </div>
                <div style={{ width: `${mantWidth}%`, background: fmt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.45 }}>
                  <span style={{ fontSize: '0.55rem', color: '#2C3E2D', fontWeight: 600 }}>Mantissa ({fmt.mantissaBits})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Representation results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {representations.map(rep => (
          <div key={rep.format.name} style={{ padding: '0.75rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>{rep.format.name}</div>
            {rep.overflow ? (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>OVERFLOW</div>
            ) : rep.underflow ? (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#D4A843' }}>UNDERFLOW</div>
            ) : (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: rep.format.color }}>
                {rep.stored.toPrecision(Math.min(rep.format.mantissaBits > 10 ? 7 : rep.format.mantissaBits > 7 ? 4 : 3, 7))}
              </div>
            )}
            <div style={{ fontSize: '0.58rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
              {rep.overflow || rep.underflow ? `max: ${rep.format.maxVal.toExponential(1)}` : `err: ${rep.error.toExponential(1)}`}
            </div>
          </div>
        ))}
      </div>

      {/* Precision comparison bars */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>PRECISION (MANTISSA BITS)</div>
        {FORMATS.map(fmt => (
          <div key={fmt.name} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 40px', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 600, color: fmt.color }}>{fmt.name}</span>
            <div style={{ height: '14px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(fmt.mantissaBits / 23) * 100}%`, background: fmt.color, borderRadius: '3px', transition: 'width 0.2s ease' }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#7A8B7C', textAlign: 'right' }}>{fmt.mantissaBits}b</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        <strong>Key insight:</strong> BF16 has the same exponent range as FP32 (avoiding overflow) but only 7 mantissa bits vs FP16's 10. FP16 has more precision but overflows above 65,504 -- a common issue with gradient values during training.
      </div>
    </div>
  );
}
