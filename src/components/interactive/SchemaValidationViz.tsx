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

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
}

const schema: SchemaField[] = [
  { name: 'name', type: 'string', required: true },
  { name: 'age', type: 'number', required: true },
  { name: 'email', type: 'string', required: true },
  { name: 'role', type: 'string', required: false },
  { name: 'active', type: 'boolean', required: true },
];

const generationSteps = [
  { token: '{', fields: [] as string[], valid: true },
  { token: '"name":', fields: [] as string[], valid: true },
  { token: '"Alice"', fields: ['name'], valid: true },
  { token: '"age":', fields: ['name'], valid: true },
  { token: '28', fields: ['name', 'age'], valid: true },
  { token: '"email":', fields: ['name', 'age'], valid: true },
  { token: '"alice@example.com"', fields: ['name', 'age', 'email'], valid: true },
  { token: '"role":', fields: ['name', 'age', 'email'], valid: true },
  { token: '"engineer"', fields: ['name', 'age', 'email', 'role'], valid: true },
  { token: '"active":', fields: ['name', 'age', 'email', 'role'], valid: true },
  { token: 'true', fields: ['name', 'age', 'email', 'role', 'active'], valid: true },
  { token: '}', fields: ['name', 'age', 'email', 'role', 'active'], valid: true },
];

const badSteps = [
  { token: '{', fields: [] as string[], valid: true },
  { token: '"name":', fields: [] as string[], valid: true },
  { token: '"Bob"', fields: ['name'], valid: true },
  { token: '"age":', fields: ['name'], valid: true },
  { token: '"twenty"', fields: ['name'], valid: false, error: 'Type error: expected number, got string' },
  { token: '"email":', fields: ['name'], valid: true },
  { token: '"bob@test.com"', fields: ['name', 'email'], valid: true },
  { token: '}', fields: ['name', 'email'], valid: false, error: 'Missing required: age (type error), active' },
];

export default function SchemaValidationViz() {
  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState<'valid' | 'invalid'>('valid');

  const steps = scenario === 'valid' ? generationSteps : badSteps;
  const current = steps[Math.min(step, steps.length - 1)];
  const completedFields = current.fields;
  const requiredFields = schema.filter(f => f.required).map(f => f.name);
  const missingRequired = requiredFields.filter(f => !completedFields.includes(f));
  const isComplete = step >= steps.length - 1;
  const allValid = scenario === 'valid' && isComplete && missingRequired.length === 0;

  const outputSoFar = steps.slice(0, step + 1).map(s => s.token).join(' ')
    .replace(/ "/g, ' "').replace(/ ,/g, ',').replace(/ }/g, '\n}')
    .replace(/"name": /g, '\n  "name": ').replace(/"age": /g, ',\n  "age": ')
    .replace(/"email": /g, ',\n  "email": ').replace(/"role": /g, ',\n  "role": ')
    .replace(/"active": /g, ',\n  "active": ');

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={labelStyle}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Schema Validation Visualizer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          Watch how a JSON schema constrains token-by-token generation. Required fields must be present and correctly typed.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['valid', 'invalid'] as const).map(s => (
          <button key={s} onClick={() => { setScenario(s); setStep(0); }} style={{
            padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer',
            border: `1px solid ${scenario === s ? '#C76B4A' : '#E5DFD3'}`,
            background: scenario === s ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: scenario === s ? '#C76B4A' : '#5A6B5C', fontWeight: scenario === s ? 600 : 400,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}>{s === 'valid' ? 'Valid Output' : 'Invalid Output'}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Schema Fields</div>
          {schema.map(field => {
            const completed = completedFields.includes(field.name);
            const isMissing = isComplete && field.required && !completed;
            return (
              <div key={field.name} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem',
                marginBottom: '0.3rem', borderRadius: '6px', transition: 'all 0.2s ease',
                background: isMissing ? 'rgba(199, 107, 74, 0.08)' : completed ? 'rgba(139, 168, 136, 0.08)' : '#F5F0E8',
                border: `1px solid ${isMissing ? '#C76B4A44' : completed ? '#8BA88844' : '#E5DFD3'}`,
              }}>
                <span style={{ fontSize: '0.9rem', width: '18px', textAlign: 'center' }}>
                  {completed ? '✓' : isMissing ? '✗' : '○'}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#2C3E2D', fontWeight: 500 }}>{field.name}</span>
                <span style={{ fontSize: '0.7rem', color: '#B0A898', marginLeft: 'auto' }}>{field.type}</span>
                {field.required && <span style={{ fontSize: '0.6rem', color: '#C76B4A', fontWeight: 700, background: 'rgba(199,107,74,0.1)', padding: '1px 4px', borderRadius: '3px' }}>REQ</span>}
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Generated Output</div>
          <div style={{ background: '#2C3E2D', borderRadius: '8px', padding: '0.8rem', minHeight: '160px' }}>
            <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#F5F0E8', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>{outputSoFar}<span style={{ background: '#D4A843', color: '#2C3E2D', padding: '0 2px', borderRadius: '2px' }}>|</span></pre>
          </div>
          {!current.valid && 'error' in current && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.7rem', background: 'rgba(199, 107, 74, 0.08)', border: '1px solid #C76B4A44', borderRadius: '6px', fontSize: '0.78rem', color: '#C76B4A' }}>
              {(current as { error: string }).error}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: step === 0 ? 'not-allowed' : 'pointer',
          border: '1px solid #E5DFD3', background: 'transparent', color: step === 0 ? '#B0A898' : '#5A6B5C',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Back</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={isComplete} style={{
          padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', cursor: isComplete ? 'not-allowed' : 'pointer',
          border: '1px solid #C76B4A', background: isComplete ? '#E5DFD3' : 'rgba(199, 107, 74, 0.08)', color: isComplete ? '#B0A898' : '#C76B4A',
          fontWeight: 600, fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}>Next Token</button>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#7A8B7C' }}>
          Step {step + 1} / {steps.length}
        </span>
        {isComplete && (
          <span style={{
            marginLeft: 'auto', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
            background: allValid ? 'rgba(139, 168, 136, 0.15)' : 'rgba(199, 107, 74, 0.1)',
            color: allValid ? '#8BA888' : '#C76B4A',
          }}>{allValid ? 'Schema Valid' : 'Validation Failed'}</span>
        )}
      </div>
    </div>
  );
}
