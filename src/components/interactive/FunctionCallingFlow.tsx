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

const scenarios = [
  {
    name: 'Weather Query',
    query: 'What is the weather like in Tokyo right now?',
    steps: [
      { phase: 'User Query', actor: 'user', content: 'What is the weather like in Tokyo right now?', color: '#5B8DB8' },
      { phase: 'Model Decides', actor: 'model', content: 'I need to call get_weather() to answer this.\n\nFunction: get_weather\nArgs: { "location": "Tokyo", "units": "celsius" }', color: '#D4A843' },
      { phase: 'Function Executes', actor: 'function', content: '// API call: GET /weather?q=Tokyo\n\nResponse: {\n  "temp": 22,\n  "condition": "Partly Cloudy",\n  "humidity": 65\n}', color: '#8BA888' },
      { phase: 'Result to Model', actor: 'model', content: 'Received function result. Incorporating into response...', color: '#D4A843' },
      { phase: 'Final Response', actor: 'model', content: 'The weather in Tokyo is currently 22 degrees C and partly cloudy with 65% humidity.', color: '#C76B4A' },
    ],
  },
  {
    name: 'Calculator',
    query: 'What is 15% tip on a $84.50 bill?',
    steps: [
      { phase: 'User Query', actor: 'user', content: 'What is 15% tip on a $84.50 bill?', color: '#5B8DB8' },
      { phase: 'Model Decides', actor: 'model', content: 'I should use the calculator for precision.\n\nFunction: calculate\nArgs: { "expression": "84.50 * 0.15" }', color: '#D4A843' },
      { phase: 'Function Executes', actor: 'function', content: '// Evaluating: 84.50 * 0.15\n\nResult: 12.675', color: '#8BA888' },
      { phase: 'Result to Model', actor: 'model', content: 'Received calculation result: 12.675. Formatting response...', color: '#D4A843' },
      { phase: 'Final Response', actor: 'model', content: 'A 15% tip on $84.50 would be $12.68 (rounded up), making the total $97.18.', color: '#C76B4A' },
    ],
  },
  {
    name: 'Search',
    query: 'Who won the latest Nobel Prize in Physics?',
    steps: [
      { phase: 'User Query', actor: 'user', content: 'Who won the latest Nobel Prize in Physics?', color: '#5B8DB8' },
      { phase: 'Model Decides', actor: 'model', content: 'My training data may be outdated. I need to search.\n\nFunction: web_search\nArgs: { "query": "Nobel Prize Physics latest winner" }', color: '#D4A843' },
      { phase: 'Function Executes', actor: 'function', content: '// Searching: "Nobel Prize Physics latest winner"\n\nResults: [\n  { "title": "Nobel Prize 2024 Physics",\n    "snippet": "Awarded to Hopfield and Hinton for foundational discoveries in machine learning..." }\n]', color: '#8BA888' },
      { phase: 'Result to Model', actor: 'model', content: 'Received search results. Synthesizing answer from retrieved data...', color: '#D4A843' },
      { phase: 'Final Response', actor: 'model', content: 'The 2024 Nobel Prize in Physics was awarded to John Hopfield and Geoffrey Hinton for foundational discoveries enabling machine learning with artificial neural networks.', color: '#C76B4A' },
    ],
  },
];

const actorIcons: Record<string, string> = { user: '👤', model: '🤖', function: '⚙️' };

export default function FunctionCallingFlow() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [step, setStep] = useState(0);

  const scenario = scenarios[scenarioIdx];
  const maxStep = scenario.steps.length - 1;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Function Calling Flow
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Step through the function calling loop: query, tool selection, execution, and final response.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {scenarios.map((s, i) => (
          <button key={i} onClick={() => { setScenarioIdx(i); setStep(0); }} style={{
            padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
            border: `1px solid ${scenarioIdx === i ? '#C76B4A' : '#E5DFD3'}`,
            background: scenarioIdx === i ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: scenarioIdx === i ? '#C76B4A' : '#5A6B5C', fontWeight: scenarioIdx === i ? 600 : 400,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>{s.name}</button>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        {scenario.steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex', gap: '0.75rem', padding: '0.75rem', marginBottom: '0.5rem',
            borderRadius: '8px', transition: 'all 0.25s ease',
            opacity: i <= step ? 1 : 0.2,
            background: i === step ? s.color + '0D' : 'transparent',
            border: `1px solid ${i === step ? s.color + '44' : 'transparent'}`,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '36px' }}>
              <span style={{ fontSize: '1.1rem' }}>{actorIcons[s.actor]}</span>
              {i < scenario.steps.length - 1 && (
                <div style={{ width: '2px', flex: 1, background: i < step ? s.color + '44' : '#E5DFD3', marginTop: '0.3rem' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.color, marginBottom: '0.3rem' }}>
                {s.phase}
              </div>
              {i <= step && (
                <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#2C3E2D', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6, background: '#F0EBE1', padding: '0.5rem', borderRadius: '6px' }}>{s.content}</pre>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: step === 0 ? 'not-allowed' : 'pointer',
          border: '1px solid #E5DFD3', background: 'transparent', color: step === 0 ? '#B0A898' : '#5A6B5C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Back</button>
        <button onClick={() => setStep(Math.min(maxStep, step + 1))} disabled={step === maxStep} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: step === maxStep ? 'not-allowed' : 'pointer',
          border: '1px solid #C76B4A', background: step === maxStep ? '#E5DFD3' : 'rgba(199, 107, 74, 0.08)',
          color: step === maxStep ? '#B0A898' : '#C76B4A', fontWeight: 600,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Next Step</button>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#7A8B7C' }}>
          Step {step + 1} / {scenario.steps.length}
        </span>
        <button onClick={() => setStep(0)} style={{
          marginLeft: 'auto', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem',
          cursor: 'pointer', border: '1px solid #E5DFD3', background: 'transparent', color: '#7A8B7C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Reset</button>
      </div>
    </div>
  );
}
