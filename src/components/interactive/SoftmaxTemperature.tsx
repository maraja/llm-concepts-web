import { useState, useMemo } from 'react';

/** Simulated "logits" for a next-token prediction after "The cat sat on the" */
const TOKENS = [
  { token: 'mat',     logit: 4.2  },
  { token: 'floor',   logit: 3.1  },
  { token: 'couch',   logit: 2.5  },
  { token: 'roof',    logit: 1.0  },
  { token: 'table',   logit: 0.8  },
  { token: 'moon',    logit: -0.5 },
  { token: 'quantum', logit: -2.1 },
  { token: 'zebra',   logit: -3.0 },
];

function softmax(logits: number[], temperature: number): number[] {
  const t = Math.max(temperature, 0.01);
  const scaled = logits.map(z => z / t);
  const maxVal = Math.max(...scaled);
  const exps = scaled.map(z => Math.exp(z - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function getTemperatureLabel(t: number): { text: string; color: string } {
  if (t <= 0.3) return { text: 'Deterministic', color: '#3D5240' };
  if (t <= 0.8) return { text: 'Focused', color: '#5A6B5C' };
  if (t <= 1.2) return { text: 'Balanced', color: '#8BA888' };
  if (t <= 1.8) return { text: 'Creative', color: '#D4A843' };
  return { text: 'Wild', color: '#C76B4A' };
}

function getTemperatureUseCase(t: number): string {
  if (t <= 0.3) return 'Best for: code generation, factual Q&A, structured output';
  if (t <= 0.8) return 'Best for: summarization, translation, reliable text';
  if (t <= 1.2) return 'Best for: general conversation, default behavior';
  if (t <= 1.8) return 'Best for: creative writing, brainstorming, poetry';
  return 'Best for: maximum diversity (often incoherent)';
}

export default function SoftmaxTemperature() {
  const [temperature, setTemperature] = useState(1.0);

  const logits = TOKENS.map(t => t.logit);
  const probs = useMemo(() => softmax(logits, temperature), [temperature]);
  const maxProb = Math.max(...probs);
  const label = getTemperatureLabel(temperature);
  const useCase = getTemperatureUseCase(temperature);

  // Entropy as a measure of randomness (0 = deterministic, higher = more random)
  const entropy = useMemo(() => {
    return -probs.reduce((sum, p) => {
      if (p > 1e-10) return sum + p * Math.log2(p);
      return sum;
    }, 0);
  }, [probs]);
  const maxEntropy = Math.log2(TOKENS.length);

  return (
    <div style={{
      fontFamily: "'Source Sans 3', system-ui, sans-serif",
      background: '#FDFBF7',
      border: '1px solid #E5DFD3',
      borderRadius: '14px',
      padding: '2rem',
      margin: '2.5rem 0',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background: 'rgba(139, 168, 136, 0.15)',
            fontSize: '12px',
          }}>
            ▶
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: '#6E8B6B',
          }}>
            Interactive
          </span>
        </div>
        <h3 style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: '1.3rem',
          fontWeight: 600,
          color: '#2C3E2D',
          margin: 0,
          lineHeight: 1.3,
        }}>
          Temperature Explorer
        </h3>
        <p style={{
          fontSize: '0.88rem',
          color: '#5A6B5C',
          margin: '0.4rem 0 0 0',
          lineHeight: 1.6,
        }}>
          Drag the slider to see how temperature reshapes the probability
          distribution over candidate next tokens.
        </p>
      </div>

      {/* Context sentence */}
      <div style={{
        background: '#F0EBE1',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        color: '#5A6B5C',
      }}>
        <span style={{ color: '#7A8B7C', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
          Context:
        </span>{' '}
        <span style={{ color: '#2C3E2D' }}>
          "The cat sat on the <span style={{
            color: '#C76B4A',
            fontWeight: 600,
            borderBottom: '2px dashed #D4896D',
          }}>___</span>"
        </span>
      </div>

      {/* Temperature control */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}>
          <label style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#2C3E2D',
          }}>
            Temperature
          </label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1.4rem',
              fontWeight: 600,
              color: '#2C3E2D',
              letterSpacing: '-0.02em',
            }}>
              {temperature.toFixed(2)}
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: label.color,
              padding: '0.15rem 0.5rem',
              background: `${label.color}14`,
              borderRadius: '4px',
            }}>
              {label.text}
            </span>
          </div>
        </div>

        {/* Slider */}
        <div style={{ position: 'relative' as const }}>
          <input
            type="range"
            min="0.05"
            max="3.0"
            step="0.05"
            value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              appearance: 'none' as const,
              WebkitAppearance: 'none' as const,
              background: `linear-gradient(to right, #3D5240, #5A6B5C 25%, #8BA888 40%, #D4A843 65%, #C76B4A)`,
              borderRadius: '3px',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          {/* Scale labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.35rem',
            fontSize: '0.68rem',
            color: '#7A8B7C',
          }}>
            <span>0.05</span>
            <span>1.0</span>
            <span>2.0</span>
            <span>3.0</span>
          </div>
        </div>

        <p style={{
          fontSize: '0.78rem',
          color: '#7A8B7C',
          marginTop: '0.6rem',
          fontStyle: 'italic' as const,
        }}>
          {useCase}
        </p>
      </div>

      {/* Probability bars */}
      <div style={{ marginBottom: '1.25rem' }}>
        {TOKENS.map((tok, i) => {
          const prob = probs[i];
          const pct = prob * 100;
          const isTop = prob === maxProb;

          return (
            <div
              key={tok.token}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 54px',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0',
              }}
            >
              {/* Token name */}
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.82rem',
                fontWeight: isTop ? 600 : 400,
                color: isTop ? '#2C3E2D' : '#5A6B5C',
                textAlign: 'right' as const,
              }}>
                {tok.token}
              </span>

              {/* Bar */}
              <div style={{
                height: '22px',
                background: '#F0EBE1',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative' as const,
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(pct, 0.3)}%`,
                  background: isTop
                    ? 'linear-gradient(90deg, #C76B4A, #D4896D)'
                    : 'linear-gradient(90deg, #8BA888, #A8C4A5)',
                  borderRadius: '4px',
                  transition: 'width 0.15s ease-out',
                }} />
              </div>

              {/* Percentage */}
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
                fontWeight: isTop ? 600 : 400,
                color: isTop ? '#C76B4A' : '#7A8B7C',
                textAlign: 'right' as const,
              }}>
                {pct < 0.1 ? '<0.1' : pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Entropy indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: '#F0EBE1',
        borderRadius: '8px',
        fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#5A6B5C', fontWeight: 500 }}>Randomness</span>
          <div style={{
            width: '100px',
            height: '4px',
            background: '#E5DFD3',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(entropy / maxEntropy) * 100}%`,
              height: '100%',
              background: entropy / maxEntropy > 0.7 ? '#C76B4A' : '#8BA888',
              borderRadius: '2px',
              transition: 'width 0.15s ease-out, background 0.3s ease',
            }} />
          </div>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.72rem',
            color: '#7A8B7C',
          }}>
            {(entropy / maxEntropy * 100).toFixed(0)}%
          </span>
        </div>

        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem',
          color: '#7A8B7C',
        }}>
          H = {entropy.toFixed(2)} bits
        </span>
      </div>
    </div>
  );
}
