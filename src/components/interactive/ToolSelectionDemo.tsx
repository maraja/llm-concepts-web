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

const tools = [
  { name: 'get_weather', desc: 'Get current weather for a location', params: ['location', 'units'] },
  { name: 'calculate', desc: 'Evaluate a mathematical expression', params: ['expression'] },
  { name: 'web_search', desc: 'Search the web for information', params: ['query', 'num_results'] },
  { name: 'send_email', desc: 'Send an email to a recipient', params: ['to', 'subject', 'body'] },
  { name: 'get_stock_price', desc: 'Get current stock price by ticker', params: ['ticker'] },
];

const queries = [
  {
    text: 'What is the temperature in Paris right now?',
    selected: 'get_weather',
    reasoning: 'The user is asking about current temperature, which is real-time weather data. The get_weather tool is the best match — it retrieves current weather for a given location.',
    params: { location: 'Paris', units: 'celsius' },
    scores: [0.95, 0.05, 0.15, 0.0, 0.0],
  },
  {
    text: 'How much is 17.5% of 2,340?',
    selected: 'calculate',
    reasoning: 'This is a mathematical calculation. While I could compute this, using the calculate tool ensures precision. The expression can be directly parsed from the query.',
    params: { expression: '2340 * 0.175' },
    scores: [0.0, 0.97, 0.05, 0.0, 0.0],
  },
  {
    text: 'What is Apple stock trading at today?',
    selected: 'get_stock_price',
    reasoning: 'The user wants a current stock price. The get_stock_price tool is designed for this. I can extract "AAPL" as the ticker from "Apple".',
    params: { ticker: 'AAPL' },
    scores: [0.0, 0.0, 0.25, 0.0, 0.92],
  },
  {
    text: 'Send a meeting reminder to john@company.com',
    selected: 'send_email',
    reasoning: 'The user wants to send an email. I can extract the recipient from the query and construct appropriate subject and body for a meeting reminder.',
    params: { to: 'john@company.com', subject: 'Meeting Reminder', body: 'This is a reminder about your upcoming meeting.' },
    scores: [0.0, 0.0, 0.0, 0.96, 0.0],
  },
];

export default function ToolSelectionDemo() {
  const [queryIdx, setQueryIdx] = useState(0);
  const [showReasoning, setShowReasoning] = useState(false);

  const query = queries[queryIdx];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Tool Selection Demo
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how the model evaluates available tools, reasons about which to use, and extracts parameters.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {queries.map((q, i) => (
          <button key={i} onClick={() => { setQueryIdx(i); setShowReasoning(false); }} style={{
            padding: '0.35rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
            border: `1px solid ${queryIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: queryIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: queryIdx === i ? '#C76B4A' : '#5A6B5C', fontWeight: queryIdx === i ? 600 : 400,
            fontFamily: "'Source Sans 3', system-ui, sans-serif", maxWidth: '200px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{q.text}</button>
        ))}
      </div>

      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#2C3E2D' }}>
        <span style={{ fontWeight: 600 }}>Query:</span> "{query.text}"
      </div>

      <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Tool Matching Scores</div>
      <div style={{ marginBottom: '1rem' }}>
        {tools.map((tool, i) => {
          const score = query.scores[i];
          const isSelected = tool.name === query.selected;
          return (
            <div key={tool.name} style={{
              display: 'grid', gridTemplateColumns: '140px 1fr 50px', alignItems: 'center', gap: '0.6rem',
              padding: '0.4rem 0.6rem', marginBottom: '0.3rem', borderRadius: '6px',
              background: isSelected ? 'rgba(199, 107, 74, 0.06)' : 'transparent',
              border: `1px solid ${isSelected ? '#C76B4A44' : 'transparent'}`,
            }}>
              <div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#C76B4A' : '#2C3E2D' }}>
                  {tool.name}
                </span>
                <div style={{ fontSize: '0.68rem', color: '#B0A898' }}>{tool.desc}</div>
              </div>
              <div style={{ height: '16px', background: '#F0EBE1', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${score * 100}%`, borderRadius: '4px', transition: 'width 0.4s ease',
                  background: isSelected ? 'linear-gradient(90deg, #C76B4A, #D4896D)' : score > 0.1 ? 'linear-gradient(90deg, #8BA888, #A8C4A5)' : '#C4BFB3',
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: isSelected ? '#C76B4A' : '#7A8B7C', textAlign: 'right', fontWeight: isSelected ? 600 : 400 }}>
                {(score * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      <button onClick={() => setShowReasoning(!showReasoning)} style={{
        padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
        border: '1px solid #D4A843', background: showReasoning ? 'rgba(212, 168, 67, 0.1)' : 'transparent',
        color: '#9A7A2E', fontWeight: 500, fontFamily: "'Source Sans 3', system-ui, sans-serif", marginBottom: '1rem',
      }}>{showReasoning ? 'Hide' : 'Show'} Model Reasoning</button>

      {showReasoning && (
        <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ ...labelStyle, color: '#8BA888', marginBottom: '0.4rem' }}>Reasoning</div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#F5F0E8', margin: '0 0 0.75rem 0', lineHeight: 1.7 }}>
            {query.reasoning}
          </p>
          <div style={{ ...labelStyle, color: '#D4A843', marginBottom: '0.4rem' }}>Extracted Parameters</div>
          <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#F5F0E8', margin: 0, lineHeight: 1.6 }}>{JSON.stringify(query.params, null, 2)}</pre>
        </div>
      )}

      <div style={{ padding: '0.6rem 0.8rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        Selected: <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: '#C76B4A' }}>{query.selected}()</strong> with {Object.keys(query.params).length} parameters
      </div>
    </div>
  );
}
