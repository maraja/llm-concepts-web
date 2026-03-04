import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: 700 as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em',
  color: '#6E8B6B',
};

interface PromptBlock {
  id: string;
  name: string;
  color: string;
  content: string;
  enabled: boolean;
  effectiveness: number;
}

const initialBlocks: PromptBlock[] = [
  { id: 'system', name: 'System Message', color: '#C76B4A', content: 'You are an expert data analyst who provides precise, well-structured answers.', enabled: true, effectiveness: 15 },
  { id: 'context', name: 'Context', color: '#D4A843', content: 'You have access to Q3 2024 sales data for a SaaS company with 500 enterprise customers.', enabled: false, effectiveness: 20 },
  { id: 'examples', name: 'Few-Shot Examples', color: '#8BA888', content: 'Q: What was revenue in Q2?\nA: Q2 revenue was $4.2M, a 12% increase from Q1.\n\nQ: Which region grew fastest?\nA: APAC grew 34% QoQ, driven by 15 new enterprise deals.', enabled: false, effectiveness: 20 },
  { id: 'instruction', name: 'Instruction', color: '#5B8DB8', content: 'Analyze the top 3 churn risk factors and suggest retention strategies.', enabled: true, effectiveness: 25 },
  { id: 'format', name: 'Output Format', color: '#9B7EC8', content: 'Respond in this format:\n## Risk Factor\n- **Factor**: description\n- **Impact**: high/medium/low\n- **Strategy**: recommended action', enabled: false, effectiveness: 15 },
  { id: 'constraints', name: 'Constraints', color: '#C4876E', content: 'Keep response under 300 words. Use data-driven language. Avoid speculation.', enabled: false, effectiveness: 5 },
];

export default function PromptTemplateBuilder() {
  const [blocks, setBlocks] = useState<PromptBlock[]>(initialBlocks);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const toggleBlock = (id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  };

  const moveBlock = (from: number, to: number) => {
    if (from === to) return;
    const updated = [...blocks];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setBlocks(updated);
  };

  const enabledBlocks = blocks.filter(b => b.enabled);
  const effectiveness = Math.min(100, enabledBlocks.reduce((s, b) => s + b.effectiveness, 0));
  const assembledPrompt = enabledBlocks.map(b => `[${b.name.toUpperCase()}]\n${b.content}`).join('\n\n');

  const effColor = effectiveness >= 80 ? '#8BA888' : effectiveness >= 50 ? '#D4A843' : '#C76B4A';

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Prompt Template Builder
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Toggle and reorder prompt components to build an effective prompt template.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Prompt Components (click to toggle, drag to reorder)</div>
          {blocks.map((block, i) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
              onDragEnd={() => { if (dragIdx !== null && overIdx !== null) moveBlock(dragIdx, overIdx); setDragIdx(null); setOverIdx(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                marginBottom: '0.4rem', borderRadius: '8px', cursor: 'grab',
                border: `1px solid ${overIdx === i ? '#C76B4A' : block.enabled ? block.color + '44' : '#E5DFD3'}`,
                background: block.enabled ? block.color + '0D' : '#F5F0E8',
                opacity: block.enabled ? 1 : 0.55, transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#B0A898', cursor: 'grab' }}>⠿</span>
              <div onClick={() => toggleBlock(block.id)} style={{ cursor: 'pointer', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: block.color, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>{block.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#7A8B7C', marginLeft: 'auto' }}>+{block.effectiveness}%</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginTop: '0.2rem', lineHeight: 1.4, maxHeight: '2.8em', overflow: 'hidden' }}>
                  {block.content.substring(0, 80)}{block.content.length > 80 ? '...' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={labelStyle}>Assembled Prompt</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: effColor }}>
              Effectiveness: {effectiveness}%
            </span>
          </div>
          <div style={{ height: '6px', background: '#F0EBE1', borderRadius: '3px', marginBottom: '0.75rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${effectiveness}%`, background: effColor, borderRadius: '3px', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '1rem', minHeight: '280px' }}>
            {enabledBlocks.length === 0 ? (
              <span style={{ fontSize: '0.82rem', color: '#7A8B7C', fontStyle: 'italic' }}>Enable components on the left to build your prompt.</span>
            ) : (
              <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>{assembledPrompt}</pre>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C' }}>
            {enabledBlocks.length} of {blocks.length} components active
            {enabledBlocks.length < 3 && ' — Add more components for a robust prompt.'}
            {enabledBlocks.length >= 5 && ' — Comprehensive prompt template!'}
          </div>
        </div>
      </div>
    </div>
  );
}
