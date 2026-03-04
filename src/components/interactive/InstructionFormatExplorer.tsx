import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const TEMPLATES: Record<string, { template: string; placeholders: Record<string, string> }> = {
  Alpaca: {
    template: '### Instruction:\n{instruction}\n\n### Input:\n{input}\n\n### Response:\n{response}',
    placeholders: { '{instruction}': '#C76B4A', '{input}': '#D4A843', '{response}': '#8BA888' },
  },
  ShareGPT: {
    template: '{"conversations": [\n  {"from": "human", "value": "{instruction}"},\n  {"from": "gpt", "value": "{response}"}\n]}',
    placeholders: { '{instruction}': '#C76B4A', '{response}': '#8BA888' },
  },
  ChatML: {
    template: '<|im_start|>system\n{system}<|im_end|>\n<|im_start|>user\n{instruction}<|im_end|>\n<|im_start|>assistant\n{response}<|im_end|>',
    placeholders: { '{system}': '#D4A843', '{instruction}': '#C76B4A', '{response}': '#8BA888' },
  },
};

const FORMAT_INFO: Record<string, string> = {
  Alpaca: 'Developed by Stanford. Simple markdown-style format with clear section headers. Widely used in open-source fine-tuning.',
  ShareGPT: 'JSON-based conversational format. Supports multi-turn dialogue naturally. Popular on HuggingFace datasets.',
  ChatML: 'OpenAI\'s Chat Markup Language. Uses special tokens for role boundaries. Supports system, user, and assistant roles.',
};

export default function InstructionFormatExplorer() {
  const [activeFormat, setActiveFormat] = useState('Alpaca');
  const [userInstruction, setUserInstruction] = useState('Explain recursion to a beginner.');
  const tmpl = TEMPLATES[activeFormat];

  const renderTemplate = (text: string) => {
    const parts: { text: string; color?: string }[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      let earliest = -1;
      let earliestKey = '';
      for (const key of Object.keys(tmpl.placeholders)) {
        const idx = remaining.indexOf(key);
        if (idx !== -1 && (earliest === -1 || idx < earliest)) {
          earliest = idx;
          earliestKey = key;
        }
      }
      if (earliest === -1) {
        parts.push({ text: remaining });
        break;
      }
      if (earliest > 0) parts.push({ text: remaining.slice(0, earliest) });
      parts.push({ text: earliestKey, color: tmpl.placeholders[earliestKey] });
      remaining = remaining.slice(earliest + earliestKey.length);
    }
    return parts;
  };

  const fillTemplate = () => {
    let result = tmpl.template;
    result = result.replace('{instruction}', userInstruction || '...');
    result = result.replace('{input}', '(no additional input)');
    result = result.replace('{response}', 'The model\'s generated response will appear here.');
    result = result.replace('{system}', 'You are a helpful assistant.');
    return result;
  };

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Instruction Format Explorer
        </h3>
      </div>

      {/* Format tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {Object.keys(TEMPLATES).map((fmt) => (
          <button key={fmt} onClick={() => setActiveFormat(fmt)} style={{
            padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
            border: activeFormat === fmt ? '2px solid #C76B4A' : '1px solid #E5DFD3',
            background: activeFormat === fmt ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: activeFormat === fmt ? '#C76B4A' : '#2C3E2D',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600,
          }}>{fmt}</button>
        ))}
      </div>

      <div style={{ fontSize: '0.82rem', color: '#6B7B6E', marginBottom: '1rem', lineHeight: 1.5 }}>{FORMAT_INFO[activeFormat]}</div>

      {/* Raw template */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#8BA888', marginBottom: '0.4rem' }}>Template Format</div>
        <pre style={{ background: 'rgba(44, 62, 45, 0.05)', borderRadius: '10px', padding: '1rem', margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{renderTemplate(tmpl.template).map((p, i) => (
            <span key={i} style={{ color: p.color || '#2C3E2D', fontWeight: p.color ? 700 : 400, background: p.color ? `${p.color}15` : 'transparent', borderRadius: p.color ? '3px' : 0, padding: p.color ? '0 3px' : 0 }}>{p.text}</span>
          ))}</pre>
      </div>

      {/* User input */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#C76B4A', marginBottom: '0.4rem' }}>Your Instruction</div>
        <input
          value={userInstruction}
          onChange={(e) => setUserInstruction(e.target.value)}
          placeholder="Type an instruction..."
          style={{
            width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #E5DFD3', background: '#fff',
            fontFamily: "'Source Sans 3', system-ui, sans-serif", fontSize: '0.9rem', color: '#2C3E2D', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filled result */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#D4A843', marginBottom: '0.4rem' }}>Formatted Output</div>
        <pre style={{ background: 'rgba(212, 168, 67, 0.06)', borderRadius: '10px', padding: '1rem', margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#2C3E2D' }}>{fillTemplate()}</pre>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(tmpl.placeholders).map(([key, color]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', color: '#6B7B6E', fontFamily: "'JetBrains Mono', monospace" }}>{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
