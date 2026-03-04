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

interface ToolNode {
  id: string;
  name: string;
  input: string;
  output: string;
  color: string;
  dependsOn: string[];
}

const nodes: ToolNode[] = [
  { id: 'search', name: 'Web Search', input: '"Best restaurants in San Francisco with outdoor seating"', output: '["Nopa", "Foreign Cinema", "Zazie", "Tartine Manufactory", "The Snug"]', color: '#5B8DB8', dependsOn: [] },
  { id: 'reviews', name: 'Get Reviews', input: 'Fetch reviews for: Nopa, Foreign Cinema, Zazie', output: 'Nopa: 4.5/5 (1.2k reviews)\nForeign Cinema: 4.3/5 (980 reviews)\nZazie: 4.7/5 (650 reviews)', color: '#D4A843', dependsOn: ['search'] },
  { id: 'weather', name: 'Check Weather', input: '"San Francisco weather this weekend"', output: 'Saturday: 68F, Sunny\nSunday: 62F, Partly Cloudy', color: '#8BA888', dependsOn: [] },
  { id: 'maps', name: 'Get Directions', input: 'Directions to Zazie from downtown SF', output: 'Distance: 3.2 miles\nDrive: 15 min\nTransit: 25 min (N-Judah)', color: '#9B7EC8', dependsOn: ['reviews'] },
  { id: 'reserve', name: 'Check Availability', input: 'Zazie, Saturday, 7pm, party of 2', output: 'Available slots: 6:30pm, 7:15pm, 8:00pm\nOutdoor seating available for 7:15pm', color: '#C76B4A', dependsOn: ['reviews', 'weather'] },
  { id: 'respond', name: 'Compose Response', input: 'Synthesize all gathered information', output: 'I recommend Zazie (4.7/5) for Saturday. Weather will be great (68F, sunny) for outdoor dining. They have a 7:15pm slot with outdoor seating. It is 15 min drive from downtown.', color: '#2C3E2D', dependsOn: ['maps', 'reserve'] },
];

export default function AgentToolChain() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());

  const selected = nodes.find(n => n.id === selectedNode);

  const canExecute = (node: ToolNode) =>
    node.dependsOn.every(dep => completedNodes.has(dep));

  const handleNodeClick = (node: ToolNode) => {
    setSelectedNode(node.id);
    if (canExecute(node)) {
      setCompletedNodes(prev => new Set([...prev, node.id]));
    }
  };

  const resetAll = () => {
    setSelectedNode(null);
    setCompletedNodes(new Set());
  };

  const cols = [
    { label: 'Independent', ids: ['search', 'weather'] },
    { label: 'Depends on Search', ids: ['reviews'] },
    { label: 'Depends on Reviews', ids: ['maps', 'reserve'] },
    { label: 'Final', ids: ['respond'] },
  ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Agent Tool Chain
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Click nodes to execute tools in dependency order. The agent composes multiple calls to answer: "Find me a good outdoor restaurant in SF this weekend."
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {cols.map((col, ci) => (
          <div key={ci}>
            <div style={{ ...labelStyle, marginBottom: '0.4rem', textAlign: 'center', fontSize: '8px' }}>{col.label}</div>
            {col.ids.map(id => {
              const node = nodes.find(n => n.id === id)!;
              const done = completedNodes.has(id);
              const ready = canExecute(node);
              const isSelected = selectedNode === id;
              return (
                <div key={id} onClick={() => handleNodeClick(node)} style={{
                  padding: '0.5rem 0.6rem', marginBottom: '0.4rem', borderRadius: '8px',
                  cursor: ready ? 'pointer' : 'not-allowed',
                  border: `2px solid ${isSelected ? node.color : done ? node.color + '66' : ready ? node.color + '33' : '#E5DFD3'}`,
                  background: done ? node.color + '12' : isSelected ? node.color + '08' : '#F5F0E8',
                  opacity: ready || done ? 1 : 0.4, transition: 'all 0.2s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.8rem' }}>{done ? '✓' : ready ? '○' : '◌'}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: node.color }}>{node.name}</span>
                  </div>
                  {node.dependsOn.length > 0 && (
                    <div style={{ fontSize: '0.65rem', color: '#B0A898' }}>
                      Needs: {node.dependsOn.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...labelStyle, color: '#8BA888', marginBottom: '0.3rem' }}>Input</div>
              <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{selected.input}</pre>
            </div>
            <div style={{ width: '1px', background: '#4A5B4C' }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...labelStyle, color: '#D4A843', marginBottom: '0.3rem' }}>Output</div>
              <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: completedNodes.has(selected.id) ? '#E8E4DC' : '#5A6B5C', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{completedNodes.has(selected.id) ? selected.output : '(Execute this node to see output)'}</pre>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={resetAll} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
          border: '1px solid #E5DFD3', background: 'transparent', color: '#5A6B5C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Reset</button>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#7A8B7C' }}>
          {completedNodes.size} / {nodes.length} tools executed
        </span>
        {completedNodes.size === nodes.length && (
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600, color: '#8BA888' }}>Chain Complete</span>
        )}
      </div>
    </div>
  );
}
