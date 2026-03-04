import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function SyntheticDataMixCalc() {
  const [totalTokensB, setTotalTokensB] = useState(500);
  const [syntheticPct, setSyntheticPct] = useState(30);
  const [generations, setGenerations] = useState(1);

  const analysis = useMemo(() => {
    const realTokens = totalTokensB * (1 - syntheticPct / 100);
    const syntheticTokens = totalTokensB * (syntheticPct / 100);

    // Quality degradation model: each generation of synthetic data
    // compounds quality loss. Based on research estimates.
    const perGenDegradation = 0.12; // ~12% quality loss per recursive generation
    const qualityRetained = Math.pow(1 - perGenDegradation, generations);
    const effectiveQuality = qualityRetained * 100;

    // Effective tokens: synthetic data counts for less as generations increase
    const syntheticEffectiveness = qualityRetained;
    const effectiveTokens = realTokens + syntheticTokens * syntheticEffectiveness;

    // Collapse risk based on synthetic % and generations
    const collapseScore = (syntheticPct / 100) * generations;
    const riskLevel = collapseScore < 0.3 ? 'Low' : collapseScore < 0.7 ? 'Medium' : collapseScore < 1.5 ? 'High' : 'Critical';
    const riskColor = collapseScore < 0.3 ? '#3D5240' : collapseScore < 0.7 ? '#D4A843' : collapseScore < 1.5 ? '#C76B4A' : '#9B3A3A';

    // Recommended max synthetic % per generation
    const safeMaxPct = Math.max(5, Math.round(60 / Math.pow(generations, 0.8)));

    // Diversity loss estimate
    const diversityRetained = Math.max(0, 100 - syntheticPct * 0.4 * generations);

    // Tail coverage estimate (how well rare examples are preserved)
    const tailCoverage = Math.max(0, 100 - syntheticPct * 0.6 * Math.pow(generations, 1.2));

    return {
      realTokens,
      syntheticTokens,
      effectiveQuality,
      effectiveTokens,
      collapseScore,
      riskLevel,
      riskColor,
      safeMaxPct,
      diversityRetained,
      tailCoverage,
    };
  }, [totalTokensB, syntheticPct, generations]);

  const barData = [
    { label: 'Quality', value: analysis.effectiveQuality, color: analysis.effectiveQuality > 70 ? '#8BA888' : analysis.effectiveQuality > 40 ? '#D4A843' : '#C76B4A' },
    { label: 'Diversity', value: analysis.diversityRetained, color: analysis.diversityRetained > 70 ? '#8BA888' : analysis.diversityRetained > 40 ? '#D4A843' : '#C76B4A' },
    { label: 'Tail Coverage', value: analysis.tailCoverage, color: analysis.tailCoverage > 70 ? '#8BA888' : analysis.tailCoverage > 40 ? '#D4A843' : '#C76B4A' },
  ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Synthetic Data Mix Calculator
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Calculate safe mixing ratios for synthetic training data and assess model collapse risk.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Total Tokens</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{totalTokensB}B</span>
          </div>
          <input type="range" min={50} max={5000} step={50} value={totalTokensB}
            onChange={e => setTotalTokensB(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Synthetic %</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{syntheticPct}%</span>
          </div>
          <input type="range" min={0} max={95} step={5} value={syntheticPct}
            onChange={e => setSyntheticPct(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #D4A843, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Recursion Depth</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{generations} gen</span>
          </div>
          <input type="range" min={1} max={8} step={1} value={generations}
            onChange={e => setGenerations(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Data mix visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem' }}>Data composition</div>
        <div style={{ display: 'flex', height: '28px', borderRadius: '6px', overflow: 'hidden', gap: '2px' }}>
          <div style={{
            width: `${100 - syntheticPct}%`,
            background: '#8BA888',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', color: '#FDFBF7', fontWeight: 600,
            transition: 'width 0.2s ease',
          }}>
            {100 - syntheticPct > 15 ? `Real ${100 - syntheticPct}%` : ''}
          </div>
          <div style={{
            width: `${syntheticPct}%`,
            background: syntheticPct > analysis.safeMaxPct ? '#C76B4A' : '#D4A843',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', color: '#FDFBF7', fontWeight: 600,
            transition: 'width 0.2s ease, background 0.2s ease',
          }}>
            {syntheticPct > 15 ? `Synthetic ${syntheticPct}%` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.65rem' }}>
          <span style={{ color: '#5A6B5C' }}>
            Real: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#3D5240' }}>{analysis.realTokens.toFixed(0)}B</span>
          </span>
          <span style={{ color: '#5A6B5C' }}>
            Synthetic: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: syntheticPct > analysis.safeMaxPct ? '#C76B4A' : '#D4A843' }}>{analysis.syntheticTokens.toFixed(0)}B</span>
          </span>
        </div>
      </div>

      {/* Quality bars */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.75rem' }}>Estimated quality metrics after {generations} generation{generations !== 1 ? 's' : ''}</div>
        {barData.map(bar => (
          <div key={bar.label} style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2C3E2D' }}>{bar.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: bar.color, fontWeight: 600 }}>{bar.value.toFixed(0)}%</span>
            </div>
            <div style={{ height: '8px', background: '#E5DFD3', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.max(bar.value, 1)}%`,
                height: '100%',
                background: bar.color,
                borderRadius: '4px',
                transition: 'width 0.2s ease, background 0.2s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Collapse Risk</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: analysis.riskColor }}>{analysis.riskLevel}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Effective Tokens</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: '#3D5240' }}>{analysis.effectiveTokens.toFixed(0)}B</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Safe Max %</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: syntheticPct > analysis.safeMaxPct ? '#C76B4A' : '#3D5240' }}>{analysis.safeMaxPct}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: '#7A8B7C', textTransform: 'uppercase' as const, fontWeight: 600 }}>Risk Score</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 600, color: analysis.riskColor }}>{analysis.collapseScore.toFixed(2)}</div>
        </div>
      </div>

      {/* Warning if over threshold */}
      {syntheticPct > analysis.safeMaxPct && (
        <div style={{ padding: '0.6rem 1rem', background: '#C76B4A12', border: '1px solid #C76B4A30', borderRadius: '8px', fontSize: '0.75rem', color: '#C76B4A', marginBottom: '1rem' }}>
          <strong>Warning:</strong> Synthetic data ratio ({syntheticPct}%) exceeds the recommended maximum ({analysis.safeMaxPct}%) for {generations} generation{generations !== 1 ? 's' : ''} of recursion. Consider adding more real data or reducing recursive depth.
        </div>
      )}

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.75rem', color: '#5A6B5C' }}>
        <strong>Insight:</strong> {analysis.collapseScore < 0.3
          ? 'This mix is within safe bounds. The proportion of synthetic data is low enough that quality degradation is minimal even across generations.'
          : analysis.collapseScore < 0.7
          ? 'Moderate risk zone. The quality impact is noticeable but manageable. Consider filtering synthetic data for quality before mixing.'
          : analysis.collapseScore < 1.5
          ? 'High collapse risk. At this ratio, each recursive generation compounds errors significantly. Tail distributions will be severely underrepresented.'
          : 'Critical collapse territory. The model will rapidly lose diversity and quality. Real data should dominate the training mix at this recursion depth.'}
      </div>
    </div>
  );
}
