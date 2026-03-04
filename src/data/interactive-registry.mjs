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
      { component: 'QuizTransformerArchitecture', afterSection: 'Common Misconceptions' },
  ],
  'self-attention': [
    { component: 'SelfAttentionWalkthrough', afterSection: 'How It Works' },
    { component: 'AttentionPatternVisualizer', afterSection: 'Key Technical Details' },
      { component: 'QuizSelfAttention', afterSection: 'Common Misconceptions' },
  ],
  'multi-head-attention': [
    { component: 'MultiHeadSplitVisualizer', afterSection: 'How It Works' },
    { component: 'HeadSpecializationDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizMultiHeadAttention', afterSection: 'Common Misconceptions' },
  ],
  'causal-attention': [
    { component: 'CausalMaskVisualizer', afterSection: 'How It Works' },
    { component: 'CausalVsBidirectional', afterSection: 'Key Technical Details' },
      { component: 'QuizCausalAttention', afterSection: 'Common Misconceptions' },
  ],
  'grouped-query-attention': [
    { component: 'GQAGroupingVisualizer', afterSection: 'How It Works' },
    { component: 'GQAMemoryCalculator', afterSection: 'Key Technical Details' },
      { component: 'QuizGroupedQueryAttention', afterSection: 'Common Misconceptions' },
  ],
  'sliding-window-attention': [
    { component: 'SlidingWindowVisualizer', afterSection: 'How It Works' },
    { component: 'WindowSizeExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizSlidingWindowAttention', afterSection: 'Common Misconceptions' },
  ],
  'sparse-attention': [
    { component: 'SparsePatternVisualizer', afterSection: 'How It Works' },
    { component: 'SparseVsDenseComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizSparseAttention', afterSection: 'Common Misconceptions' },
  ],
  'attention-sinks': [
    { component: 'AttentionSinkHeatmap', afterSection: 'How It Works' },
    { component: 'StreamingLLMDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizAttentionSinks', afterSection: 'Common Misconceptions' },
  ],
  'differential-transformer': [
    { component: 'DifferentialAttentionVisualizer', afterSection: 'How It Works' },
    { component: 'NoiseReductionDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizDifferentialTransformer', afterSection: 'Common Misconceptions' },
  ],
  'feed-forward-networks': [
    { component: 'FFNNeuronActivation', afterSection: 'How It Works' },
    { component: 'FFNBottleneckExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizFeedForwardNetworks', afterSection: 'Common Misconceptions' },
  ],
  'activation-functions': [
    { component: 'ActivationFunctionGrapher', afterSection: 'How It Works' },
    { component: 'ActivationComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizActivationFunctions', afterSection: 'Common Misconceptions' },
  ],
  'residual-connections': [
    { component: 'ResidualFlowVisualizer', afterSection: 'How It Works' },
    { component: 'GradientFlowDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizResidualConnections', afterSection: 'Common Misconceptions' },
  ],
  'layer-normalization': [
    { component: 'LayerNormVisualizer', afterSection: 'How It Works' },
    { component: 'NormalizationComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizLayerNormalization', afterSection: 'Common Misconceptions' },
  ],
  'logits-and-softmax': [
    { component: 'SoftmaxTemperature', afterSection: 'How It Works' },
    { component: 'TopKTopPExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizLogitsAndSoftmax', afterSection: 'Common Misconceptions' },
  ],
  'encoder-decoder-architecture': [
    { component: 'ArchitectureComparison', afterSection: 'How They Work' },
    { component: 'CrossAttentionFlow', afterSection: 'Key Technical Details' },
      { component: 'QuizEncoderDecoder', afterSection: 'Common Misconceptions' },
  ],
  'autoregressive-generation': [
    { component: 'AutoregressiveStepThrough', afterSection: 'How It Works' },
    { component: 'GenerationSpeedCalculator', afterSection: 'Key Technical Details' },
      { component: 'QuizAutoregressiveGeneration', afterSection: 'Common Misconceptions' },
  ],
  'next-token-prediction': [
    { component: 'NextTokenPredictor', afterSection: 'How It Works' },
    { component: 'LossLandscapeExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizNextTokenPrediction', afterSection: 'Common Misconceptions' },
  ],
  'mixture-of-experts': [
    { component: 'MoERoutingVisualizer', afterSection: 'How It Works' },
    { component: 'MoEEfficiencyCalculator', afterSection: 'Key Technical Details' },
      { component: 'QuizMixtureOfExperts', afterSection: 'Common Misconceptions' },
  ],
  'mixture-of-depths': [
    { component: 'MoDTokenRouting', afterSection: 'How It Works' },
    { component: 'ComputeBudgetExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizMixtureOfDepths', afterSection: 'Common Misconceptions' },
  ],
  'byte-latent-transformers': [
    { component: 'ByteVsTokenVisualizer', afterSection: 'How It Works' },
    { component: 'PatchingStrategyDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizByteLatentTransformers', afterSection: 'Common Misconceptions' },
  ],

  // === Module 02: Input Representation ===
  'tokenization': [
    { component: 'TokenizationPlayground', afterSection: 'How It Works' },
    { component: 'TokenBoundaryExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizTokenization', afterSection: 'Common Misconceptions' },
  ],
  'byte-pair-encoding': [
    { component: 'BPEMergeVisualizer', afterSection: 'How It Works' },
    { component: 'BPEVsWordPiece', afterSection: 'Key Technical Details' },
      { component: 'QuizBytePairEncoding', afterSection: 'Common Misconceptions' },
  ],
  'vocabulary-design': [
    { component: 'VocabSizeTradeoff', afterSection: 'How It Works' },
    { component: 'MultilingualTokenCost', afterSection: 'Key Technical Details' },
      { component: 'QuizVocabularyDesign', afterSection: 'Common Misconceptions' },
  ],
  'special-tokens': [
    { component: 'SpecialTokenMap', afterSection: 'How It Works' },
    { component: 'SpecialTokenQuiz', afterSection: 'Key Technical Details' },
      { component: 'QuizSpecialTokens', afterSection: 'Common Misconceptions' },
  ],
  'token-embeddings': [
    { component: 'EmbeddingSpaceVisualizer', afterSection: 'How It Works' },
    { component: 'EmbeddingDimExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizTokenEmbeddings', afterSection: 'Common Misconceptions' },
  ],
  'positional-encoding': [
    { component: 'SinusoidalPositionDemo', afterSection: 'How It Works' },
    { component: 'PositionalEncodingComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizPositionalEncoding', afterSection: 'Common Misconceptions' },
  ],
  'rotary-position-embedding': [
    { component: 'RoPERotationVisualizer', afterSection: 'How It Works' },
    { component: 'RoPEFrequencySpectrum', afterSection: 'Key Technical Details' },
      { component: 'QuizRoPE', afterSection: 'Common Misconceptions' },
  ],
  'alibi': [
    { component: 'ALiBiSlopeVisualizer', afterSection: 'How It Works' },
    { component: 'ALiBiExtrapolationDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizALiBi', afterSection: 'Common Misconceptions' },
  ],
  'context-window': [
    { component: 'ContextWindowTimeline', afterSection: 'How It Works' },
    { component: 'ContextMemoryCalculator', afterSection: 'Key Technical Details' },
      { component: 'QuizContextWindow', afterSection: 'Common Misconceptions' },
  ],

  // === Module 03: Training Fundamentals ===
  'cross-entropy-loss': [
    { component: 'CrossEntropyVisualizer', afterSection: 'How It Works' },
    { component: 'PerplexityComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizCrossEntropyLoss', afterSection: 'Common Misconceptions' },
  ],
  'backpropagation': [
    { component: 'BackpropChainRule', afterSection: 'How It Works' },
    { component: 'GradientDescentSteps', afterSection: 'Key Technical Details' },
      { component: 'QuizBackpropagation', afterSection: 'Common Misconceptions' },
  ],
  'adam-optimizer': [
    { component: 'AdamMomentumVisualizer', afterSection: 'How It Works' },
    { component: 'OptimizerMemoryCalculator', afterSection: 'Key Technical Details' },
      { component: 'QuizAdamOptimizer', afterSection: 'Common Misconceptions' },
  ],
  'learning-rate-scheduling': [
    { component: 'LRScheduleVisualizer', afterSection: 'How It Works' },
    { component: 'WarmupEffectDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizLearningRateScheduling', afterSection: 'Common Misconceptions' },
  ],
  'gradient-clipping': [
    { component: 'GradientClippingDemo', afterSection: 'Gradient Clipping' },
    { component: 'GradientAccumulationCalc', afterSection: 'Gradient Accumulation' },
      { component: 'QuizGradientClipping', afterSection: 'Common Misconceptions' },
  ],
  'mixed-precision-training': [
    { component: 'PrecisionFormatExplorer', afterSection: 'How It Works' },
    { component: 'MixedPrecisionMemory', afterSection: 'Key Technical Details' },
      { component: 'QuizMixedPrecisionTraining', afterSection: 'Common Misconceptions' },
  ],
  'gradient-checkpointing': [
    { component: 'CheckpointMemoryTradeoff', afterSection: 'How It Works' },
    { component: 'ActivationMemoryVisualizer', afterSection: 'Key Technical Details' },
      { component: 'QuizGradientCheckpointing', afterSection: 'Common Misconceptions' },
  ],
  'pre-training': [
    { component: 'PreTrainingPipeline', afterSection: 'How It Works' },
    { component: 'TrainingCostEstimator', afterSection: 'Key Technical Details' },
      { component: 'QuizPreTraining', afterSection: 'Common Misconceptions' },
  ],
  'training-data-curation': [
    { component: 'DataQualityFilter', afterSection: 'How It Works' },
    { component: 'DatasetCompositionViz', afterSection: 'Key Technical Details' },
      { component: 'QuizTrainingDataCuration', afterSection: 'Common Misconceptions' },
  ],
  'data-mixing': [
    { component: 'DataMixingRatios', afterSection: 'How It Works' },
    { component: 'DomainWeightImpact', afterSection: 'Key Technical Details' },
      { component: 'QuizDataMixing', afterSection: 'Common Misconceptions' },
  ],
  'curriculum-learning': [
    { component: 'CurriculumScheduleDemo', afterSection: 'How It Works' },
    { component: 'DifficultyMetricsExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizCurriculumLearning', afterSection: 'Common Misconceptions' },
  ],
  'scaling-laws': [
    { component: 'ScalingLawCalculator', afterSection: 'How It Works' },
    { component: 'ComputeOptimalPlot', afterSection: 'Key Technical Details' },
      { component: 'QuizScalingLaws', afterSection: 'Common Misconceptions' },
  ],
  'emergent-abilities': [
    { component: 'EmergentAbilitiesTimeline', afterSection: 'How It Works' },
    { component: 'EmergenceDebateExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizEmergentAbilities', afterSection: 'Common Misconceptions' },
  ],
  'grokking': [
    { component: 'GrokkingPhaseDemo', afterSection: 'How It Works' },
    { component: 'MemorizationVsGeneralization', afterSection: 'Key Technical Details' },
      { component: 'QuizGrokking', afterSection: 'Common Misconceptions' },
  ],
  'model-collapse': [
    { component: 'ModelCollapseSimulator', afterSection: 'How It Works' },
    { component: 'SyntheticDataMixCalc', afterSection: 'Key Technical Details' },
      { component: 'QuizModelCollapse', afterSection: 'Common Misconceptions' },
  ],
  'catastrophic-forgetting': [
    { component: 'ForgettingCurveDemo', afterSection: 'How It Works' },
    { component: 'ParameterInterferenceViz', afterSection: 'Key Technical Details' },
      { component: 'QuizCatastrophicForgetting', afterSection: 'Common Misconceptions' },
  ],
  'self-play-and-self-improvement': [
    { component: 'SelfPlayLoopViz', afterSection: 'How It Works' },
    { component: 'BootstrapAccuracyTracker', afterSection: 'Key Technical Details' },
      { component: 'QuizSelfPlay', afterSection: 'Common Misconceptions' },
  ],

  // === Module 04: Distributed Training ===
  'data-parallelism': [
    { component: 'AllReduceVisualizer', afterSection: 'How It Works' },
    { component: 'DDPScalingCalculator', afterSection: 'Key Technical Details' },
      { component: 'QuizDataParallelism', afterSection: 'Common Misconceptions' },
  ],
  'tensor-parallelism': [
    { component: 'TensorSplitVisualizer', afterSection: 'How It Works' },
    { component: 'TensorParallelComm', afterSection: 'Key Technical Details' },
      { component: 'QuizTensorParallelism', afterSection: 'Common Misconceptions' },
  ],
  'pipeline-parallelism': [
    { component: 'PipelineBubbleDemo', afterSection: 'How It Works' },
    { component: 'PipelineStageAssigner', afterSection: 'Key Technical Details' },
      { component: 'QuizPipelineParallelism', afterSection: 'Common Misconceptions' },
  ],
  'zero-and-fsdp': [
    { component: 'ZeROStageCompare', afterSection: 'How It Works' },
    { component: 'FSDPShardingViz', afterSection: 'Key Technical Details' },
      { component: 'QuizZeROFSDP', afterSection: 'Common Misconceptions' },
  ],
  '3d-parallelism': [
    { component: 'ParallelismDimensionMap', afterSection: 'How It Works' },
    { component: 'TrainingConfigCalculator', afterSection: 'Key Technical Details' },
      { component: 'Quiz3DParallelism', afterSection: 'Common Misconceptions' },
  ],
  'expert-parallelism': [
    { component: 'ExpertRoutingVisualizer', afterSection: 'How It Works' },
    { component: 'ExpertLoadBalancer', afterSection: 'Key Technical Details' },
      { component: 'QuizExpertParallelism', afterSection: 'Common Misconceptions' },
  ],
  'ring-attention': [
    { component: 'RingAttentionVisualizer', afterSection: 'How It Works' },
    { component: 'ContextScalingCalculator', afterSection: 'Key Technical Details' },
      { component: 'QuizRingAttention', afterSection: 'Common Misconceptions' },
  ],

  // === Module 05: Alignment & Post-Training ===
  'supervised-fine-tuning': [
    { component: 'SFTDataPipeline', afterSection: 'How It Works' },
    { component: 'InstructionFormatExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizSFT', afterSection: 'Common Misconceptions' },
  ],
  'rlhf': [
    { component: 'RLHFPipelineVisualizer', afterSection: 'How It Works' },
    { component: 'KLDivergenceExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizRLHF', afterSection: 'Common Misconceptions' },
  ],
  'reward-modeling': [
    { component: 'RewardModelTrainer', afterSection: 'How It Works' },
    { component: 'RewardHackingDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizRewardModeling', afterSection: 'Common Misconceptions' },
  ],
  'process-reward-models': [
    { component: 'PRMvsORMComparison', afterSection: 'How It Works' },
    { component: 'PreferencePairAnnotator', afterSection: 'Key Technical Details' },
      { component: 'QuizProcessRewardModels', afterSection: 'Common Misconceptions' },
  ],
  'dpo': [
    { component: 'DPOLossVisualizer', afterSection: 'How It Works' },
    { component: 'DPOvsRLHFComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizDPO', afterSection: 'Common Misconceptions' },
  ],
  'rejection-sampling': [
    { component: 'RejectionSamplingDemo', afterSection: 'How It Works' },
    { component: 'AlignmentTaxExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizRejectionSampling', afterSection: 'Common Misconceptions' },
  ],
  'preference-learning-variants': [
    { component: 'PreferenceLearningMap', afterSection: 'How It Works' },
    { component: 'PolicyGradientViz', afterSection: 'Key Technical Details' },
      { component: 'QuizPreferenceLearning', afterSection: 'Common Misconceptions' },
  ],
  'grpo': [
    { component: 'GRPOGroupScoring', afterSection: 'How It Works' },
    { component: 'GRPOvssPPOComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizGRPO', afterSection: 'Common Misconceptions' },
  ],
  'rlaif': [
    { component: 'RLAIFPipelineViz', afterSection: 'How It Works' },
    { component: 'RLVRRewardDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizRLAIF', afterSection: 'Common Misconceptions' },
  ],
  'constitutional-ai': [
    { component: 'ConstitutionBuilder', afterSection: 'How It Works' },
    { component: 'CAIRedTeamDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizConstitutionalAI', afterSection: 'Common Misconceptions' },
  ],
  'synthetic-data': [
    { component: 'SyntheticDataGenerator', afterSection: 'How It Works' },
    { component: 'SyntheticDataQualityViz', afterSection: 'Key Technical Details' },
      { component: 'QuizSyntheticData', afterSection: 'Common Misconceptions' },
  ],
  'rlvr': [
    { component: 'VerifiableRewardTypes', afterSection: 'How It Works' },
    { component: 'ReasoningChainViz', afterSection: 'Key Technical Details' },
      { component: 'QuizRLVR', afterSection: 'Common Misconceptions' },
  ],
  'chain-of-thought-training': [
    { component: 'CoTTrainingPipeline', afterSection: 'How It Works' },
    { component: 'ExtendedThinkingDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizCoTTraining', afterSection: 'Common Misconceptions' },
  ],

  // === Module 06: Parameter-Efficient Fine-Tuning ===
  'full-vs-peft-fine-tuning': [
    { component: 'FullVsPEFTComparison', afterSection: 'How It Works' },
    { component: 'PEFTDecisionTree', afterSection: 'Key Technical Details' },
      { component: 'QuizFullVsPEFT', afterSection: 'Common Misconceptions' },
  ],
  'lora': [
    { component: 'LoRAMatrixVisualizer', afterSection: 'How It Works' },
    { component: 'LoRARankExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizLoRA', afterSection: 'Common Misconceptions' },
  ],
  'adapters-and-prompt-tuning': [
    { component: 'AdapterArchitectureViz', afterSection: 'How It Works' },
    { component: 'SoftPromptDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizAdapters', afterSection: 'Common Misconceptions' },
  ],
  'qlora': [
    { component: 'QLoRAMemoryCalculator', afterSection: 'How It Works' },
    { component: 'NF4QuantizationViz', afterSection: 'Key Technical Details' },
      { component: 'QuizQLoRA', afterSection: 'Common Misconceptions' },
  ],
  'multi-lora-serving': [
    { component: 'MultiLoRARoutingViz', afterSection: 'How It Works' },
    { component: 'LoRASwapDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizMultiLoRA', afterSection: 'Common Misconceptions' },
  ],

  // === Module 07: Inference & Deployment ===
  'kv-cache': [
    { component: 'KVCacheVisualizer', afterSection: 'How It Works' },
    { component: 'KVCacheMemoryCalc', afterSection: 'Key Technical Details' },
      { component: 'QuizKVCache', afterSection: 'Common Misconceptions' },
  ],
  'flash-attention': [
    { component: 'FlashAttentionTiling', afterSection: 'How It Works' },
    { component: 'FlashAttentionIOComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizFlashAttention', afterSection: 'Common Misconceptions' },
  ],
  'paged-attention': [
    { component: 'PagedAttentionViz', afterSection: 'How It Works' },
    { component: 'PagedAttentionWasteCalc', afterSection: 'Key Technical Details' },
      { component: 'QuizPagedAttention', afterSection: 'Common Misconceptions' },
  ],
  'throughput-vs-latency': [
    { component: 'ThroughputLatencyTradeoff', afterSection: 'How It Works' },
    { component: 'BatchSizeOptimizer', afterSection: 'Key Technical Details' },
      { component: 'QuizThroughputLatency', afterSection: 'Common Misconceptions' },
  ],
  'continuous-batching': [
    { component: 'ContinuousBatchingViz', afterSection: 'How It Works' },
    { component: 'ContinuousBatchingTimeline', afterSection: 'Key Technical Details' },
      { component: 'QuizContinuousBatching', afterSection: 'Common Misconceptions' },
  ],
  'model-serving': [
    { component: 'ModelServingArchitecture', afterSection: 'How It Works' },
    { component: 'ServingFrameworkComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizModelServing', afterSection: 'Common Misconceptions' },
  ],
  'kv-cache-compression': [
    { component: 'KVCacheCompressionViz', afterSection: 'How It Works' },
    { component: 'KVCacheEvictionDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizKVCacheCompression', afterSection: 'Common Misconceptions' },
  ],
  'prefix-caching': [
    { component: 'PrefixCachingDemo', afterSection: 'How It Works' },
    { component: 'PrefixSharingViz', afterSection: 'Key Technical Details' },
      { component: 'QuizPrefixCaching', afterSection: 'Common Misconceptions' },
  ],
  'prefill-decode-disaggregation': [
    { component: 'PrefillDecodeViz', afterSection: 'How It Works' },
    { component: 'PrefillDecodeTimeline', afterSection: 'Key Technical Details' },
      { component: 'QuizPrefillDecode', afterSection: 'Common Misconceptions' },
  ],
  'speculative-decoding': [
    { component: 'SpeculativeDecodingDemo', afterSection: 'How It Works' },
    { component: 'SpeculativeAcceptanceViz', afterSection: 'Key Technical Details' },
      { component: 'QuizSpeculativeDecoding', afterSection: 'Common Misconceptions' },
  ],
  'medusa-parallel-decoding': [
    { component: 'MedusaHeadViz', afterSection: 'How It Works' },
    { component: 'ParallelDecodingComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizMedusa', afterSection: 'Common Misconceptions' },
  ],
  'sampling-strategies': [
    { component: 'SamplingStrategyViz', afterSection: 'How It Works' },
    { component: 'SamplingComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizSamplingStrategies', afterSection: 'Common Misconceptions' },
  ],
  'constrained-decoding': [
    { component: 'ConstrainedDecodingViz', afterSection: 'How It Works' },
    { component: 'GrammarMaskDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizConstrainedDecoding', afterSection: 'Common Misconceptions' },
  ],
  'quantization': [
    { component: 'QuantizationLevelsViz', afterSection: 'How It Works' },
    { component: 'QuantizationImpactCalc', afterSection: 'Key Technical Details' },
      { component: 'QuizQuantization', afterSection: 'Common Misconceptions' },
  ],
  'knowledge-distillation': [
    { component: 'DistillationPipelineViz', afterSection: 'How It Works' },
    { component: 'InferenceCostBreakdown', afterSection: 'Key Technical Details' },
      { component: 'QuizKnowledgeDistillation', afterSection: 'Common Misconceptions' },
  ],
  'distillation-for-reasoning': [
    { component: 'DistillationForReasoningViz', afterSection: 'How It Works' },
    { component: 'ReasoningDistillationQuality', afterSection: 'Key Technical Details' },
      { component: 'QuizDistillationReasoning', afterSection: 'Common Misconceptions' },
  ],
  'prompt-compression': [
    { component: 'PromptCompressionDemo', afterSection: 'How It Works' },
    { component: 'PromptCompressionQuality', afterSection: 'Key Technical Details' },
      { component: 'QuizPromptCompression', afterSection: 'Common Misconceptions' },
  ],
  'model-routing': [
    { component: 'ModelRoutingViz', afterSection: 'How It Works' },
    { component: 'RouterCostCalculator', afterSection: 'Key Technical Details' },
      { component: 'QuizModelRouting', afterSection: 'Common Misconceptions' },
  ],

  // === Module 08: Practical Applications ===
  'prompt-engineering': [
    { component: 'PromptTechniqueExplorer', afterSection: 'How It Works' },
    { component: 'PromptTemplateBuilder', afterSection: 'Key Technical Details' },
      { component: 'QuizPromptEngineering', afterSection: 'Common Misconceptions' },
  ],
  'structured-output': [
    { component: 'JSONModeDemo', afterSection: 'How It Works' },
    { component: 'SchemaValidationViz', afterSection: 'Key Technical Details' },
      { component: 'QuizStructuredOutput', afterSection: 'Common Misconceptions' },
  ],
  'function-calling-and-tool-use': [
    { component: 'FunctionCallingFlow', afterSection: 'How It Works' },
    { component: 'ToolSelectionDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizFunctionCalling', afterSection: 'Common Misconceptions' },
  ],
  'rag': [
    { component: 'RAGPipelineViz', afterSection: 'How It Works' },
    { component: 'RAGvsFineTuning', afterSection: 'Key Technical Details' },
      { component: 'QuizRAG', afterSection: 'Common Misconceptions' },
  ],
  'chunking-strategies': [
    { component: 'ChunkingMethodComparison', afterSection: 'How It Works' },
    { component: 'ChunkSizeExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizChunkingStrategies', afterSection: 'Common Misconceptions' },
  ],
  'embedding-models-and-vector-databases': [
    { component: 'EmbeddingSimilarityDemo', afterSection: 'How It Works' },
    { component: 'VectorDBArchitectureViz', afterSection: 'Key Technical Details' },
      { component: 'QuizEmbeddingsVectorDB', afterSection: 'Common Misconceptions' },
  ],
  'ai-agents': [
    { component: 'AgentLoopViz', afterSection: 'How It Works' },
    { component: 'AgentToolChain', afterSection: 'Key Technical Details' },
      { component: 'QuizAIAgents', afterSection: 'Common Misconceptions' },
  ],
  'react-pattern': [
    { component: 'ReActStepThrough', afterSection: 'How It Works' },
    { component: 'ReActVsCoT', afterSection: 'Key Technical Details' },
      { component: 'QuizReActPattern', afterSection: 'Common Misconceptions' },
  ],
  'self-reflection': [
    { component: 'ReflexionLoopViz', afterSection: 'How It Works' },
    { component: 'SelfCritiqueDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizSelfReflection', afterSection: 'Common Misconceptions' },
  ],
  'memory-systems': [
    { component: 'MemoryArchitectureViz', afterSection: 'How It Works' },
    { component: 'MemoryRetrievalDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizMemorySystems', afterSection: 'Common Misconceptions' },
  ],
  'multi-agent-systems': [
    { component: 'MultiAgentDebateViz', afterSection: 'How It Works' },
    { component: 'AgentOrchestrationViz', afterSection: 'Key Technical Details' },
      { component: 'QuizMultiAgent', afterSection: 'Common Misconceptions' },
  ],
  'model-context-protocol': [
    { component: 'MCPArchitectureViz', afterSection: 'How It Works' },
    { component: 'MCPToolDiscoveryDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizMCP', afterSection: 'Common Misconceptions' },
  ],

  // === Module 09: Safety & Alignment ===
  'hallucination': [
    { component: 'HallucinationTypeViz', afterSection: 'How It Works' },
    { component: 'HallucinationDetector', afterSection: 'Key Technical Details' },
      { component: 'QuizHallucination', afterSection: 'Common Misconceptions' },
  ],
  'bias-and-fairness': [
    { component: 'BiasTypeExplorer', afterSection: 'How It Works' },
    { component: 'FairnessMetricsViz', afterSection: 'Key Technical Details' },
      { component: 'QuizBiasFairness', afterSection: 'Common Misconceptions' },
  ],
  'toxicity-detection': [
    { component: 'ToxicityClassifierDemo', afterSection: 'How It Works' },
    { component: 'ContentFilterViz', afterSection: 'Key Technical Details' },
      { component: 'QuizToxicityDetection', afterSection: 'Common Misconceptions' },
  ],
  'prompt-injection': [
    { component: 'PromptInjectionDemo', afterSection: 'How It Works' },
    { component: 'InjectionDefenseViz', afterSection: 'Key Technical Details' },
      { component: 'QuizPromptInjection', afterSection: 'Common Misconceptions' },
  ],
  'jailbreaking': [
    { component: 'JailbreakTechniqueViz', afterSection: 'How It Works' },
    { component: 'JailbreakDefenseDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizJailbreaking', afterSection: 'Common Misconceptions' },
  ],
  'red-teaming': [
    { component: 'RedTeamProcessViz', afterSection: 'How It Works' },
    { component: 'AttackSurfaceMap', afterSection: 'Key Technical Details' },
      { component: 'QuizRedTeaming', afterSection: 'Common Misconceptions' },
  ],
  'guardrails': [
    { component: 'GuardrailPipelineViz', afterSection: 'How It Works' },
    { component: 'GuardrailConfigDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizGuardrails', afterSection: 'Common Misconceptions' },
  ],
  'alignment-problem': [
    { component: 'AlignmentSpectrumViz', afterSection: 'How It Works' },
    { component: 'MisalignmentExamples', afterSection: 'Key Technical Details' },
      { component: 'QuizAlignmentProblem', afterSection: 'Common Misconceptions' },
  ],
  'reward-hacking': [
    { component: 'RewardHackingExamples', afterSection: 'How It Works' },
    { component: 'RewardGameViz', afterSection: 'Key Technical Details' },
      { component: 'QuizRewardHacking', afterSection: 'Common Misconceptions' },
  ],
  'specification-gaming': [
    { component: 'SpecGamingCatalog', afterSection: 'How It Works' },
    { component: 'SpecGamingSimulator', afterSection: 'Key Technical Details' },
      { component: 'QuizSpecGaming', afterSection: 'Common Misconceptions' },
  ],
  'sycophancy': [
    { component: 'SycophancyDetector', afterSection: 'How It Works' },
    { component: 'SycophancyComparisonViz', afterSection: 'Key Technical Details' },
      { component: 'QuizSycophancy', afterSection: 'Common Misconceptions' },
  ],
  'goodharts-law': [
    { component: 'GoodhartLawViz', afterSection: 'How It Works' },
    { component: 'MetricProxyExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizGoodhartsLaw', afterSection: 'Common Misconceptions' },
  ],
  'scalable-oversight': [
    { component: 'OversightScalabilityViz', afterSection: 'How It Works' },
    { component: 'DebateProtocolDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizScalableOversight', afterSection: 'Common Misconceptions' },
  ],
  'weak-to-strong-generalization': [
    { component: 'WeakToStrongViz', afterSection: 'How It Works' },
    { component: 'SupervisionGapDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizWeakToStrong', afterSection: 'Common Misconceptions' },
  ],
  'machine-unlearning': [
    { component: 'UnlearningMethodViz', afterSection: 'How It Works' },
    { component: 'UnlearningVerificationDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizMachineUnlearning', afterSection: 'Common Misconceptions' },
  ],
  'watermarking-llm-text': [
    { component: 'WatermarkEmbeddingViz', afterSection: 'How It Works' },
    { component: 'WatermarkDetectionDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizWatermarking', afterSection: 'Common Misconceptions' },
  ],
  'circuit-breakers': [
    { component: 'CircuitBreakerFlowViz', afterSection: 'How It Works' },
    { component: 'RepresentationMonitorDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizCircuitBreakers', afterSection: 'Common Misconceptions' },
  ],
  'instruction-hierarchy': [
    { component: 'InstructionHierarchyViz', afterSection: 'How It Works' },
    { component: 'HierarchyConflictDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizInstructionHierarchy', afterSection: 'Common Misconceptions' },
  ],
  'sleeper-agents': [
    { component: 'SleeperAgentViz', afterSection: 'How It Works' },
    { component: 'BackdoorDetectionDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizSleeperAgents', afterSection: 'Common Misconceptions' },
  ],
  'ai-sandbagging': [
    { component: 'SandbaggingDemo', afterSection: 'How It Works' },
    { component: 'SandbaggingDetectionViz', afterSection: 'Key Technical Details' },
      { component: 'QuizAISandbagging', afterSection: 'Common Misconceptions' },
  ],
  'adversarial-robustness': [
    { component: 'AdversarialAttackViz', afterSection: 'How It Works' },
    { component: 'RobustnessTestingDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizAdversarialRobustness', afterSection: 'Common Misconceptions' },
  ],

  // === Module 10: Evaluation ===
  'benchmarks': [
    { component: 'BenchmarkExplorer', afterSection: 'How It Works' },
    { component: 'BenchmarkLeaderboardViz', afterSection: 'Key Technical Details' },
      { component: 'QuizBenchmarks', afterSection: 'Common Misconceptions' },
  ],
  'evaluation-metrics': [
    { component: 'MetricComparisonViz', afterSection: 'How It Works' },
    { component: 'MetricCorrelationDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizEvaluationMetrics', afterSection: 'Common Misconceptions' },
  ],
  'perplexity': [
    { component: 'PerplexityCalculator', afterSection: 'How It Works' },
    { component: 'PerplexityModelComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizPerplexity', afterSection: 'Common Misconceptions' },
  ],
  'human-evaluation': [
    { component: 'HumanEvalSetupViz', afterSection: 'How It Works' },
    { component: 'AnnotatorAgreementDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizHumanEvaluation', afterSection: 'Common Misconceptions' },
  ],
  'llm-as-judge': [
    { component: 'LLMJudgeViz', afterSection: 'How It Works' },
    { component: 'JudgeBiasExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizLLMAsJudge', afterSection: 'Common Misconceptions' },
  ],
  'chatbot-arena': [
    { component: 'ArenaMatchViz', afterSection: 'How It Works' },
    { component: 'EloRatingExplorer', afterSection: 'Key Technical Details' },
      { component: 'QuizChatbotArena', afterSection: 'Common Misconceptions' },
  ],
  'benchmark-contamination-detection': [
    { component: 'ContaminationDetectorViz', afterSection: 'How It Works' },
    { component: 'DecontaminationMethodsDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizBenchmarkContamination', afterSection: 'Common Misconceptions' },
  ],

  // === Module 11: Advanced & Emerging ===
  'in-context-learning': [
    { component: 'ICLDemoViz', afterSection: 'How It Works' },
    { component: 'ICLvsFineTuning', afterSection: 'Key Technical Details' },
      { component: 'QuizICL', afterSection: 'Common Misconceptions' },
  ],
  'multimodal-models': [
    { component: 'MultimodalArchViz', afterSection: 'How It Works' },
    { component: 'ModalityComparisonDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizMultimodal', afterSection: 'Common Misconceptions' },
  ],
  'vision-language-models': [
    { component: 'VLMPipelineViz', afterSection: 'How It Works' },
    { component: 'ImagePatchTokenizer', afterSection: 'Key Technical Details' },
      { component: 'QuizVLM', afterSection: 'Common Misconceptions' },
  ],
  'state-space-models': [
    { component: 'SSMvsTransformerViz', afterSection: 'How It Works' },
    { component: 'MambaBlockViz', afterSection: 'Key Technical Details' },
      { component: 'QuizSSM', afterSection: 'Common Misconceptions' },
  ],
  'mechanistic-interpretability': [
    { component: 'NeuronActivationViz', afterSection: 'How It Works' },
    { component: 'CircuitDiscoveryDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizMechInterp', afterSection: 'Common Misconceptions' },
  ],
  'representation-engineering': [
    { component: 'RepresentationVectorViz', afterSection: 'How It Works' },
    { component: 'ActivationSteeringDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizRepEngineering', afterSection: 'Common Misconceptions' },
  ],
  'model-merging': [
    { component: 'MergingMethodViz', afterSection: 'How It Works' },
    { component: 'MergeRecipeBuilder', afterSection: 'Key Technical Details' },
      { component: 'QuizModelMerging', afterSection: 'Common Misconceptions' },
  ],
  'multi-token-prediction': [
    { component: 'MultiTokenVsAutoregressive', afterSection: 'How It Works' },
    { component: 'MultiTokenSpeedupCalc', afterSection: 'Key Technical Details' },
      { component: 'QuizMultiTokenPred', afterSection: 'Common Misconceptions' },
  ],
  'context-window-extension': [
    { component: 'ContextExtensionMethods', afterSection: 'How It Works' },
    { component: 'ContextLengthImpact', afterSection: 'Key Technical Details' },
      { component: 'QuizContextExtension', afterSection: 'Common Misconceptions' },
  ],
  'test-time-compute': [
    { component: 'TestTimeComputeViz', afterSection: 'How It Works' },
    { component: 'ComputeBudgetAllocation', afterSection: 'Key Technical Details' },
      { component: 'QuizTestTimeCompute', afterSection: 'Common Misconceptions' },
  ],
  'inference-time-scaling-laws': [
    { component: 'InferenceScalingCurve', afterSection: 'How It Works' },
    { component: 'ScalingStrategyComparison', afterSection: 'Key Technical Details' },
      { component: 'QuizInferenceScaling', afterSection: 'Common Misconceptions' },
  ],
  'reasoning-models': [
    { component: 'ReasoningModelComparison', afterSection: 'How It Works' },
    { component: 'ReasoningVsStandardViz', afterSection: 'Key Technical Details' },
      { component: 'QuizReasoningModels', afterSection: 'Common Misconceptions' },
  ],
  'tree-of-thought': [
    { component: 'TreeOfThoughtViz', afterSection: 'How It Works' },
    { component: 'ToTvsCOT', afterSection: 'Key Technical Details' },
      { component: 'QuizTreeOfThought', afterSection: 'Common Misconceptions' },
  ],
  'neurosymbolic-ai': [
    { component: 'NeurosymbolicArchViz', afterSection: 'How It Works' },
    { component: 'SymbolicVsNeuralDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizNeurosymbolic', afterSection: 'Common Misconceptions' },
  ],
  'compound-ai-systems': [
    { component: 'CompoundSystemViz', afterSection: 'How It Works' },
    { component: 'SystemCompositionDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizCompoundAI', afterSection: 'Common Misconceptions' },
  ],
  'mixture-of-agents': [
    { component: 'MoALayerViz', afterSection: 'How It Works' },
    { component: 'MoAvsingle', afterSection: 'Key Technical Details' },
      { component: 'QuizMoA', afterSection: 'Common Misconceptions' },
  ],
  'agentic-rag': [
    { component: 'AgenticRAGViz', afterSection: 'How It Works' },
    { component: 'AgenticVsNaiveRAG', afterSection: 'Key Technical Details' },
      { component: 'QuizAgenticRAG', afterSection: 'Common Misconceptions' },
  ],
  'corrective-rag': [
    { component: 'CRAGFlowViz', afterSection: 'How It Works' },
    { component: 'RelevanceGatingDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizCorrectiveRAG', afterSection: 'Common Misconceptions' },
  ],
  'self-rag': [
    { component: 'SelfRAGFlowViz', afterSection: 'How It Works' },
    { component: 'ReflectionTokenDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizSelfRAG', afterSection: 'Common Misconceptions' },
  ],
  'graphrag': [
    { component: 'GraphRAGViz', afterSection: 'How It Works' },
    { component: 'GraphVsVectorRAG', afterSection: 'Key Technical Details' },
      { component: 'QuizGraphRAG', afterSection: 'Common Misconceptions' },
  ],
  'raptor': [
    { component: 'RAPTORTreeViz', afterSection: 'How It Works' },
    { component: 'TreeTraversalDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizRAPTOR', afterSection: 'Common Misconceptions' },
  ],
  'hyde-hypothetical-document-embeddings': [
    { component: 'HyDEPipelineViz', afterSection: 'How It Works' },
    { component: 'HyDEvsDirectSearch', afterSection: 'Key Technical Details' },
      { component: 'QuizHyDE', afterSection: 'Common Misconceptions' },
  ],
  'colbert-late-interaction': [
    { component: 'ColBERTInteractionViz', afterSection: 'How It Works' },
    { component: 'ColBERTvsDenseRetrieval', afterSection: 'Key Technical Details' },
      { component: 'QuizColBERT', afterSection: 'Common Misconceptions' },
  ],
  'reranking-and-cross-encoders': [
    { component: 'RerankingPipelineViz', afterSection: 'How It Works' },
    { component: 'CrossEncoderVsBiEncoder', afterSection: 'Key Technical Details' },
      { component: 'QuizReranking', afterSection: 'Common Misconceptions' },
  ],
  'late-chunking': [
    { component: 'LateChunkingViz', afterSection: 'How It Works' },
    { component: 'LateVsEarlyChunking', afterSection: 'Key Technical Details' },
      { component: 'QuizLateChunking', afterSection: 'Common Misconceptions' },
  ],
  'matryoshka-representation-learning': [
    { component: 'MatryoshkaDimViz', afterSection: 'How It Works' },
    { component: 'DimensionTruncationDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizMatryoshka', afterSection: 'Common Misconceptions' },
  ],
  'query-decomposition-and-multi-step-retrieval': [
    { component: 'QueryDecompViz', afterSection: 'How It Works' },
    { component: 'MultiStepRetrievalDemo', afterSection: 'Key Technical Details' },
      { component: 'QuizQueryDecomp', afterSection: 'Common Misconceptions' },
  ],
};
