import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

interface PipelineStep {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  detail: (batchSize: number, seqLen: number, step: number) => string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'data',
    label: 'Raw Data',
    icon: '\u{1F4C4}',
    color: '#7A8B7C',
    description: 'Raw text documents from the training corpus are sampled and loaded into memory.',
    detail: (bs, sl) => `Loading ${bs} documents from corpus, each ~${(sl * 4 / 1000).toFixed(1)}KB of text`,
  },
  {
    id: 'tokenize',
    label: 'Tokenize',
    icon: '\u{1F524}',
    color: '#8BA888',
    description: 'Text is split into tokens using BPE or similar tokenizer. Each token maps to an integer ID.',
    detail: (bs, sl) => `${bs} docs -> ${(bs * sl).toLocaleString()} tokens (${sl} per sequence)`,
  },
  {
    id: 'batch',
    label: 'Batch',
    icon: '\u{1F4E6}',
    color: '#D4A843',
    description: 'Token sequences are grouped into batches and padded/truncated to uniform length. Input tensor is created.',
    detail: (bs, sl) => `Tensor shape: [${bs}, ${sl}] = ${(bs * sl).toLocaleString()} tokens per batch`,
  },
  {
    id: 'forward',
    label: 'Forward',
    icon: '\u{27A1}\u{FE0F}',
    color: '#C76B4A',
    description: 'The batch passes through all transformer layers: embeddings, attention, FFN, producing logits over the vocabulary.',
    detail: (bs, sl) => `Output logits: [${bs}, ${sl}, 32000] = ${(bs * sl * 32000 / 1e6).toFixed(1)}M values`,
  },
  {
    id: 'loss',
    label: 'Compute Loss',
    icon: '\u{1F4C9}',
    color: '#C76B4A',
    description: 'Cross-entropy loss is computed between predicted next-token probabilities and actual next tokens.',
    detail: (bs, sl, step) => {
      const loss = 11.0 * Math.exp(-step * 0.0003) + 1.5 + Math.random() * 0.1;
      return `CE Loss: ${loss.toFixed(3)} | Perplexity: ${Math.exp(loss).toFixed(0)} | over ${(bs * sl).toLocaleString()} predictions`;
    },
  },
  {
    id: 'backward',
    label: 'Backward',
    icon: '\u{2B05}\u{FE0F}',
    color: '#D4A843',
    description: 'Gradients of the loss are computed for every parameter via backpropagation through all layers.',
    detail: (bs, sl) => `Computing gradients for ~7B parameters, grad norm typically 0.5-2.0`,
  },
  {
    id: 'update',
    label: 'Update',
    icon: '\u{2705}',
    color: '#8BA888',
    description: 'Optimizer (typically AdamW) updates all parameters using gradients, momentum, and weight decay.',
    detail: (bs, sl, step) => {
      const lr = 3e-4 * Math.min(1, step / 2000) * Math.max(0.1, 1 - step / 100000);
      return `AdamW step ${step.toLocaleString()} | lr: ${lr.toExponential(2)} | avg update: ~${(lr * 0.01).toExponential(1)}`;
    },
  },
];

export default function PreTrainingPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [batchSize, setBatchSize] = useState(8);
  const [seqLen, setSeqLen] = useState(2048);
  const [trainingStep, setTrainingStep] = useState(1000);

  const currentStep = PIPELINE_STEPS[activeStep];

  const tokensProcessed = useMemo(() => {
    return trainingStep * batchSize * seqLen;
  }, [trainingStep, batchSize, seqLen]);

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Pre-Training Pipeline
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Walk through each step of a single training iteration. Click on any stage to see what happens.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Batch Size', value: batchSize, set: setBatchSize, min: 1, max: 64, step: 1, fmt: (v: number) => String(v) },
          { label: 'Seq Length', value: seqLen, set: setSeqLen, min: 512, max: 8192, step: 512, fmt: (v: number) => v.toLocaleString() },
          { label: 'Training Step', value: trainingStep, set: setTrainingStep, min: 1, max: 100000, step: 100, fmt: (v: number) => v.toLocaleString() },
        ].map(({ label, value, set, min, max, step, fmt }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{fmt(value)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      {/* Pipeline visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '1.25rem', overflowX: 'auto' }}>
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <button onClick={() => setActiveStep(i)} style={{
              flex: 1,
              padding: '0.5rem 0.3rem',
              borderRadius: '6px',
              border: `2px solid ${activeStep === i ? step.color : '#E5DFD3'}`,
              background: activeStep === i ? `${step.color}15` : '#F0EBE1',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              minWidth: '60px',
            }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.15rem' }}>{step.icon}</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 600, color: activeStep === i ? step.color : '#7A8B7C', lineHeight: 1.2 }}>
                {step.label}
              </div>
            </button>
            {i < PIPELINE_STEPS.length - 1 && (
              <div style={{ color: '#E5DFD3', fontSize: '0.8rem', padding: '0 1px', flexShrink: 0 }}>
                {'\u{25B6}'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step detail card */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>{currentStep.icon}</span>
          <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1rem', fontWeight: 600, color: currentStep.color }}>
            Step {activeStep + 1}: {currentStep.label}
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#5A6B5C', margin: '0 0 0.5rem 0', lineHeight: 1.6 }}>
          {currentStep.description}
        </p>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#2C3E2D', background: '#FDFBF7', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #E5DFD3' }}>
          {currentStep.detail(batchSize, seqLen, trainingStep)}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#7A8B7C' }}>Pipeline progress</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#C76B4A' }}>{activeStep + 1}/{PIPELINE_STEPS.length}</span>
        </div>
        <div style={{ height: '6px', background: '#E5DFD3', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((activeStep + 1) / PIPELINE_STEPS.length) * 100}%`, background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Tokens/Batch</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#C76B4A' }}>{(batchSize * seqLen).toLocaleString()}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Total Processed</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#3D5240' }}>{tokensProcessed >= 1e9 ? `${(tokensProcessed / 1e9).toFixed(1)}B` : `${(tokensProcessed / 1e6).toFixed(0)}M`}</div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Progress</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', fontWeight: 600, color: '#D4A843' }}>{(trainingStep / 1000).toFixed(1)}K steps</div>
        </div>
      </div>

      <div style={{ padding: '0.6rem 1rem', background: '#3D524010', borderRadius: '6px', fontSize: '0.78rem', color: '#5A6B5C' }}>
        <strong>Training loop:</strong> Each iteration processes {(batchSize * seqLen).toLocaleString()} tokens. At step {trainingStep.toLocaleString()}, roughly {tokensProcessed >= 1e9 ? `${(tokensProcessed / 1e9).toFixed(1)}B` : `${(tokensProcessed / 1e6).toFixed(0)}M`} tokens have been seen. Modern LLMs train for 1-15 trillion tokens across millions of steps.
      </div>
    </div>
  );
}
