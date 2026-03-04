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

const iterations = [
  {
    attempt: 'Write a function to check if a string is a palindrome.\n\ndef is_palindrome(s):\n    return s == s[::-1]',
    evaluation: 'Test Results: 3/5 passed\nFailed: "A man, a plan, a canal: Panama" → False (expected True)\nFailed: "Race Car" → False (expected True)',
    score: 60,
    reflection: 'My solution does a simple string reversal check but fails on:\n1. Case sensitivity — "Race" != "race"\n2. Non-alphanumeric characters — spaces and punctuation should be ignored\nI need to normalize the string before comparing.',
    memoryAdded: 'Palindrome checks must be case-insensitive and ignore non-alphanumeric characters.',
  },
  {
    attempt: 'Using reflection memory: normalize first.\n\ndef is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]',
    evaluation: 'Test Results: 5/5 passed\nAll test cases pass including edge cases.',
    score: 100,
    reflection: 'Solution now handles all cases correctly by:\n1. Converting to lowercase\n2. Filtering out non-alphanumeric characters\n3. Then doing the reversal check\nThis is the standard approach for palindrome validation.',
    memoryAdded: 'String normalization pattern: filter + lowercase before comparison.',
  },
];

const phaseColors: Record<string, string> = {
  attempt: '#5B8DB8',
  evaluate: '#D4A843',
  reflect: '#C76B4A',
  memory: '#8BA888',
};

export default function ReflexionLoopViz() {
  const [iteration, setIteration] = useState(0);
  const [phase, setPhase] = useState(0);

  const iter = iterations[iteration];
  const phases = ['attempt', 'evaluate', 'reflect', 'memory'];
  const phaseLabels = ['Attempt', 'Evaluate', 'Reflect', 'Update Memory'];
  const currentPhase = phases[phase];

  const getPhaseContent = () => {
    switch (currentPhase) {
      case 'attempt': return iter.attempt;
      case 'evaluate': return iter.evaluation;
      case 'reflect': return iter.reflection;
      case 'memory': return iter.memoryAdded;
      default: return '';
    }
  };

  const advance = () => {
    if (phase < 3) setPhase(phase + 1);
    else if (iteration < iterations.length - 1) { setIteration(iteration + 1); setPhase(0); }
  };

  const goBack = () => {
    if (phase > 0) setPhase(phase - 1);
    else if (iteration > 0) { setIteration(iteration - 1); setPhase(3); }
  };

  const isLast = iteration === iterations.length - 1 && phase === 3;
  const isFirst = iteration === 0 && phase === 0;

  const memories = iterations.slice(0, iteration + (phase >= 3 ? 1 : 0)).map(i => i.memoryAdded);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Reflexion Loop Visualization
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch the Reflexion loop: attempt a task, evaluate results, reflect on failures, and retry with accumulated memory.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {iterations.map((_, i) => (
          <div key={i} style={{
            padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
            background: i === iteration ? '#C76B4A12' : i < iteration ? '#8BA88812' : '#F0EBE1',
            color: i === iteration ? '#C76B4A' : i < iteration ? '#8BA888' : '#B0A898',
            border: `1px solid ${i === iteration ? '#C76B4A44' : 'transparent'}`,
          }}>
            Attempt {i + 1} — Score: {i < iteration || (i === iteration && phase >= 1) ? `${iterations[i].score}%` : '?'}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', justifyContent: 'center' }}>
        {phases.map((p, i) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{
              padding: '0.35rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
              background: i === phase ? phaseColors[p] + '18' : i < phase ? phaseColors[p] + '08' : '#F0EBE1',
              color: i <= phase ? phaseColors[p] : '#B0A898',
              border: `1px solid ${i === phase ? phaseColors[p] + '44' : 'transparent'}`,
            }}>{phaseLabels[i]}</div>
            {i < phases.length - 1 && <span style={{ color: i < phase ? '#8BA888' : '#E5DFD3' }}>→</span>}
          </div>
        ))}
      </div>

      <div style={{
        background: phaseColors[currentPhase] + '08', border: `1px solid ${phaseColors[currentPhase]}33`,
        borderRadius: '10px', padding: '1rem', marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: phaseColors[currentPhase], textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          {phaseLabels[phase]}
        </div>
        <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#2C3E2D', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>{getPhaseContent()}</pre>
        {currentPhase === 'evaluate' && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '8px', background: '#E5DFD3', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${iter.score}%`, background: iter.score >= 80 ? '#8BA888' : iter.score >= 50 ? '#D4A843' : '#C76B4A', borderRadius: '4px', transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 600, color: iter.score >= 80 ? '#8BA888' : '#C76B4A' }}>{iter.score}%</span>
          </div>
        )}
      </div>

      {memories.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ ...labelStyle, marginBottom: '0.3rem' }}>Reflection Memory</div>
          {memories.map((m, i) => (
            <div key={i} style={{ padding: '0.35rem 0.6rem', marginBottom: '0.2rem', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.08)', border: '1px solid #8BA88822', fontSize: '0.78rem', color: '#2C3E2D' }}>
              {m}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={goBack} disabled={isFirst} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: isFirst ? 'not-allowed' : 'pointer',
          border: '1px solid #E5DFD3', background: 'transparent', color: isFirst ? '#B0A898' : '#5A6B5C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Back</button>
        <button onClick={advance} disabled={isLast} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: isLast ? 'not-allowed' : 'pointer',
          border: '1px solid #C76B4A', background: isLast ? '#E5DFD3' : 'rgba(199, 107, 74, 0.08)',
          color: isLast ? '#B0A898' : '#C76B4A', fontWeight: 600,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Next</button>
        {isLast && <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600, color: '#8BA888' }}>Task Solved</span>}
      </div>
    </div>
  );
}
