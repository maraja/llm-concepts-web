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

const examples = [
  {
    name: 'Product Review',
    input: 'The new laptop is fantastic — great battery, fast processor, but the keyboard feels cheap.',
    json: { sentiment: 'mixed', score: 0.65, aspects: [{ feature: 'battery', sentiment: 'positive' }, { feature: 'processor', sentiment: 'positive' }, { feature: 'keyboard', sentiment: 'negative' }], summary: 'Mostly positive with keyboard concern' },
    schema: { type: 'object', required: ['sentiment', 'score', 'aspects', 'summary'], properties: { sentiment: 'string', score: 'number (0-1)', aspects: 'array of {feature, sentiment}', summary: 'string' } },
  },
  {
    name: 'Meeting Notes',
    input: 'Call with Sarah on March 5th. Discussed Q3 budget ($2.4M). Action: Sarah to send revised forecast by Friday.',
    json: { date: '2024-03-05', participants: ['Sarah'], topics: ['Q3 budget'], budget: 2400000, action_items: [{ assignee: 'Sarah', task: 'Send revised forecast', deadline: 'Friday' }] },
    schema: { type: 'object', required: ['date', 'participants', 'topics', 'action_items'], properties: { date: 'string (ISO 8601)', participants: 'array of strings', topics: 'array of strings', action_items: 'array of {assignee, task, deadline}' } },
  },
];

type FormatType = 'JSON' | 'XML' | 'YAML';

function toXML(obj: Record<string, unknown>, indent = 0): string {
  const pad = '  '.repeat(indent);
  return Object.entries(obj).map(([k, v]) => {
    if (Array.isArray(v)) {
      const items = v.map(item =>
        typeof item === 'object' && item !== null
          ? `${pad}  <item>\n${toXML(item as Record<string, unknown>, indent + 2)}\n${pad}  </item>`
          : `${pad}  <item>${item}</item>`
      ).join('\n');
      return `${pad}<${k}>\n${items}\n${pad}</${k}>`;
    }
    if (typeof v === 'object' && v !== null) return `${pad}<${k}>\n${toXML(v as Record<string, unknown>, indent + 1)}\n${pad}</${k}>`;
    return `${pad}<${k}>${v}</${k}>`;
  }).join('\n');
}

function toYAML(obj: Record<string, unknown>, indent = 0): string {
  const pad = '  '.repeat(indent);
  return Object.entries(obj).map(([k, v]) => {
    if (Array.isArray(v)) {
      const items = v.map(item =>
        typeof item === 'object' && item !== null
          ? `${pad}  - \n${toYAML(item as Record<string, unknown>, indent + 2)}`
          : `${pad}  - ${item}`
      ).join('\n');
      return `${pad}${k}:\n${items}`;
    }
    if (typeof v === 'object' && v !== null) return `${pad}${k}:\n${toYAML(v as Record<string, unknown>, indent + 1)}`;
    return `${pad}${k}: ${v}`;
  }).join('\n');
}

function formatOutput(obj: Record<string, unknown>, fmt: FormatType): string {
  if (fmt === 'JSON') return JSON.stringify(obj, null, 2);
  if (fmt === 'XML') return `<response>\n${toXML(obj, 1)}\n</response>`;
  return toYAML(obj);
}

export default function JSONModeDemo() {
  const [exIdx, setExIdx] = useState(0);
  const [format, setFormat] = useState<FormatType>('JSON');
  const ex = examples[exIdx];
  const schemaFields = Object.entries(ex.schema.properties);
  const required = ex.schema.required as string[];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Structured Output / JSON Mode
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how natural language is transformed into structured data. Toggle between output formats.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {examples.map((e, i) => (
          <button key={i} onClick={() => setExIdx(i)} style={{
            padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
            border: `1px solid ${exIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: exIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: exIdx === i ? '#C76B4A' : '#5A6B5C', fontWeight: exIdx === i ? 600 : 400,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>{e.name}</button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#2C3E2D', lineHeight: 1.6, fontStyle: 'italic' }}>
        "{ex.input}"
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['JSON', 'XML', 'YAML'] as FormatType[]).map(f => (
          <button key={f} onClick={() => setFormat(f)} style={{
            padding: '0.35rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            border: `1px solid ${format === f ? '#D4A843' : '#E5DFD3'}`,
            background: format === f ? 'rgba(212, 168, 67, 0.1)' : 'transparent',
            color: format === f ? '#9A7A2E' : '#7A8B7C', fontWeight: format === f ? 600 : 400,
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>{formatOutput(ex.json as unknown as Record<string, unknown>, format)}</pre>
      </div>

      <div style={{ ...labelStyle, marginBottom: '0.4rem' }}>Schema Validation</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
        {schemaFields.map(([field, type]) => {
          const isRequired = required.includes(field);
          const present = field in ex.json;
          return (
            <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.6rem', background: present ? 'rgba(139, 168, 136, 0.08)' : 'rgba(199, 107, 74, 0.08)', borderRadius: '6px', fontSize: '0.78rem' }}>
              <span style={{ color: present ? '#8BA888' : '#C76B4A', fontWeight: 700 }}>{present ? '✓' : '✗'}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#2C3E2D', fontWeight: 500 }}>{field}</span>
              <span style={{ color: '#B0A898', fontSize: '0.7rem', marginLeft: 'auto' }}>{type as string}</span>
              {isRequired && <span style={{ fontSize: '0.65rem', color: '#C76B4A', fontWeight: 600 }}>REQ</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
