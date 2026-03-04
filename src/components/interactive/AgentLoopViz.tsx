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

const phaseColors: Record<string, string> = {
  Observe: '#5B8DB8',
  Think: '#D4A843',
  Act: '#C76B4A',
  Result: '#8BA888',
};

const iterations = [
  [
    { phase: 'Observe', content: 'Task: "Find the population of Tokyo and compare it to New York"\nNo previous results. Starting fresh.' },
    { phase: 'Think', content: 'I need to look up population data for both cities. Let me start with Tokyo since it was mentioned first.' },
    { phase: 'Act', content: 'Tool: web_search("Tokyo population 2024")\nSearching...' },
    { phase: 'Result', content: 'Search returned: Tokyo metropolitan area population is approximately 37.4 million (2024).' },
  ],
  [
    { phase: 'Observe', content: 'Tokyo population: 37.4 million. Still need New York population for comparison.' },
    { phase: 'Think', content: 'I have Tokyo data. Now I need New York population to make the comparison.' },
    { phase: 'Act', content: 'Tool: web_search("New York City population 2024")\nSearching...' },
    { phase: 'Result', content: 'Search returned: New York City metro area population is approximately 19.6 million (2024).' },
  ],
  [
    { phase: 'Observe', content: 'Tokyo: 37.4M, New York: 19.6M. I have both data points for comparison.' },
    { phase: 'Think', content: 'I have both populations. Tokyo is 37.4M / 19.6M = ~1.9x larger. I can now provide the final answer.' },
    { phase: 'Act', content: 'Action: respond_to_user\nComposing final comparative answer.' },
    { phase: 'Result', content: 'FINAL: Tokyo (37.4M) is roughly 1.9x more populous than New York (19.6M), making it the larger metropolitan area by about 17.8 million people.' },
  ],
];

export default function AgentLoopViz() {
  const [iteration, setIteration] = useState(0);
  const [step, setStep] = useState(0);

  const currentIter = iterations[iteration];
  const allPreviousSteps = iterations.slice(0, iteration).flat();
  const visibleSteps = [...allPreviousSteps, ...currentIter.slice(0, step + 1)];
  const isLast = iteration === iterations.length - 1 && step === currentIter.length - 1;

  const advance = () => {
    if (step < currentIter.length - 1) {
      setStep(step + 1);
    } else if (iteration < iterations.length - 1) {
      setIteration(iteration + 1);
      setStep(0);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else if (iteration > 0) {
      setIteration(iteration - 1);
      setStep(iterations[iteration - 1].length - 1);
    }
  };

  const phases = ['Observe', 'Think', 'Act', 'Result'];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Agent Loop Visualization
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Step through the core agent loop: Observe, Think, Act, Observe. Watch the agent iterate to solve a task.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
        {phases.map((p, i) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
              background: phaseColors[p] + '15', color: phaseColors[p],
              border: `1px solid ${phaseColors[p]}33`,
            }}>{p}</div>
            {i < phases.length - 1 && <span style={{ color: '#E5DFD3', fontSize: '0.9rem' }}>→</span>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {iterations.map((_, i) => (
          <div key={i} style={{
            padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
            background: i === iteration ? '#C76B4A12' : i < iteration ? '#8BA88812' : '#F0EBE1',
            color: i === iteration ? '#C76B4A' : i < iteration ? '#8BA888' : '#B0A898',
            border: `1px solid ${i === iteration ? '#C76B4A44' : 'transparent'}`,
          }}>Iteration {i + 1}</div>
        ))}
      </div>

      <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '1rem' }}>
        {visibleSteps.map((s, i) => {
          const isCurrentStep = i === visibleSteps.length - 1;
          const color = phaseColors[s.phase];
          return (
            <div key={i} style={{
              display: 'flex', gap: '0.5rem', padding: '0.5rem 0.6rem', marginBottom: '0.3rem',
              borderRadius: '8px', transition: 'all 0.2s ease',
              background: isCurrentStep ? color + '0A' : 'transparent',
              border: `1px solid ${isCurrentStep ? color + '33' : 'transparent'}`,
              opacity: isCurrentStep ? 1 : 0.7,
            }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, color: color, minWidth: '54px',
                textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '0.1rem',
              }}>{s.phase}</span>
              <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#2C3E2D', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6, flex: 1 }}>{s.content}</pre>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={goBack} disabled={iteration === 0 && step === 0} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: iteration === 0 && step === 0 ? 'not-allowed' : 'pointer',
          border: '1px solid #E5DFD3', background: 'transparent',
          color: iteration === 0 && step === 0 ? '#B0A898' : '#5A6B5C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Back</button>
        <button onClick={advance} disabled={isLast} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem',
          cursor: isLast ? 'not-allowed' : 'pointer',
          border: '1px solid #C76B4A', background: isLast ? '#E5DFD3' : 'rgba(199, 107, 74, 0.08)',
          color: isLast ? '#B0A898' : '#C76B4A', fontWeight: 600,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Next</button>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#7A8B7C' }}>
          Iteration {iteration + 1}/{iterations.length}, Step {step + 1}/{currentIter.length}
        </span>
        {isLast && <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600, color: '#8BA888' }}>Task Complete</span>}
      </div>
    </div>
  );
}
