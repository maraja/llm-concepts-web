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

const techniques = [
  { id: 'zero-shot', name: 'Zero-Shot', desc: 'No examples provided, rely on pre-trained knowledge' },
  { id: 'few-shot', name: 'Few-Shot', desc: 'Include 2-5 examples of desired input/output pairs' },
  { id: 'cot', name: 'Chain-of-Thought', desc: 'Ask the model to reason step by step' },
  { id: 'role', name: 'Role-Based', desc: 'Assign the model a specific persona or expertise' },
];

const tasks = [
  { id: 'classify', name: 'Sentiment Classification' },
  { id: 'extract', name: 'Entity Extraction' },
  { id: 'code', name: 'Code Generation' },
];

const prompts: Record<string, Record<string, { prompt: string; quality: number; notes: string }>> = {
  'zero-shot': {
    classify: { prompt: 'Classify the sentiment of this review as positive, negative, or neutral:\n\n"The battery life is amazing but the screen is dim."', quality: 3, notes: 'Works for simple tasks but may miss nuance (mixed sentiment).' },
    extract: { prompt: 'Extract all person names and organizations from this text:\n\n"Sarah from OpenAI presented at the conference."', quality: 2, notes: 'May miss entities or extract partial names without format guidance.' },
    code: { prompt: 'Write a Python function that reverses a linked list.', quality: 3, notes: 'Produces working code but may lack edge case handling.' },
  },
  'few-shot': {
    classify: { prompt: 'Classify the sentiment:\n\nReview: "Great product!" → Positive\nReview: "Terrible quality." → Negative\nReview: "It\'s okay." → Neutral\n\nReview: "The battery life is amazing but the screen is dim." →', quality: 4, notes: 'Examples calibrate the format and demonstrate mixed-sentiment handling.' },
    extract: { prompt: 'Extract entities:\n\nText: "John works at Google." → Person: John, Org: Google\nText: "Lisa from Meta spoke." → Person: Lisa, Org: Meta\n\nText: "Sarah from OpenAI presented at the conference." →', quality: 4, notes: 'Consistent output format from examples greatly improves extraction.' },
    code: { prompt: '# Example: reverse a string\ndef reverse_string(s): return s[::-1]\n\n# Example: reverse an array\ndef reverse_array(arr): return arr[::-1]\n\n# Now: reverse a linked list\ndef reverse_linked_list(head):', quality: 4, notes: 'Pattern from examples guides code style, but linked list is structurally different.' },
  },
  cot: {
    classify: { prompt: 'Classify the sentiment. Think step by step:\n\n"The battery life is amazing but the screen is dim."\n\nStep 1: Identify sentiment-bearing phrases.\nStep 2: Weigh positive vs negative aspects.\nStep 3: Determine overall sentiment.', quality: 5, notes: 'Step-by-step reasoning catches mixed sentiment and produces nuanced classification.' },
    extract: { prompt: 'Extract entities. Reason through the text:\n\n"Sarah from OpenAI presented at the conference."\n\nStep 1: Identify proper nouns.\nStep 2: Classify each as Person, Org, or Location.\nStep 3: List all found entities.', quality: 4, notes: 'Reasoning helps disambiguate entity types but adds verbosity.' },
    code: { prompt: 'Write a function to reverse a linked list.\n\nThink step by step:\n1. What data structure represents a linked list node?\n2. How do we iterate through the list?\n3. How do we reverse the pointers?\n4. Write the code.', quality: 5, notes: 'Decomposition produces well-structured, correct code with clear logic.' },
  },
  role: {
    classify: { prompt: 'You are a senior NLP engineer specializing in sentiment analysis.\n\nAnalyze this review with expert precision, noting any mixed sentiments:\n\n"The battery life is amazing but the screen is dim."', quality: 4, notes: 'Expert persona encourages nuanced analysis and professional output.' },
    extract: { prompt: 'You are an information extraction specialist.\n\nExtract all named entities from this text, categorizing each as PERSON, ORG, or LOC. Use structured output.\n\n"Sarah from OpenAI presented at the conference."', quality: 5, notes: 'Specialist role produces well-structured, comprehensive extractions.' },
    code: { prompt: 'You are a senior software engineer who writes production-quality Python.\n\nWrite a function to reverse a linked list. Include type hints, docstrings, and handle edge cases.', quality: 5, notes: 'Engineering persona produces robust, well-documented code.' },
  },
};

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function PromptTechniqueExplorer() {
  const [technique, setTechnique] = useState('zero-shot');
  const [task, setTask] = useState('classify');

  const current = prompts[technique]?.[task];
  const techInfo = techniques.find(t => t.id === technique)!;

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Prompt Technique Explorer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Compare how different prompting techniques construct prompts and affect output quality.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {techniques.map(t => (
          <button key={t.id} onClick={() => setTechnique(t.id)} style={{
            padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
            border: `1px solid ${technique === t.id ? '#C76B4A' : '#E5DFD3'}`,
            background: technique === t.id ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: technique === t.id ? '#C76B4A' : '#5A6B5C',
            fontWeight: technique === t.id ? 600 : 400,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>{t.name}</button>
        ))}
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#F0EBE1', borderRadius: '8px', fontSize: '0.82rem', color: '#5A6B5C', marginBottom: '1rem' }}>
        {techInfo.desc}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {tasks.map(t => (
          <button key={t.id} onClick={() => setTask(t.id)} style={{
            padding: '0.35rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer',
            border: `1px solid ${task === t.id ? '#D4A843' : '#E5DFD3'}`,
            background: task === t.id ? 'rgba(212, 168, 67, 0.1)' : 'transparent',
            color: task === t.id ? '#9A7A2E' : '#7A8B7C',
            fontWeight: task === t.id ? 600 : 400,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>{t.name}</button>
        ))}
      </div>

      {current && (
        <>
          <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ ...labelStyle, color: '#8BA888', marginBottom: '0.5rem' }}>Constructed Prompt</div>
            <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>{current.prompt}</pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F0EBE1', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#7A8B7C', marginBottom: '0.2rem' }}>Quality Rating</div>
              <span style={{ fontSize: '1.1rem', color: '#D4A843', letterSpacing: '2px' }}>{stars(current.quality)}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#5A6B5C', maxWidth: '60%', textAlign: 'right', lineHeight: 1.5 }}>
              {current.notes}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
