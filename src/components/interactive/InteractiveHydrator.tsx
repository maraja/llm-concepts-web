import { useEffect, useState, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

// Lazy-load all interactive components
const components: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // Transformer Architecture
  TransformerLayerBuilder: lazy(() => import('./TransformerLayerBuilder')),
  TransformerScaleExplorer: lazy(() => import('./TransformerScaleExplorer')),
  // Self-Attention
  SelfAttentionWalkthrough: lazy(() => import('./SelfAttentionWalkthrough')),
  AttentionPatternVisualizer: lazy(() => import('./AttentionPatternVisualizer')),
  // Multi-Head Attention
  MultiHeadSplitVisualizer: lazy(() => import('./MultiHeadSplitVisualizer')),
  HeadSpecializationDemo: lazy(() => import('./HeadSpecializationDemo')),
  // Causal Attention
  CausalMaskVisualizer: lazy(() => import('./CausalMaskVisualizer')),
  CausalVsBidirectional: lazy(() => import('./CausalVsBidirectional')),
  // Grouped Query Attention
  GQAGroupingVisualizer: lazy(() => import('./GQAGroupingVisualizer')),
  GQAMemoryCalculator: lazy(() => import('./GQAMemoryCalculator')),
  // Sliding Window Attention
  SlidingWindowVisualizer: lazy(() => import('./SlidingWindowVisualizer')),
  WindowSizeExplorer: lazy(() => import('./WindowSizeExplorer')),
  // Sparse Attention
  SparsePatternVisualizer: lazy(() => import('./SparsePatternVisualizer')),
  SparseVsDenseComparison: lazy(() => import('./SparseVsDenseComparison')),
  // Attention Sinks
  AttentionSinkHeatmap: lazy(() => import('./AttentionSinkHeatmap')),
  StreamingLLMDemo: lazy(() => import('./StreamingLLMDemo')),
  // Differential Transformer
  DifferentialAttentionVisualizer: lazy(() => import('./DifferentialAttentionVisualizer')),
  NoiseReductionDemo: lazy(() => import('./NoiseReductionDemo')),
  // Feed-Forward Networks
  FFNNeuronActivation: lazy(() => import('./FFNNeuronActivation')),
  FFNBottleneckExplorer: lazy(() => import('./FFNBottleneckExplorer')),
  // Activation Functions
  ActivationFunctionGrapher: lazy(() => import('./ActivationFunctionGrapher')),
  ActivationComparison: lazy(() => import('./ActivationComparison')),
  // Residual Connections
  ResidualFlowVisualizer: lazy(() => import('./ResidualFlowVisualizer')),
  GradientFlowDemo: lazy(() => import('./GradientFlowDemo')),
  // Layer Normalization
  LayerNormVisualizer: lazy(() => import('./LayerNormVisualizer')),
  NormalizationComparison: lazy(() => import('./NormalizationComparison')),
  // Logits & Softmax
  SoftmaxTemperature: lazy(() => import('./SoftmaxTemperature')),
  TopKTopPExplorer: lazy(() => import('./TopKTopPExplorer')),
  // Encoder-Decoder
  ArchitectureComparison: lazy(() => import('./ArchitectureComparison')),
  CrossAttentionFlow: lazy(() => import('./CrossAttentionFlow')),
  // Autoregressive Generation
  AutoregressiveStepThrough: lazy(() => import('./AutoregressiveStepThrough')),
  GenerationSpeedCalculator: lazy(() => import('./GenerationSpeedCalculator')),
  // Next-Token Prediction
  NextTokenPredictor: lazy(() => import('./NextTokenPredictor')),
  LossLandscapeExplorer: lazy(() => import('./LossLandscapeExplorer')),
  // Mixture of Experts
  MoERoutingVisualizer: lazy(() => import('./MoERoutingVisualizer')),
  MoEEfficiencyCalculator: lazy(() => import('./MoEEfficiencyCalculator')),
  // Mixture of Depths
  MoDTokenRouting: lazy(() => import('./MoDTokenRouting')),
  ComputeBudgetExplorer: lazy(() => import('./ComputeBudgetExplorer')),
  // Byte Latent Transformers
  ByteVsTokenVisualizer: lazy(() => import('./ByteVsTokenVisualizer')),
  PatchingStrategyDemo: lazy(() => import('./PatchingStrategyDemo')),

  // === Module 02: Input Representation ===
  // Tokenization
  TokenizationPlayground: lazy(() => import('./TokenizationPlayground')),
  TokenBoundaryExplorer: lazy(() => import('./TokenBoundaryExplorer')),
  // Byte-Pair Encoding
  BPEMergeVisualizer: lazy(() => import('./BPEMergeVisualizer')),
  BPEVsWordPiece: lazy(() => import('./BPEVsWordPiece')),
  // Vocabulary Design
  VocabSizeTradeoff: lazy(() => import('./VocabSizeTradeoff')),
  MultilingualTokenCost: lazy(() => import('./MultilingualTokenCost')),
  // Special Tokens
  SpecialTokenMap: lazy(() => import('./SpecialTokenMap')),
  SpecialTokenQuiz: lazy(() => import('./SpecialTokenQuiz')),
  // Token Embeddings
  EmbeddingSpaceVisualizer: lazy(() => import('./EmbeddingSpaceVisualizer')),
  EmbeddingDimExplorer: lazy(() => import('./EmbeddingDimExplorer')),
  // Positional Encoding
  SinusoidalPositionDemo: lazy(() => import('./SinusoidalPositionDemo')),
  PositionalEncodingComparison: lazy(() => import('./PositionalEncodingComparison')),
  // RoPE
  RoPERotationVisualizer: lazy(() => import('./RoPERotationVisualizer')),
  RoPEFrequencySpectrum: lazy(() => import('./RoPEFrequencySpectrum')),
  // ALiBi
  ALiBiSlopeVisualizer: lazy(() => import('./ALiBiSlopeVisualizer')),
  ALiBiExtrapolationDemo: lazy(() => import('./ALiBiExtrapolationDemo')),
  // Context Window
  ContextWindowTimeline: lazy(() => import('./ContextWindowTimeline')),
  ContextMemoryCalculator: lazy(() => import('./ContextMemoryCalculator')),

  // === Module 03: Training Fundamentals ===
  // Cross-Entropy Loss
  CrossEntropyVisualizer: lazy(() => import('./CrossEntropyVisualizer')),
  PerplexityComparison: lazy(() => import('./PerplexityComparison')),
  // Backpropagation
  BackpropChainRule: lazy(() => import('./BackpropChainRule')),
  GradientDescentSteps: lazy(() => import('./GradientDescentSteps')),
  // Adam Optimizer
  AdamMomentumVisualizer: lazy(() => import('./AdamMomentumVisualizer')),
  OptimizerMemoryCalculator: lazy(() => import('./OptimizerMemoryCalculator')),
  // Learning Rate Scheduling
  LRScheduleVisualizer: lazy(() => import('./LRScheduleVisualizer')),
  WarmupEffectDemo: lazy(() => import('./WarmupEffectDemo')),
  // Gradient Clipping
  GradientClippingDemo: lazy(() => import('./GradientClippingDemo')),
  GradientAccumulationCalc: lazy(() => import('./GradientAccumulationCalc')),
  // Mixed Precision Training
  PrecisionFormatExplorer: lazy(() => import('./PrecisionFormatExplorer')),
  MixedPrecisionMemory: lazy(() => import('./MixedPrecisionMemory')),
  // Gradient Checkpointing
  CheckpointMemoryTradeoff: lazy(() => import('./CheckpointMemoryTradeoff')),
  ActivationMemoryVisualizer: lazy(() => import('./ActivationMemoryVisualizer')),
  // Pre-Training
  PreTrainingPipeline: lazy(() => import('./PreTrainingPipeline')),
  TrainingCostEstimator: lazy(() => import('./TrainingCostEstimator')),
  // Training Data Curation
  DataQualityFilter: lazy(() => import('./DataQualityFilter')),
  DatasetCompositionViz: lazy(() => import('./DatasetCompositionViz')),
  // Data Mixing
  DataMixingRatios: lazy(() => import('./DataMixingRatios')),
  DomainWeightImpact: lazy(() => import('./DomainWeightImpact')),
  // Curriculum Learning
  CurriculumScheduleDemo: lazy(() => import('./CurriculumScheduleDemo')),
  DifficultyMetricsExplorer: lazy(() => import('./DifficultyMetricsExplorer')),
  // Scaling Laws
  ScalingLawCalculator: lazy(() => import('./ScalingLawCalculator')),
  ComputeOptimalPlot: lazy(() => import('./ComputeOptimalPlot')),
  // Emergent Abilities
  EmergentAbilitiesTimeline: lazy(() => import('./EmergentAbilitiesTimeline')),
  EmergenceDebateExplorer: lazy(() => import('./EmergenceDebateExplorer')),
  // Grokking
  GrokkingPhaseDemo: lazy(() => import('./GrokkingPhaseDemo')),
  MemorizationVsGeneralization: lazy(() => import('./MemorizationVsGeneralization')),
  // Model Collapse
  ModelCollapseSimulator: lazy(() => import('./ModelCollapseSimulator')),
  SyntheticDataMixCalc: lazy(() => import('./SyntheticDataMixCalc')),
  // Catastrophic Forgetting
  ForgettingCurveDemo: lazy(() => import('./ForgettingCurveDemo')),
  ParameterInterferenceViz: lazy(() => import('./ParameterInterferenceViz')),
  // Self-Play and Self-Improvement
  SelfPlayLoopViz: lazy(() => import('./SelfPlayLoopViz')),
  BootstrapAccuracyTracker: lazy(() => import('./BootstrapAccuracyTracker')),

  // === Module 04: Distributed Training ===
  // Data Parallelism
  AllReduceVisualizer: lazy(() => import('./AllReduceVisualizer')),
  DDPScalingCalculator: lazy(() => import('./DDPScalingCalculator')),
  // Tensor Parallelism
  TensorSplitVisualizer: lazy(() => import('./TensorSplitVisualizer')),
  TensorParallelComm: lazy(() => import('./TensorParallelComm')),
  // Pipeline Parallelism
  PipelineBubbleDemo: lazy(() => import('./PipelineBubbleDemo')),
  PipelineStageAssigner: lazy(() => import('./PipelineStageAssigner')),
  // ZeRO & FSDP
  ZeROStageCompare: lazy(() => import('./ZeROStageCompare')),
  FSDPShardingViz: lazy(() => import('./FSDPShardingViz')),
  // 3D Parallelism
  ParallelismDimensionMap: lazy(() => import('./ParallelismDimensionMap')),
  TrainingConfigCalculator: lazy(() => import('./TrainingConfigCalculator')),
  // Expert Parallelism
  ExpertRoutingVisualizer: lazy(() => import('./ExpertRoutingVisualizer')),
  ExpertLoadBalancer: lazy(() => import('./ExpertLoadBalancer')),
  // Ring Attention
  RingAttentionVisualizer: lazy(() => import('./RingAttentionVisualizer')),
  ContextScalingCalculator: lazy(() => import('./ContextScalingCalculator')),
};

function LoadingPlaceholder() {
  return (
    <div style={{
      padding: '2rem',
      margin: '2rem 0',
      background: '#FDFBF7',
      border: '1px solid #E5DFD3',
      borderRadius: '14px',
      textAlign: 'center',
      color: '#7A8B7C',
      fontSize: '0.85rem',
    }}>
      Loading interactive element…
    </div>
  );
}

/**
 * This component is mounted once per concept page (client:load).
 * It scans the DOM for .interactive-slot markers injected by the
 * rehype-interactive-markers plugin and mounts the corresponding
 * React component into each one.
 */
export default function InteractiveHydrator() {
  useEffect(() => {
    const slots = document.querySelectorAll('.interactive-slot[data-interactive]');

    const roots: ReturnType<typeof createRoot>[] = [];

    slots.forEach((slot) => {
      const componentName = slot.getAttribute('data-interactive');
      if (!componentName || !components[componentName]) return;

      const Component = components[componentName];
      const root = createRoot(slot);
      roots.push(root);

      root.render(
        <Suspense fallback={<LoadingPlaceholder />}>
          <Component />
        </Suspense>
      );
    });

    return () => {
      roots.forEach(root => root.unmount());
    };
  }, []);

  return null; // This component renders nothing itself
}
