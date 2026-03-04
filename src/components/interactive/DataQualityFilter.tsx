import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

interface TextSample {
  id: number;
  text: string;
  perplexity: number;
  duplicateScore: number;
  toxicity: number;
  domain: string;
}

const SAMPLES: TextSample[] = [
  { id: 1, text: 'The transformer architecture uses self-attention mechanisms to process sequential data in parallel.', perplexity: 28, duplicateScore: 0.05, toxicity: 0.02, domain: 'Academic' },
  { id: 2, text: 'Click here to buy cheap products!!! Best deals online NOW!!!', perplexity: 185, duplicateScore: 0.82, toxicity: 0.15, domain: 'Spam' },
  { id: 3, text: 'Machine learning models can be broadly categorized into supervised, unsupervised, and reinforcement learning.', perplexity: 32, duplicateScore: 0.45, toxicity: 0.01, domain: 'Academic' },
  { id: 4, text: 'asdfjkl; random keyboard mashing text that makes no sense whatsoever qwerty uiop', perplexity: 520, duplicateScore: 0.03, toxicity: 0.08, domain: 'Noise' },
  { id: 5, text: 'The president announced new economic policies aimed at reducing inflation and increasing employment rates.', perplexity: 45, duplicateScore: 0.12, toxicity: 0.05, domain: 'News' },
  { id: 6, text: 'In this tutorial, we will learn how to implement a neural network from scratch using Python and NumPy.', perplexity: 38, duplicateScore: 0.62, toxicity: 0.01, domain: 'Code' },
  { id: 7, text: 'Copyright 2023 All Rights Reserved. Terms of Service. Privacy Policy. Cookie Settings.', perplexity: 95, duplicateScore: 0.95, toxicity: 0.03, domain: 'Boilerplate' },
  { id: 8, text: 'Recent advances in protein folding prediction have revolutionized computational biology and drug discovery.', perplexity: 42, duplicateScore: 0.08, toxicity: 0.01, domain: 'Science' },
  { id: 9, text: 'This content contains extremely offensive and harmful language targeting specific groups.', perplexity: 55, duplicateScore: 0.10, toxicity: 0.92, domain: 'Toxic' },
  { id: 10, text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt.', perplexity: 310, duplicateScore: 0.88, toxicity: 0.01, domain: 'Placeholder' },
  { id: 11, text: 'Gradient descent iteratively updates model parameters by computing partial derivatives of the loss function.', perplexity: 35, duplicateScore: 0.15, toxicity: 0.01, domain: 'Academic' },
  { id: 12, text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.', perplexity: 68, duplicateScore: 0.92, toxicity: 0.02, domain: 'Pangram' },
];

export default function DataQualityFilter() {
  const [perplexityThreshold, setPerplexityThreshold] = useState(100);
  const [dedupThreshold, setDedupThreshold] = useState(0.50);
  const [toxicityThreshold, setToxicityThreshold] = useState(0.20);

  const filtered = useMemo(() => {
    const afterPerplexity = SAMPLES.filter(s => s.perplexity <= perplexityThreshold);
    const afterDedup = afterPerplexity.filter(s => s.duplicateScore <= dedupThreshold);
    const afterToxicity = afterDedup.filter(s => s.toxicity <= toxicityThreshold);

    return {
      total: SAMPLES.length,
      afterPerplexity: afterPerplexity.length,
      afterDedup: afterDedup.length,
      afterToxicity: afterToxicity.length,
      surviving: afterToxicity,
      perplexityRemoved: SAMPLES.length - afterPerplexity.length,
      dedupRemoved: afterPerplexity.length - afterDedup.length,
      toxicityRemoved: afterDedup.length - afterToxicity.length,
    };
  }, [perplexityThreshold, dedupThreshold, toxicityThreshold]);

  const survivalRate = ((filtered.afterToxicity / SAMPLES.length) * 100).toFixed(0);

  const stages = [
    { label: 'Raw corpus', count: filtered.total, removed: 0, color: '#7A8B7C' },
    { label: 'Perplexity filter', count: filtered.afterPerplexity, removed: filtered.perplexityRemoved, color: '#C76B4A' },
    { label: 'Deduplication', count: filtered.afterDedup, removed: filtered.dedupRemoved, color: '#D4A843' },
    { label: 'Toxicity filter', count: filtered.afterToxicity, removed: filtered.toxicityRemoved, color: '#8BA888' },
  ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Data Quality Filter Pipeline
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Simulate a data curation pipeline. Adjust thresholds to see how filtering affects the training corpus.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Perplexity Max</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{perplexityThreshold}</span>
          </div>
          <input type="range" min={20} max={600} step={5} value={perplexityThreshold}
            onChange={e => setPerplexityThreshold(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Dedup Threshold</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{(dedupThreshold * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.05} max={1.0} step={0.05} value={dedupThreshold}
            onChange={e => setDedupThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Toxicity Max</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{(toxicityThreshold * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min={0.01} max={1.0} step={0.01} value={toxicityThreshold}
            onChange={e => setToxicityThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Funnel visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>FILTER PIPELINE</div>
        {stages.map((stage, i) => (
          <div key={stage.label} style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#2C3E2D', fontWeight: 500 }}>{stage.label}</span>
              <div style={{ height: '22px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(stage.count / filtered.total) * 100}%`,
                  background: stage.color,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {(stage.count / filtered.total) > 0.15 && (
                    <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 600 }}>{stage.count} docs</span>
                  )}
                </div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: stage.removed > 0 ? '#C76B4A' : '#7A8B7C', textAlign: 'right' }}>
                {i > 0 ? `-${stage.removed}` : `${stage.count}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sample documents */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>DOCUMENT SAMPLES</div>
        {SAMPLES.map(sample => {
          const passesPerp = sample.perplexity <= perplexityThreshold;
          const passesDedup = sample.duplicateScore <= dedupThreshold;
          const passesTox = sample.toxicity <= toxicityThreshold;
          const passes = passesPerp && passesDedup && passesTox;
          const failReason = !passesPerp ? 'perplexity' : !passesDedup ? 'duplicate' : !passesTox ? 'toxicity' : null;

          return (
            <div key={sample.id} style={{
              padding: '0.4rem 0.5rem', marginBottom: '0.3rem',
              borderRadius: '4px', background: passes ? '#FDFBF7' : '#FDFBF7',
              border: `1px solid ${passes ? '#8BA888' : '#E5DFD3'}`,
              opacity: passes ? 1 : 0.45,
              transition: 'all 0.2s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#2C3E2D', flex: 1, lineHeight: 1.4 }}>{sample.text}</span>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', padding: '0.1rem 0.25rem', borderRadius: '3px', background: passes ? '#8BA88820' : '#C76B4A20', color: passes ? '#8BA888' : '#C76B4A' }}>
                    {passes ? 'PASS' : failReason}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', padding: '0.1rem 0.25rem', borderRadius: '3px', background: '#E5DFD3', color: '#7A8B7C' }}>
                    {sample.domain}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: passesPerp ? '#7A8B7C' : '#C76B4A' }}>ppl:{sample.perplexity}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: passesDedup ? '#7A8B7C' : '#C76B4A' }}>dup:{(sample.duplicateScore * 100).toFixed(0)}%</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.5rem', color: passesTox ? '#7A8B7C' : '#C76B4A' }}>tox:{(sample.toxicity * 100).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Survival Rate</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#3D5240' }}>{survivalRate}%</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Docs Remaining</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{filtered.afterToxicity}/{SAMPLES.length}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total Removed</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{SAMPLES.length - filtered.afterToxicity}</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        <strong>Real-world impact:</strong> Common Crawl starts with ~250B pages but after deduplication, language filtering, and quality scoring, typical datasets retain only 1-5% of documents. Aggressive filtering improves model quality but reduces data diversity.
      </div>
    </div>
  );
}
