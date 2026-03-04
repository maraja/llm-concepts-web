import { useState, useMemo } from 'react';

const baseStyle = {
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  background: '#FDFBF7',
  border: '1px solid #E5DFD3',
  borderRadius: '14px',
  padding: '2rem',
  margin: '2.5rem 0',
};

export default function TensorSplitVisualizer() {
  const [tpDegree, setTpDegree] = useState(4);
  const [splitMode, setSplitMode] = useState<'column' | 'row'>('column');
  const [step, setStep] = useState(0);

  const matrixDim = 8; // visual matrix dimension

  const data = useMemo(() => {
    const colsPerGPU = matrixDim / tpDegree;
    const rowsPerGPU = matrixDim / tpDegree;

    // Column split: W is split along columns, each GPU gets W_i of shape [H, H/N]
    // Input X (shape [seq, H]) is replicated to all GPUs
    // Each GPU computes Y_i = X @ W_i, getting shape [seq, H/N]
    // All-gather to concatenate Y_i into full Y of shape [seq, H]

    // Row split: W is split along rows, each GPU gets W_i of shape [H/N, H]
    // Input X is split along last dim: X_i of shape [seq, H/N]
    // Each GPU computes Y_i = X_i @ W_i, getting shape [seq, H]
    // All-reduce to sum partial results Y_i into full Y

    const gpuColors = ['#C76B4A', '#D4A843', '#8BA888', '#5B8DB8', '#9B7DB8', '#D48A9B', '#6BAAAA', '#B8965B'];

    // Create matrix coloring: which cells belong to which GPU
    const matrixCells = Array.from({ length: matrixDim }, (_, row) =>
      Array.from({ length: matrixDim }, (_, col) => {
        if (splitMode === 'column') {
          const gpuIdx = Math.floor(col / colsPerGPU);
          return { row, col, gpu: Math.min(gpuIdx, tpDegree - 1), color: gpuColors[Math.min(gpuIdx, tpDegree - 1)] };
        } else {
          const gpuIdx = Math.floor(row / rowsPerGPU);
          return { row, col, gpu: Math.min(gpuIdx, tpDegree - 1), color: gpuColors[Math.min(gpuIdx, tpDegree - 1)] };
        }
      })
    );

    return { colsPerGPU, rowsPerGPU, gpuColors, matrixCells };
  }, [tpDegree, splitMode]);

  const stepLabels = splitMode === 'column'
    ? ['Input Replicated', 'Split Computation', 'All-Gather Output']
    : ['Input Split', 'Partial Computation', 'All-Reduce Sum'];

  const stepDescriptions = splitMode === 'column'
    ? [
        `Input X is replicated to all ${tpDegree} GPUs. Each GPU holds the full input.`,
        `Each GPU computes Y_i = X * W_i where W_i has ${data.colsPerGPU} columns. Output is [seq, H/${tpDegree}].`,
        `Outputs are concatenated via all-gather to form the full [seq, H] result.`,
      ]
    : [
        `Input X is split along the hidden dimension. Each GPU gets ${data.rowsPerGPU} features.`,
        `Each GPU computes partial result Y_i = X_i * W_i. Each partial has full output dimension.`,
        `Partial results are summed via all-reduce to get the final output.`,
      ];

  return (
    <div style={baseStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(139, 168, 136, 0.15)', fontSize: '12px' }}>▶</span>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#6E8B6B' }}>Interactive</span>
        </div>
        <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#2C3E2D', margin: 0 }}>
          Tensor Split Visualizer
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#5A6B5C', margin: '0.4rem 0 0 0', lineHeight: 1.6 }}>
          See how a weight matrix is partitioned across GPUs for tensor parallelism. Compare column-split vs row-split strategies.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Tensor Parallel Degree</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{tpDegree}</span>
          </div>
          <input type="range" min={2} max={8} step={1} value={tpDegree}
            onChange={e => setTpDegree(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2C3E2D' }}>Step</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: '#C76B4A', fontWeight: 600 }}>{stepLabels[step]}</span>
          </div>
          <input type="range" min={0} max={2} step={1} value={step}
            onChange={e => setStep(Number(e.target.value))}
            style={{ width: '100%', height: '6px', appearance: 'none', WebkitAppearance: 'none', background: 'linear-gradient(to right, #8BA888, #C76B4A)', borderRadius: '3px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Split mode toggle */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
        {(['column', 'row'] as const).map(mode => (
          <button key={mode} onClick={() => { setSplitMode(mode); setStep(0); }} style={{
            padding: '0.35rem 0.8rem', borderRadius: '5px',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem',
            border: `1px solid ${splitMode === mode ? '#C76B4A' : '#E5DFD3'}`,
            background: splitMode === mode ? 'rgba(199, 107, 74, 0.08)' : 'transparent',
            color: splitMode === mode ? '#C76B4A' : '#5A6B5C',
            fontWeight: splitMode === mode ? 600 : 400,
            cursor: 'pointer',
          }}>
            {mode === 'column' ? 'Column Split' : 'Row Split'}
          </button>
        ))}
      </div>

      {/* Step description */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', fontWeight: 600, marginBottom: '0.25rem' }}>
          STEP {step + 1}: {stepLabels[step].toUpperCase()}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.5 }}>
          {stepDescriptions[step]}
        </div>
      </div>

      {/* Matrix visualization */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Input */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#7A8B7C', fontWeight: 600, marginBottom: '0.3rem' }}>
              Input X
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${matrixDim}, 1fr)`, gap: '1px' }}>
              {Array.from({ length: 4 }, (_, row) =>
                Array.from({ length: matrixDim }, (_, col) => {
                  let cellColor = '#8BA888';
                  if (splitMode === 'row' && step >= 0) {
                    const gpuIdx = Math.min(Math.floor(col / data.colsPerGPU), tpDegree - 1);
                    cellColor = data.gpuColors[gpuIdx];
                  }
                  return (
                    <div key={`${row}-${col}`} style={{
                      width: '12px', height: '12px',
                      background: splitMode === 'column' || step === 0 ? '#8BA888' : cellColor,
                      borderRadius: '1px',
                      opacity: 0.8,
                      transition: 'all 0.2s ease',
                    }} />
                  );
                })
              )}
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
              [{4}, {matrixDim}]
            </div>
          </div>

          <span style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>{'\u00D7'}</span>

          {/* Weight matrix W */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#7A8B7C', fontWeight: 600, marginBottom: '0.3rem' }}>
              Weight W ({splitMode} split)
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${matrixDim}, 1fr)`, gap: '1px' }}>
              {data.matrixCells.flat().map((cell, idx) => (
                <div key={idx} style={{
                  width: '12px', height: '12px',
                  background: cell.color,
                  borderRadius: '1px',
                  opacity: 0.85,
                  transition: 'all 0.2s ease',
                }} />
              ))}
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
              [{matrixDim}, {matrixDim}]
            </div>
          </div>

          <span style={{ fontSize: '1.2rem', color: '#7A8B7C' }}>=</span>

          {/* Output */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#7A8B7C', fontWeight: 600, marginBottom: '0.3rem' }}>
              Output Y
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${splitMode === 'column' && step < 2 ? matrixDim / tpDegree : matrixDim}, 1fr)`, gap: '1px' }}>
              {Array.from({ length: 4 }, (_, row) =>
                Array.from({ length: splitMode === 'column' && step < 2 ? matrixDim / tpDegree : matrixDim }, (_, col) => {
                  let cellColor: string;
                  if (step === 2) {
                    cellColor = '#8BA888';
                  } else if (splitMode === 'column') {
                    cellColor = data.gpuColors[0]; // showing GPU 0's partial output
                  } else {
                    cellColor = data.gpuColors[0];
                  }
                  return (
                    <div key={`${row}-${col}`} style={{
                      width: '12px', height: '12px',
                      background: step === 2 ? '#8BA888' : cellColor,
                      borderRadius: '1px',
                      opacity: step === 0 ? 0.3 : 0.8,
                      transition: 'all 0.2s ease',
                    }} />
                  );
                })
              )}
            </div>
            <div style={{ fontSize: '0.5rem', color: '#7A8B7C', marginTop: '0.2rem' }}>
              {step === 2
                ? `[4, ${matrixDim}]`
                : splitMode === 'column'
                  ? `[4, ${matrixDim / tpDegree}] per GPU`
                  : `[4, ${matrixDim}] partial`
              }
            </div>
          </div>
        </div>
      </div>

      {/* GPU shard assignment */}
      <div style={{ background: '#F0EBE1', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#7A8B7C', marginBottom: '0.5rem', fontWeight: 600 }}>
          GPU SHARD ASSIGNMENT ({splitMode.toUpperCase()} PARTITION)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(tpDegree, 4)}, 1fr)`, gap: '0.5rem' }}>
          {Array.from({ length: tpDegree }, (_, i) => (
            <div key={i} style={{
              background: '#FDFBF7', borderRadius: '6px', padding: '0.5rem',
              borderLeft: `3px solid ${data.gpuColors[i]}`,
            }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: data.gpuColors[i], marginBottom: '0.2rem' }}>
                GPU {i}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: '#2C3E2D' }}>
                {splitMode === 'column'
                  ? `W[:, ${i * data.colsPerGPU}:${(i + 1) * data.colsPerGPU}]`
                  : `W[${i * data.rowsPerGPU}:${(i + 1) * data.rowsPerGPU}, :]`
                }
              </div>
              <div style={{ fontSize: '0.5rem', color: '#7A8B7C', marginTop: '0.15rem' }}>
                {splitMode === 'column'
                  ? `Shape: [${matrixDim}, ${data.colsPerGPU}]`
                  : `Shape: [${data.rowsPerGPU}, ${matrixDim}]`
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Params / GPU</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#C76B4A' }}>
            1/{tpDegree}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Comm Type</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#D4A843' }}>
            {splitMode === 'column' ? 'all-gather' : 'all-reduce'}
          </div>
        </div>
        <div style={{ padding: '0.6rem', background: '#F0EBE1', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', color: '#7A8B7C', textTransform: 'uppercase', fontWeight: 600 }}>Comm / Layer</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 600, color: '#8BA888' }}>
            {splitMode === 'column' ? '1' : '2'}x
          </div>
          <div style={{ fontSize: '0.5rem', color: '#7A8B7C' }}>
            {splitMode === 'column' ? 'fwd only' : 'fwd + bwd'}
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{ padding: '0.75rem 1rem', background: 'rgba(199, 107, 74, 0.06)', borderRadius: '8px', borderLeft: '3px solid #C76B4A' }}>
        <div style={{ fontSize: '0.78rem', color: '#2C3E2D', lineHeight: 1.6 }}>
          {splitMode === 'column'
            ? `Column splitting partitions W along columns. Each GPU computes a slice of the output, then an all-gather merges them. In Megatron-LM, the first linear in the MLP uses column splitting so each GPU gets a portion of the intermediate activations.`
            : `Row splitting partitions W along rows, requiring the input to be split. Each GPU computes a partial sum, then an all-reduce combines them. The second linear in the MLP uses row splitting to reduce communication -- it pairs naturally with the preceding column split.`}
        </div>
      </div>
    </div>
  );
}
