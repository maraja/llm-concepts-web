import { useState } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

const PIPELINE_STEPS = [
  {
    id: 'prompt', title: 'Generate Prompts', icon: '1',
    desc: 'Collect or generate diverse prompts covering the target distribution.',
    detail: 'Prompts can come from user logs, red-teaming datasets, or synthetic generation.',
  },
  {
    id: 'responses', title: 'Generate Response Pairs', icon: '2',
    desc: 'For each prompt, generate two candidate responses from the policy model.',
    detail: 'Typically sample with different temperatures or from different checkpoints.',
  },
  {
    id: 'judge', title: 'AI Judge Scores', icon: '3',
    desc: 'A capable AI model (e.g., GPT-4, Claude) evaluates which response is better.',
    detail: 'The AI judge uses a structured rubric to compare responses on helpfulness, harmlessness, and honesty.',
  },
  {
    id: 'reward', title: 'Train Reward Model', icon: '4',
    desc: 'Use AI-generated preferences to train a reward model (or use DPO directly).',
    detail: 'The reward model learns to predict AI judge preferences, distilling the judge capability into a smaller model.',
  },
  {
    id: 'optimize', title: 'RL Optimization', icon: '5',
    desc: 'Use the reward model to optimize the policy via PPO, GRPO, or DPO.',
    detail: 'The policy is updated to maximize the learned reward while staying close to the reference model.',
  },
];

const JUDGE_PROMPTS = [
  {
    title: 'Helpfulness Judge',
    prompt: 'Given the following prompt and two responses, which response is more helpful, accurate, and relevant? Consider clarity, completeness, and correctness.\n\nPrompt: {prompt}\nResponse A: {response_a}\nResponse B: {response_b}\n\nPreferred: ',
  },
  {
    title: 'Safety Judge',
    prompt: 'Evaluate which response is safer and less likely to cause harm. Consider potential for misinformation, bias, and harmful content.\n\nPrompt: {prompt}\nResponse A: {response_a}\nResponse B: {response_b}\n\nSafer response: ',
  },
  {
    title: 'Constitutional AI Judge',
    prompt: 'Which response better adheres to these principles:\n1. Be helpful and informative\n2. Avoid harmful or deceptive content\n3. Be honest about limitations\n\nPrompt: {prompt}\nResponse A: {response_a}\nResponse B: {response_b}\n\nBetter response: ',
  },
];

const COST_DATA = [
  { label: 'Human annotators', cost: '$1-10', perUnit: 'per comparison', time: '2-5 min', scale: 100, color: '#C76B4A' },
  { label: 'AI judge (API)', cost: '$0.001-0.01', perUnit: 'per comparison', time: '2-5 sec', scale: 1, color: '#8BA888' },
];

export default function RLAIFPipelineViz() {
  const [activeStep, setActiveStep] = useState(2);
  const [showJudge, setShowJudge] = useState(0);
  const [view, setView] = useState<'pipeline' | 'cost' | 'judges'>('pipeline');

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          RLAIF: Reinforcement Learning from AI Feedback
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Replace expensive human annotators with AI judges to scale preference data collection.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['pipeline', 'cost', 'judges'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '0.35rem 0.7rem', borderRadius: '6px',
            border: `1px solid ${view === v ? '#C76B4A' : '#E5DFD3'}`,
            background: view === v ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: view === v ? '#C76B4A' : '#5A6B5C',
            fontWeight: view === v ? 600 : 400,
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {v === 'pipeline' ? 'Pipeline' : v === 'cost' ? 'Cost Comparison' : 'AI Judge Prompts'}
          </button>
        ))}
      </div>

      {view === 'pipeline' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.id} onClick={() => setActiveStep(i)} style={{
                background: activeStep === i ? 'rgba(139, 168, 136, 0.12)' : '#F0EBE1',
                borderRadius: '8px', padding: '0.65rem 0.8rem', cursor: 'pointer',
                borderLeft: `3px solid ${activeStep === i ? (step.id === 'judge' ? '#D4A843' : '#8BA888') : 'transparent'}`,
                transition: 'all 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: step.id === 'judge' ? '#D4A843' : '#8BA888',
                    color: '#fff', fontSize: '0.62rem', fontWeight: 700,
                  }}>{step.icon}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>{step.title}</span>
                  {step.id === 'judge' && <span style={{ fontSize: '0.55rem', background: '#D4A843', color: '#fff', padding: '0.08rem 0.3rem', borderRadius: '4px', fontWeight: 700 }}>AI REPLACES HUMAN</span>}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#5A6B5C', margin: '0.25rem 0 0 0', lineHeight: 1.4 }}>{step.desc}</p>
                {activeStep === i && (
                  <p style={{ fontSize: '0.72rem', color: '#7A8B7C', margin: '0.35rem 0 0 0', lineHeight: 1.5, fontStyle: 'italic', borderTop: '1px solid #E5DFD3', paddingTop: '0.35rem' }}>
                    {step.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'cost' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            {COST_DATA.map(c => (
              <div key={c.label} style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C3E2D' }}>{c.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 700, color: c.color }}>{c.cost}</span>
                </div>
                <div style={{ height: '12px', background: '#E5DFD3', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                  <div style={{ width: `${c.scale}%`, height: '100%', background: c.color, borderRadius: '6px', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#7A8B7C' }}>
                  <span>{c.perUnit}</span>
                  <span>Latency: {c.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8BA888', fontFamily: "'JetBrains Mono', monospace" }}>100-1000x cheaper</div>
            <div style={{ fontSize: '0.75rem', color: '#5A6B5C', marginTop: '0.2rem' }}>AI feedback enables training on millions of comparisons at a fraction of the cost</div>
          </div>
        </div>
      )}

      {view === 'judges' && (
        <div>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {JUDGE_PROMPTS.map((j, i) => (
              <button key={i} onClick={() => setShowJudge(i)} style={{
                padding: '0.35rem 0.7rem', borderRadius: '6px',
                border: `1px solid ${showJudge === i ? '#D4A843' : '#E5DFD3'}`,
                background: showJudge === i ? 'rgba(212, 168, 67, 0.08)' : 'transparent',
                color: showJudge === i ? '#D4A843' : '#5A6B5C',
                fontWeight: showJudge === i ? 600 : 400,
                fontSize: '0.72rem', cursor: 'pointer',
              }}>
                {j.title}
              </button>
            ))}
          </div>
          <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.62rem', color: '#7A8B7C', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.4rem' }}>
              {JUDGE_PROMPTS[showJudge].title} -- System Prompt
            </div>
            <pre style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#2C3E2D',
              background: '#FDFBF7', padding: '0.75rem', borderRadius: '6px',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, margin: 0,
              border: '1px solid #E5DFD3',
            }}>{JUDGE_PROMPTS[showJudge].prompt}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
