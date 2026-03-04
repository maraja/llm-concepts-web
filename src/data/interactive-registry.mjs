/**
 * Registry mapping concept slugs to their interactive elements.
 *
 * Each entry specifies:
 *   - component: the React component name (must match the hydrator's component map)
 *   - afterSection: the h2 heading text after which the element is injected
 *
 * Components are placed at roughly 1/3 and 2/3 through each article by targeting
 * the "How It Works" section (~1/3) and "Key Technical Details" section (~2/3).
 */
export const interactiveRegistry = {
  'transformer-architecture': [
    { component: 'TransformerLayerBuilder', afterSection: 'How It Works' },
    { component: 'TransformerScaleExplorer', afterSection: 'Key Technical Details' },
  ],
  'self-attention': [
    { component: 'SelfAttentionWalkthrough', afterSection: 'How It Works' },
    { component: 'AttentionPatternVisualizer', afterSection: 'Key Technical Details' },
  ],
  'multi-head-attention': [
    { component: 'MultiHeadSplitVisualizer', afterSection: 'How It Works' },
    { component: 'HeadSpecializationDemo', afterSection: 'Key Technical Details' },
  ],
  'causal-attention': [
    { component: 'CausalMaskVisualizer', afterSection: 'How It Works' },
    { component: 'CausalVsBidirectional', afterSection: 'Key Technical Details' },
  ],
  'grouped-query-attention': [
    { component: 'GQAGroupingVisualizer', afterSection: 'How It Works' },
    { component: 'GQAMemoryCalculator', afterSection: 'Key Technical Details' },
  ],
  'sliding-window-attention': [
    { component: 'SlidingWindowVisualizer', afterSection: 'How It Works' },
    { component: 'WindowSizeExplorer', afterSection: 'Key Technical Details' },
  ],
  'sparse-attention': [
    { component: 'SparsePatternVisualizer', afterSection: 'How It Works' },
    { component: 'SparseVsDenseComparison', afterSection: 'Key Technical Details' },
  ],
  'attention-sinks': [
    { component: 'AttentionSinkHeatmap', afterSection: 'How It Works' },
    { component: 'StreamingLLMDemo', afterSection: 'Key Technical Details' },
  ],
  'differential-transformer': [
    { component: 'DifferentialAttentionVisualizer', afterSection: 'How It Works' },
    { component: 'NoiseReductionDemo', afterSection: 'Key Technical Details' },
  ],
  'feed-forward-networks': [
    { component: 'FFNNeuronActivation', afterSection: 'How It Works' },
    { component: 'FFNBottleneckExplorer', afterSection: 'Key Technical Details' },
  ],
  'activation-functions': [
    { component: 'ActivationFunctionGrapher', afterSection: 'How It Works' },
    { component: 'ActivationComparison', afterSection: 'Key Technical Details' },
  ],
  'residual-connections': [
    { component: 'ResidualFlowVisualizer', afterSection: 'How It Works' },
    { component: 'GradientFlowDemo', afterSection: 'Key Technical Details' },
  ],
  'layer-normalization': [
    { component: 'LayerNormVisualizer', afterSection: 'How It Works' },
    { component: 'NormalizationComparison', afterSection: 'Key Technical Details' },
  ],
  'logits-and-softmax': [
    { component: 'SoftmaxTemperature', afterSection: 'How It Works' },
    { component: 'TopKTopPExplorer', afterSection: 'Key Technical Details' },
  ],
  'encoder-decoder-architecture': [
    { component: 'ArchitectureComparison', afterSection: 'How They Work' },
    { component: 'CrossAttentionFlow', afterSection: 'Key Technical Details' },
  ],
  'autoregressive-generation': [
    { component: 'AutoregressiveStepThrough', afterSection: 'How It Works' },
    { component: 'GenerationSpeedCalculator', afterSection: 'Key Technical Details' },
  ],
  'next-token-prediction': [
    { component: 'NextTokenPredictor', afterSection: 'How It Works' },
    { component: 'LossLandscapeExplorer', afterSection: 'Key Technical Details' },
  ],
  'mixture-of-experts': [
    { component: 'MoERoutingVisualizer', afterSection: 'How It Works' },
    { component: 'MoEEfficiencyCalculator', afterSection: 'Key Technical Details' },
  ],
  'mixture-of-depths': [
    { component: 'MoDTokenRouting', afterSection: 'How It Works' },
    { component: 'ComputeBudgetExplorer', afterSection: 'Key Technical Details' },
  ],
  'byte-latent-transformers': [
    { component: 'ByteVsTokenVisualizer', afterSection: 'How It Works' },
    { component: 'PatchingStrategyDemo', afterSection: 'Key Technical Details' },
  ],

  // === Module 02: Input Representation ===
  'tokenization': [
    { component: 'TokenizationPlayground', afterSection: 'How It Works' },
    { component: 'TokenBoundaryExplorer', afterSection: 'Key Technical Details' },
  ],
  'byte-pair-encoding': [
    { component: 'BPEMergeVisualizer', afterSection: 'How It Works' },
    { component: 'BPEVsWordPiece', afterSection: 'Key Technical Details' },
  ],
  'vocabulary-design': [
    { component: 'VocabSizeTradeoff', afterSection: 'How It Works' },
    { component: 'MultilingualTokenCost', afterSection: 'Key Technical Details' },
  ],
  'special-tokens': [
    { component: 'SpecialTokenMap', afterSection: 'How It Works' },
    { component: 'SpecialTokenQuiz', afterSection: 'Key Technical Details' },
  ],
  'token-embeddings': [
    { component: 'EmbeddingSpaceVisualizer', afterSection: 'How It Works' },
    { component: 'EmbeddingDimExplorer', afterSection: 'Key Technical Details' },
  ],
  'positional-encoding': [
    { component: 'SinusoidalPositionDemo', afterSection: 'How It Works' },
    { component: 'PositionalEncodingComparison', afterSection: 'Key Technical Details' },
  ],
  'rotary-position-embedding': [
    { component: 'RoPERotationVisualizer', afterSection: 'How It Works' },
    { component: 'RoPEFrequencySpectrum', afterSection: 'Key Technical Details' },
  ],
  'alibi': [
    { component: 'ALiBiSlopeVisualizer', afterSection: 'How It Works' },
    { component: 'ALiBiExtrapolationDemo', afterSection: 'Key Technical Details' },
  ],
  'context-window': [
    { component: 'ContextWindowTimeline', afterSection: 'How It Works' },
    { component: 'ContextMemoryCalculator', afterSection: 'Key Technical Details' },
  ],

  // === Module 03: Training Fundamentals ===
  'cross-entropy-loss': [
    { component: 'CrossEntropyVisualizer', afterSection: 'How It Works' },
    { component: 'PerplexityComparison', afterSection: 'Key Technical Details' },
  ],
  'backpropagation': [
    { component: 'BackpropChainRule', afterSection: 'How It Works' },
    { component: 'GradientDescentSteps', afterSection: 'Key Technical Details' },
  ],
  'adam-optimizer': [
    { component: 'AdamMomentumVisualizer', afterSection: 'How It Works' },
    { component: 'OptimizerMemoryCalculator', afterSection: 'Key Technical Details' },
  ],
  'learning-rate-scheduling': [
    { component: 'LRScheduleVisualizer', afterSection: 'How It Works' },
    { component: 'WarmupEffectDemo', afterSection: 'Key Technical Details' },
  ],
  'gradient-clipping': [
    { component: 'GradientClippingDemo', afterSection: 'Gradient Clipping' },
    { component: 'GradientAccumulationCalc', afterSection: 'Gradient Accumulation' },
  ],
  'mixed-precision-training': [
    { component: 'PrecisionFormatExplorer', afterSection: 'How It Works' },
    { component: 'MixedPrecisionMemory', afterSection: 'Key Technical Details' },
  ],
  'gradient-checkpointing': [
    { component: 'CheckpointMemoryTradeoff', afterSection: 'How It Works' },
    { component: 'ActivationMemoryVisualizer', afterSection: 'Key Technical Details' },
  ],
  'pre-training': [
    { component: 'PreTrainingPipeline', afterSection: 'How It Works' },
    { component: 'TrainingCostEstimator', afterSection: 'Key Technical Details' },
  ],
  'training-data-curation': [
    { component: 'DataQualityFilter', afterSection: 'How It Works' },
    { component: 'DatasetCompositionViz', afterSection: 'Key Technical Details' },
  ],
  'data-mixing': [
    { component: 'DataMixingRatios', afterSection: 'How It Works' },
    { component: 'DomainWeightImpact', afterSection: 'Key Technical Details' },
  ],
  'curriculum-learning': [
    { component: 'CurriculumScheduleDemo', afterSection: 'How It Works' },
    { component: 'DifficultyMetricsExplorer', afterSection: 'Key Technical Details' },
  ],
  'scaling-laws': [
    { component: 'ScalingLawCalculator', afterSection: 'How It Works' },
    { component: 'ComputeOptimalPlot', afterSection: 'Key Technical Details' },
  ],
  'emergent-abilities': [
    { component: 'EmergentAbilitiesTimeline', afterSection: 'How It Works' },
    { component: 'EmergenceDebateExplorer', afterSection: 'Key Technical Details' },
  ],
  'grokking': [
    { component: 'GrokkingPhaseDemo', afterSection: 'How It Works' },
    { component: 'MemorizationVsGeneralization', afterSection: 'Key Technical Details' },
  ],
  'model-collapse': [
    { component: 'ModelCollapseSimulator', afterSection: 'How It Works' },
    { component: 'SyntheticDataMixCalc', afterSection: 'Key Technical Details' },
  ],
  'catastrophic-forgetting': [
    { component: 'ForgettingCurveDemo', afterSection: 'How It Works' },
    { component: 'ParameterInterferenceViz', afterSection: 'Key Technical Details' },
  ],
  'self-play-and-self-improvement': [
    { component: 'SelfPlayLoopViz', afterSection: 'How It Works' },
    { component: 'BootstrapAccuracyTracker', afterSection: 'Key Technical Details' },
  ],

  // === Module 04: Distributed Training ===
  'data-parallelism': [
    { component: 'AllReduceVisualizer', afterSection: 'How It Works' },
    { component: 'DDPScalingCalculator', afterSection: 'Key Technical Details' },
  ],
  'tensor-parallelism': [
    { component: 'TensorSplitVisualizer', afterSection: 'How It Works' },
    { component: 'TensorParallelComm', afterSection: 'Key Technical Details' },
  ],
  'pipeline-parallelism': [
    { component: 'PipelineBubbleDemo', afterSection: 'How It Works' },
    { component: 'PipelineStageAssigner', afterSection: 'Key Technical Details' },
  ],
  'zero-and-fsdp': [
    { component: 'ZeROStageCompare', afterSection: 'How It Works' },
    { component: 'FSDPShardingViz', afterSection: 'Key Technical Details' },
  ],
  '3d-parallelism': [
    { component: 'ParallelismDimensionMap', afterSection: 'How It Works' },
    { component: 'TrainingConfigCalculator', afterSection: 'Key Technical Details' },
  ],
  'expert-parallelism': [
    { component: 'ExpertRoutingVisualizer', afterSection: 'How It Works' },
    { component: 'ExpertLoadBalancer', afterSection: 'Key Technical Details' },
  ],
  'ring-attention': [
    { component: 'RingAttentionVisualizer', afterSection: 'How It Works' },
    { component: 'ContextScalingCalculator', afterSection: 'Key Technical Details' },
  ],
};
