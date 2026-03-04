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

const discoverySteps = [
  {
    phase: 'Initialize Connection',
    icon: '🔗',
    color: '#5B8DB8',
    detail: 'The MCP client initiates a connection with the server. The client and server negotiate protocol version and capabilities.',
    request: '{\n  "jsonrpc": "2.0",\n  "method": "initialize",\n  "params": {\n    "protocolVersion": "2024-11-05",\n    "clientInfo": {\n      "name": "claude-desktop",\n      "version": "1.0.0"\n    },\n    "capabilities": {}\n  }\n}',
    response: '{\n  "protocolVersion": "2024-11-05",\n  "serverInfo": {\n    "name": "filesystem-server",\n    "version": "0.5.0"\n  },\n  "capabilities": {\n    "tools": { "listChanged": true }\n  }\n}',
  },
  {
    phase: 'Discover Tools',
    icon: '🔍',
    color: '#D4A843',
    detail: 'The client requests the list of available tools. The server advertises each tool with its name, description, and input schema.',
    request: '{\n  "jsonrpc": "2.0",\n  "method": "tools/list",\n  "params": {}\n}',
    response: '{\n  "tools": [\n    {\n      "name": "read_file",\n      "description": "Read contents of a file",\n      "inputSchema": {\n        "type": "object",\n        "properties": {\n          "path": { "type": "string" }\n        },\n        "required": ["path"]\n      }\n    },\n    {\n      "name": "write_file",\n      "description": "Write content to a file",\n      "inputSchema": {\n        "type": "object",\n        "properties": {\n          "path": { "type": "string" },\n          "content": { "type": "string" }\n        },\n        "required": ["path", "content"]\n      }\n    },\n    {\n      "name": "list_directory",\n      "description": "List files in a directory",\n      "inputSchema": {\n        "type": "object",\n        "properties": {\n          "path": { "type": "string" }\n        },\n        "required": ["path"]\n      }\n    }\n  ]\n}',
  },
  {
    phase: 'Invoke Tool',
    icon: '⚡',
    color: '#C76B4A',
    detail: 'The client invokes a discovered tool by name, passing the required parameters according to the input schema.',
    request: '{\n  "jsonrpc": "2.0",\n  "method": "tools/call",\n  "params": {\n    "name": "read_file",\n    "arguments": {\n      "path": "/project/src/index.ts"\n    }\n  }\n}',
    response: '{\n  "content": [\n    {\n      "type": "text",\n      "text": "import express from \'express\';\\nconst app = express();\\napp.listen(3000);"\n    }\n  ]\n}',
  },
  {
    phase: 'Deliver Result',
    icon: '✅',
    color: '#8BA888',
    detail: 'The client delivers the tool result back to the host application. The LLM can now use this information in its response.',
    request: null,
    response: 'The file /project/src/index.ts contains a basic Express server setup:\n\nimport express from \'express\';\nconst app = express();\napp.listen(3000);\n\nIt creates an Express app and listens on port 3000.',
  },
];

export default function MCPToolDiscoveryDemo() {
  const [step, setStep] = useState(0);
  const current = discoverySteps[step];
  const isLast = step === discoverySteps.length - 1;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          MCP Tool Discovery
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Step through MCP tool discovery: connect, discover available tools, invoke with parameters, and receive results.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem' }}>
        {discoverySteps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
            <button onClick={() => setStep(i)} style={{
              padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', width: '100%',
              border: `1px solid ${step === i ? s.color : i < step ? s.color + '44' : '#E5DFD3'}`,
              background: step === i ? s.color + '12' : i < step ? s.color + '06' : 'transparent',
              color: step === i ? s.color : i < step ? s.color : '#B0A898',
              fontWeight: step === i ? 600 : 400,
              fontFamily: "'Source Sans 3', system-ui, sans-serif",
            }}>
              {s.icon} {s.phase}
            </button>
            {i < discoverySteps.length - 1 && <span style={{ color: i < step ? '#8BA888' : '#E5DFD3', fontSize: '0.8rem', flexShrink: 0 }}>→</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '0.6rem 0.8rem', background: current.color + '08', border: `1px solid ${current.color}33`, borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', color: '#5A6B5C', lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: current.color }}>{current.phase}:</span> {current.detail}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: current.request ? '1fr 1fr' : '1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {current.request && (
          <div>
            <div style={{ ...labelStyle, color: '#C76B4A', marginBottom: '0.3rem' }}>Request</div>
            <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '0.8rem', height: '200px', overflowY: 'auto' }}>
              <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{current.request}</pre>
            </div>
          </div>
        )}
        <div>
          <div style={{ ...labelStyle, color: '#8BA888', marginBottom: '0.3rem' }}>{current.request ? 'Response' : 'Final Output'}</div>
          <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '0.8rem', height: '200px', overflowY: 'auto' }}>
            <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{current.response}</pre>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: step === 0 ? 'not-allowed' : 'pointer',
          border: '1px solid #E5DFD3', background: 'transparent',
          color: step === 0 ? '#B0A898' : '#5A6B5C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Back</button>
        <button onClick={() => setStep(Math.min(discoverySteps.length - 1, step + 1))} disabled={isLast} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: isLast ? 'not-allowed' : 'pointer',
          border: '1px solid #C76B4A', background: isLast ? '#E5DFD3' : 'rgba(199, 107, 74, 0.08)',
          color: isLast ? '#B0A898' : '#C76B4A', fontWeight: 600,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Next Step</button>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#7A8B7C' }}>
          Step {step + 1} / {discoverySteps.length}
        </span>
        {isLast && (
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600, color: '#8BA888' }}>Flow Complete</span>
        )}
      </div>
    </div>
  );
}
