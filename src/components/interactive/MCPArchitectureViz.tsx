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

const components = [
  {
    id: 'host',
    name: 'Host Application',
    subtitle: 'IDE / Chat Interface',
    icon: '🖥️',
    color: '#5B8DB8',
    x: 0,
    desc: 'The host application (e.g., VS Code, Claude Desktop) that the user interacts with. It manages one or more MCP clients.',
    messages: [
      { dir: 'out', to: 'client', msg: 'User request: "Search for files matching *.tsx"' },
    ],
  },
  {
    id: 'client',
    name: 'MCP Client',
    subtitle: 'Protocol Handler',
    icon: '🔌',
    color: '#D4A843',
    x: 1,
    desc: 'The MCP client maintains a 1:1 connection with an MCP server. It translates between the host application and the MCP protocol.',
    messages: [
      { dir: 'out', to: 'server', msg: '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"file_search","arguments":{"pattern":"*.tsx"}}}' },
      { dir: 'in', from: 'server', msg: '{"jsonrpc":"2.0","result":{"content":[{"type":"text","text":"Found 24 files..."}]}}' },
    ],
  },
  {
    id: 'server',
    name: 'MCP Server',
    subtitle: 'Capability Provider',
    icon: '⚙️',
    color: '#8BA888',
    x: 2,
    desc: 'The MCP server exposes tools, resources, and prompts via the standardized protocol. Each server is a lightweight process.',
    messages: [
      { dir: 'out', to: 'tools', msg: 'Execute: file_search(pattern="*.tsx")' },
      { dir: 'in', from: 'tools', msg: 'Result: [list of 24 matching files]' },
    ],
  },
  {
    id: 'tools',
    name: 'Tools & Resources',
    subtitle: 'File System / APIs / DBs',
    icon: '🗂️',
    color: '#C76B4A',
    x: 3,
    desc: 'The actual capabilities: file system access, API integrations, database connections, and other resources that the server wraps.',
    messages: [
      { dir: 'none', msg: 'Executes filesystem glob, returns matching paths' },
    ],
  },
];

export default function MCPArchitectureViz() {
  const [selected, setSelected] = useState('host');
  const [flowStep, setFlowStep] = useState(0);

  const comp = components.find(c => c.id === selected)!;

  const flowSteps = [
    { from: 'host', to: 'client', label: 'User sends request to host', msg: 'User: "Search for *.tsx files"' },
    { from: 'client', to: 'server', label: 'Client sends JSON-RPC to server', msg: '{"method":"tools/call","params":{"name":"file_search",...}}' },
    { from: 'server', to: 'tools', label: 'Server executes tool', msg: 'file_search(pattern="*.tsx")' },
    { from: 'tools', to: 'server', label: 'Tool returns result', msg: 'Found: 24 files matching *.tsx' },
    { from: 'server', to: 'client', label: 'Server returns JSON-RPC response', msg: '{"result":{"content":[{"type":"text","text":"..."}]}}' },
    { from: 'client', to: 'host', label: 'Client delivers result to host', msg: 'Display: "Found 24 .tsx files"' },
  ];

  const currentFlow = flowSteps[flowStep];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          MCP Architecture Visualization
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Explore the Model Context Protocol architecture. Click components to see details, or step through a message flow.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {components.map((c, i) => {
          const isActive = flowStep < flowSteps.length && (currentFlow.from === c.id || currentFlow.to === c.id);
          const isSelected = selected === c.id;
          return (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <button onClick={() => setSelected(c.id)} style={{
                padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', width: '100%', textAlign: 'center',
                border: `2px solid ${isSelected ? c.color : isActive ? c.color + '88' : '#E5DFD3'}`,
                background: isSelected ? c.color + '12' : isActive ? c.color + '08' : '#F5F0E8',
                transition: 'all 0.2s ease',
                fontFamily: "'Source Sans 3', system-ui, sans-serif",
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{c.icon}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: c.color }}>{c.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#7A8B7C' }}>{c.subtitle}</div>
              </button>
              {i < components.length - 1 && (
                <div style={{ width: '100%', textAlign: 'right', fontSize: '0.9rem', color: isActive ? c.color : '#E5DFD3', transition: 'color 0.2s' }}>→</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ background: comp.color + '08', border: `1px solid ${comp.color}33`, borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: comp.color, marginBottom: '0.3rem' }}>{comp.name}</div>
        <p style={{ fontSize: '0.8rem', color: '#5A6B5C', margin: 0, lineHeight: 1.6 }}>{comp.desc}</p>
      </div>

      <div style={{ ...labelStyle, marginBottom: '0.4rem' }}>Message Flow</div>
      <div style={{ marginBottom: '1rem' }}>
        {flowSteps.map((fs, i) => {
          const isCurrent = i === flowStep;
          const isDone = i < flowStep;
          const fromComp = components.find(c => c.id === fs.from)!;
          const toComp = components.find(c => c.id === fs.to)!;
          return (
            <div key={i} onClick={() => setFlowStep(i)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem',
              marginBottom: '0.2rem', borderRadius: '6px', cursor: 'pointer',
              background: isCurrent ? fromComp.color + '0A' : 'transparent',
              border: `1px solid ${isCurrent ? fromComp.color + '33' : 'transparent'}`,
              opacity: isDone ? 0.5 : isCurrent ? 1 : 0.35, transition: 'all 0.2s ease',
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: fromComp.color, minWidth: '50px' }}>{fromComp.name.split(' ')[0]}</span>
              <span style={{ color: '#B0A898', fontSize: '0.7rem' }}>→</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: toComp.color, minWidth: '50px' }}>{toComp.name.split(' ')[0]}</span>
              <span style={{ fontSize: '0.75rem', color: '#5A6B5C', flex: 1 }}>{fs.label}</span>
            </div>
          );
        })}
      </div>

      {flowStep < flowSteps.length && (
        <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem' }}>
          <div style={{ ...labelStyle, color: '#8BA888', marginBottom: '0.3rem' }}>Current Message</div>
          <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{currentFlow.msg}</pre>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => setFlowStep(Math.max(0, flowStep - 1))} disabled={flowStep === 0} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: flowStep === 0 ? 'not-allowed' : 'pointer',
          border: '1px solid #E5DFD3', background: 'transparent',
          color: flowStep === 0 ? '#B0A898' : '#5A6B5C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Back</button>
        <button onClick={() => setFlowStep(Math.min(flowSteps.length - 1, flowStep + 1))} disabled={flowStep >= flowSteps.length - 1} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: flowStep >= flowSteps.length - 1 ? 'not-allowed' : 'pointer',
          border: '1px solid #C76B4A', background: flowStep >= flowSteps.length - 1 ? '#E5DFD3' : 'rgba(199, 107, 74, 0.08)',
          color: flowStep >= flowSteps.length - 1 ? '#B0A898' : '#C76B4A', fontWeight: 600,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Next</button>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#7A8B7C' }}>
          Step {flowStep + 1} / {flowSteps.length}
        </span>
      </div>
    </div>
  );
}
