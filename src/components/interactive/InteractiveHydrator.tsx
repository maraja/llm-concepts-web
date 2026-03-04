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

  // === Module 05: Alignment & Post-Training ===
  // Supervised Fine-Tuning
  SFTDataPipeline: lazy(() => import('./SFTDataPipeline')),
  InstructionFormatExplorer: lazy(() => import('./InstructionFormatExplorer')),
  // RLHF
  RLHFPipelineVisualizer: lazy(() => import('./RLHFPipelineVisualizer')),
  KLDivergenceExplorer: lazy(() => import('./KLDivergenceExplorer')),
  // Reward Modeling
  RewardModelTrainer: lazy(() => import('./RewardModelTrainer')),
  RewardHackingDemo: lazy(() => import('./RewardHackingDemo')),
  // Process Reward Models
  PRMvsORMComparison: lazy(() => import('./PRMvsORMComparison')),
  PreferencePairAnnotator: lazy(() => import('./PreferencePairAnnotator')),
  // DPO
  DPOLossVisualizer: lazy(() => import('./DPOLossVisualizer')),
  DPOvsRLHFComparison: lazy(() => import('./DPOvsRLHFComparison')),
  // Rejection Sampling
  RejectionSamplingDemo: lazy(() => import('./RejectionSamplingDemo')),
  AlignmentTaxExplorer: lazy(() => import('./AlignmentTaxExplorer')),
  // Preference Learning Variants
  PreferenceLearningMap: lazy(() => import('./PreferenceLearningMap')),
  PolicyGradientViz: lazy(() => import('./PolicyGradientViz')),
  // GRPO
  GRPOGroupScoring: lazy(() => import('./GRPOGroupScoring')),
  GRPOvssPPOComparison: lazy(() => import('./GRPOvssPPOComparison')),
  // RLAIF
  RLAIFPipelineViz: lazy(() => import('./RLAIFPipelineViz')),
  RLVRRewardDemo: lazy(() => import('./RLVRRewardDemo')),
  // Constitutional AI
  ConstitutionBuilder: lazy(() => import('./ConstitutionBuilder')),
  CAIRedTeamDemo: lazy(() => import('./CAIRedTeamDemo')),
  // Synthetic Data
  SyntheticDataGenerator: lazy(() => import('./SyntheticDataGenerator')),
  SyntheticDataQualityViz: lazy(() => import('./SyntheticDataQualityViz')),
  // RLVR
  VerifiableRewardTypes: lazy(() => import('./VerifiableRewardTypes')),
  ReasoningChainViz: lazy(() => import('./ReasoningChainViz')),
  // Chain-of-Thought Training
  CoTTrainingPipeline: lazy(() => import('./CoTTrainingPipeline')),
  ExtendedThinkingDemo: lazy(() => import('./ExtendedThinkingDemo')),

  // === Module 06: Parameter-Efficient Fine-Tuning ===
  // Full vs PEFT
  FullVsPEFTComparison: lazy(() => import('./FullVsPEFTComparison')),
  PEFTDecisionTree: lazy(() => import('./PEFTDecisionTree')),
  // LoRA
  LoRAMatrixVisualizer: lazy(() => import('./LoRAMatrixVisualizer')),
  LoRARankExplorer: lazy(() => import('./LoRARankExplorer')),
  // Adapters & Prompt Tuning
  AdapterArchitectureViz: lazy(() => import('./AdapterArchitectureViz')),
  SoftPromptDemo: lazy(() => import('./SoftPromptDemo')),
  // QLoRA
  QLoRAMemoryCalculator: lazy(() => import('./QLoRAMemoryCalculator')),
  NF4QuantizationViz: lazy(() => import('./NF4QuantizationViz')),
  // Multi-LoRA Serving
  MultiLoRARoutingViz: lazy(() => import('./MultiLoRARoutingViz')),
  LoRASwapDemo: lazy(() => import('./LoRASwapDemo')),

  // === Module 07: Inference & Deployment ===
  // KV Cache
  KVCacheVisualizer: lazy(() => import('./KVCacheVisualizer')),
  KVCacheMemoryCalc: lazy(() => import('./KVCacheMemoryCalc')),
  // Flash Attention
  FlashAttentionTiling: lazy(() => import('./FlashAttentionTiling')),
  FlashAttentionIOComparison: lazy(() => import('./FlashAttentionIOComparison')),
  // Paged Attention
  PagedAttentionViz: lazy(() => import('./PagedAttentionViz')),
  PagedAttentionWasteCalc: lazy(() => import('./PagedAttentionWasteCalc')),
  // Throughput vs Latency
  ThroughputLatencyTradeoff: lazy(() => import('./ThroughputLatencyTradeoff')),
  BatchSizeOptimizer: lazy(() => import('./BatchSizeOptimizer')),
  // Continuous Batching
  ContinuousBatchingViz: lazy(() => import('./ContinuousBatchingViz')),
  ContinuousBatchingTimeline: lazy(() => import('./ContinuousBatchingTimeline')),
  // Model Serving
  ModelServingArchitecture: lazy(() => import('./ModelServingArchitecture')),
  ServingFrameworkComparison: lazy(() => import('./ServingFrameworkComparison')),
  // KV Cache Compression
  KVCacheCompressionViz: lazy(() => import('./KVCacheCompressionViz')),
  KVCacheEvictionDemo: lazy(() => import('./KVCacheEvictionDemo')),
  // Prefix Caching
  PrefixCachingDemo: lazy(() => import('./PrefixCachingDemo')),
  PrefixSharingViz: lazy(() => import('./PrefixSharingViz')),
  // Prefill-Decode Disaggregation
  PrefillDecodeViz: lazy(() => import('./PrefillDecodeViz')),
  PrefillDecodeTimeline: lazy(() => import('./PrefillDecodeTimeline')),
  // Speculative Decoding
  SpeculativeDecodingDemo: lazy(() => import('./SpeculativeDecodingDemo')),
  SpeculativeAcceptanceViz: lazy(() => import('./SpeculativeAcceptanceViz')),
  // Medusa / Parallel Decoding
  MedusaHeadViz: lazy(() => import('./MedusaHeadViz')),
  ParallelDecodingComparison: lazy(() => import('./ParallelDecodingComparison')),
  // Sampling Strategies
  SamplingStrategyViz: lazy(() => import('./SamplingStrategyViz')),
  SamplingComparison: lazy(() => import('./SamplingComparison')),
  // Constrained Decoding
  ConstrainedDecodingViz: lazy(() => import('./ConstrainedDecodingViz')),
  GrammarMaskDemo: lazy(() => import('./GrammarMaskDemo')),
  // Quantization
  QuantizationLevelsViz: lazy(() => import('./QuantizationLevelsViz')),
  QuantizationImpactCalc: lazy(() => import('./QuantizationImpactCalc')),
  // Knowledge Distillation
  DistillationPipelineViz: lazy(() => import('./DistillationPipelineViz')),
  InferenceCostBreakdown: lazy(() => import('./InferenceCostBreakdown')),
  // Distillation for Reasoning
  DistillationForReasoningViz: lazy(() => import('./DistillationForReasoningViz')),
  ReasoningDistillationQuality: lazy(() => import('./ReasoningDistillationQuality')),
  // Prompt Compression
  PromptCompressionDemo: lazy(() => import('./PromptCompressionDemo')),
  PromptCompressionQuality: lazy(() => import('./PromptCompressionQuality')),
  // Model Routing
  ModelRoutingViz: lazy(() => import('./ModelRoutingViz')),
  RouterCostCalculator: lazy(() => import('./RouterCostCalculator')),

  // === Module 08: Practical Applications ===
  PromptTechniqueExplorer: lazy(() => import('./PromptTechniqueExplorer')),
  PromptTemplateBuilder: lazy(() => import('./PromptTemplateBuilder')),
  JSONModeDemo: lazy(() => import('./JSONModeDemo')),
  SchemaValidationViz: lazy(() => import('./SchemaValidationViz')),
  FunctionCallingFlow: lazy(() => import('./FunctionCallingFlow')),
  ToolSelectionDemo: lazy(() => import('./ToolSelectionDemo')),
  RAGPipelineViz: lazy(() => import('./RAGPipelineViz')),
  RAGvsFineTuning: lazy(() => import('./RAGvsFineTuning')),
  ChunkingMethodComparison: lazy(() => import('./ChunkingMethodComparison')),
  ChunkSizeExplorer: lazy(() => import('./ChunkSizeExplorer')),
  EmbeddingSimilarityDemo: lazy(() => import('./EmbeddingSimilarityDemo')),
  VectorDBArchitectureViz: lazy(() => import('./VectorDBArchitectureViz')),
  AgentLoopViz: lazy(() => import('./AgentLoopViz')),
  AgentToolChain: lazy(() => import('./AgentToolChain')),
  ReActStepThrough: lazy(() => import('./ReActStepThrough')),
  ReActVsCoT: lazy(() => import('./ReActVsCoT')),
  ReflexionLoopViz: lazy(() => import('./ReflexionLoopViz')),
  SelfCritiqueDemo: lazy(() => import('./SelfCritiqueDemo')),
  MemoryArchitectureViz: lazy(() => import('./MemoryArchitectureViz')),
  MemoryRetrievalDemo: lazy(() => import('./MemoryRetrievalDemo')),
  MultiAgentDebateViz: lazy(() => import('./MultiAgentDebateViz')),
  AgentOrchestrationViz: lazy(() => import('./AgentOrchestrationViz')),
  MCPArchitectureViz: lazy(() => import('./MCPArchitectureViz')),
  MCPToolDiscoveryDemo: lazy(() => import('./MCPToolDiscoveryDemo')),

  // === Module 09: Safety & Alignment ===
  HallucinationTypeViz: lazy(() => import('./HallucinationTypeViz')),
  HallucinationDetector: lazy(() => import('./HallucinationDetector')),
  BiasTypeExplorer: lazy(() => import('./BiasTypeExplorer')),
  FairnessMetricsViz: lazy(() => import('./FairnessMetricsViz')),
  ToxicityClassifierDemo: lazy(() => import('./ToxicityClassifierDemo')),
  ContentFilterViz: lazy(() => import('./ContentFilterViz')),
  PromptInjectionDemo: lazy(() => import('./PromptInjectionDemo')),
  InjectionDefenseViz: lazy(() => import('./InjectionDefenseViz')),
  JailbreakTechniqueViz: lazy(() => import('./JailbreakTechniqueViz')),
  JailbreakDefenseDemo: lazy(() => import('./JailbreakDefenseDemo')),
  RedTeamProcessViz: lazy(() => import('./RedTeamProcessViz')),
  AttackSurfaceMap: lazy(() => import('./AttackSurfaceMap')),
  GuardrailPipelineViz: lazy(() => import('./GuardrailPipelineViz')),
  GuardrailConfigDemo: lazy(() => import('./GuardrailConfigDemo')),
  AlignmentSpectrumViz: lazy(() => import('./AlignmentSpectrumViz')),
  MisalignmentExamples: lazy(() => import('./MisalignmentExamples')),
  RewardHackingExamples: lazy(() => import('./RewardHackingExamples')),
  RewardGameViz: lazy(() => import('./RewardGameViz')),
  SpecGamingCatalog: lazy(() => import('./SpecGamingCatalog')),
  SpecGamingSimulator: lazy(() => import('./SpecGamingSimulator')),
  SycophancyDetector: lazy(() => import('./SycophancyDetector')),
  SycophancyComparisonViz: lazy(() => import('./SycophancyComparisonViz')),
  GoodhartLawViz: lazy(() => import('./GoodhartLawViz')),
  MetricProxyExplorer: lazy(() => import('./MetricProxyExplorer')),
  OversightScalabilityViz: lazy(() => import('./OversightScalabilityViz')),
  DebateProtocolDemo: lazy(() => import('./DebateProtocolDemo')),
  WeakToStrongViz: lazy(() => import('./WeakToStrongViz')),
  SupervisionGapDemo: lazy(() => import('./SupervisionGapDemo')),
  UnlearningMethodViz: lazy(() => import('./UnlearningMethodViz')),
  UnlearningVerificationDemo: lazy(() => import('./UnlearningVerificationDemo')),
  WatermarkEmbeddingViz: lazy(() => import('./WatermarkEmbeddingViz')),
  WatermarkDetectionDemo: lazy(() => import('./WatermarkDetectionDemo')),
  CircuitBreakerFlowViz: lazy(() => import('./CircuitBreakerFlowViz')),
  RepresentationMonitorDemo: lazy(() => import('./RepresentationMonitorDemo')),
  InstructionHierarchyViz: lazy(() => import('./InstructionHierarchyViz')),
  HierarchyConflictDemo: lazy(() => import('./HierarchyConflictDemo')),
  SleeperAgentViz: lazy(() => import('./SleeperAgentViz')),
  BackdoorDetectionDemo: lazy(() => import('./BackdoorDetectionDemo')),
  SandbaggingDemo: lazy(() => import('./SandbaggingDemo')),
  SandbaggingDetectionViz: lazy(() => import('./SandbaggingDetectionViz')),
  AdversarialAttackViz: lazy(() => import('./AdversarialAttackViz')),
  RobustnessTestingDemo: lazy(() => import('./RobustnessTestingDemo')),

  // === Module 10: Evaluation ===
  BenchmarkExplorer: lazy(() => import('./BenchmarkExplorer')),
  BenchmarkLeaderboardViz: lazy(() => import('./BenchmarkLeaderboardViz')),
  MetricComparisonViz: lazy(() => import('./MetricComparisonViz')),
  MetricCorrelationDemo: lazy(() => import('./MetricCorrelationDemo')),
  PerplexityCalculator: lazy(() => import('./PerplexityCalculator')),
  PerplexityModelComparison: lazy(() => import('./PerplexityModelComparison')),
  HumanEvalSetupViz: lazy(() => import('./HumanEvalSetupViz')),
  AnnotatorAgreementDemo: lazy(() => import('./AnnotatorAgreementDemo')),
  LLMJudgeViz: lazy(() => import('./LLMJudgeViz')),
  JudgeBiasExplorer: lazy(() => import('./JudgeBiasExplorer')),
  ArenaMatchViz: lazy(() => import('./ArenaMatchViz')),
  EloRatingExplorer: lazy(() => import('./EloRatingExplorer')),
  ContaminationDetectorViz: lazy(() => import('./ContaminationDetectorViz')),
  DecontaminationMethodsDemo: lazy(() => import('./DecontaminationMethodsDemo')),

  // === Module 11: Advanced & Emerging ===
  ICLDemoViz: lazy(() => import('./ICLDemoViz')),
  ICLvsFineTuning: lazy(() => import('./ICLvsFineTuning')),
  MultimodalArchViz: lazy(() => import('./MultimodalArchViz')),
  ModalityComparisonDemo: lazy(() => import('./ModalityComparisonDemo')),
  VLMPipelineViz: lazy(() => import('./VLMPipelineViz')),
  ImagePatchTokenizer: lazy(() => import('./ImagePatchTokenizer')),
  SSMvsTransformerViz: lazy(() => import('./SSMvsTransformerViz')),
  MambaBlockViz: lazy(() => import('./MambaBlockViz')),
  NeuronActivationViz: lazy(() => import('./NeuronActivationViz')),
  CircuitDiscoveryDemo: lazy(() => import('./CircuitDiscoveryDemo')),
  RepresentationVectorViz: lazy(() => import('./RepresentationVectorViz')),
  ActivationSteeringDemo: lazy(() => import('./ActivationSteeringDemo')),
  MergingMethodViz: lazy(() => import('./MergingMethodViz')),
  MergeRecipeBuilder: lazy(() => import('./MergeRecipeBuilder')),
  MultiTokenVsAutoregressive: lazy(() => import('./MultiTokenVsAutoregressive')),
  MultiTokenSpeedupCalc: lazy(() => import('./MultiTokenSpeedupCalc')),
  ContextExtensionMethods: lazy(() => import('./ContextExtensionMethods')),
  ContextLengthImpact: lazy(() => import('./ContextLengthImpact')),
  TestTimeComputeViz: lazy(() => import('./TestTimeComputeViz')),
  ComputeBudgetAllocation: lazy(() => import('./ComputeBudgetAllocation')),
  InferenceScalingCurve: lazy(() => import('./InferenceScalingCurve')),
  ScalingStrategyComparison: lazy(() => import('./ScalingStrategyComparison')),
  ReasoningModelComparison: lazy(() => import('./ReasoningModelComparison')),
  ReasoningVsStandardViz: lazy(() => import('./ReasoningVsStandardViz')),
  TreeOfThoughtViz: lazy(() => import('./TreeOfThoughtViz')),
  ToTvsCOT: lazy(() => import('./ToTvsCOT')),
  NeurosymbolicArchViz: lazy(() => import('./NeurosymbolicArchViz')),
  SymbolicVsNeuralDemo: lazy(() => import('./SymbolicVsNeuralDemo')),
  CompoundSystemViz: lazy(() => import('./CompoundSystemViz')),
  SystemCompositionDemo: lazy(() => import('./SystemCompositionDemo')),
  MoALayerViz: lazy(() => import('./MoALayerViz')),
  MoAvsingle: lazy(() => import('./MoAvsingle')),
  AgenticRAGViz: lazy(() => import('./AgenticRAGViz')),
  AgenticVsNaiveRAG: lazy(() => import('./AgenticVsNaiveRAG')),
  CRAGFlowViz: lazy(() => import('./CRAGFlowViz')),
  RelevanceGatingDemo: lazy(() => import('./RelevanceGatingDemo')),
  SelfRAGFlowViz: lazy(() => import('./SelfRAGFlowViz')),
  ReflectionTokenDemo: lazy(() => import('./ReflectionTokenDemo')),
  GraphRAGViz: lazy(() => import('./GraphRAGViz')),
  GraphVsVectorRAG: lazy(() => import('./GraphVsVectorRAG')),
  RAPTORTreeViz: lazy(() => import('./RAPTORTreeViz')),
  TreeTraversalDemo: lazy(() => import('./TreeTraversalDemo')),
  HyDEPipelineViz: lazy(() => import('./HyDEPipelineViz')),
  HyDEvsDirectSearch: lazy(() => import('./HyDEvsDirectSearch')),
  ColBERTInteractionViz: lazy(() => import('./ColBERTInteractionViz')),
  ColBERTvsDenseRetrieval: lazy(() => import('./ColBERTvsDenseRetrieval')),
  RerankingPipelineViz: lazy(() => import('./RerankingPipelineViz')),
  CrossEncoderVsBiEncoder: lazy(() => import('./CrossEncoderVsBiEncoder')),
  LateChunkingViz: lazy(() => import('./LateChunkingViz')),
  LateVsEarlyChunking: lazy(() => import('./LateVsEarlyChunking')),
  MatryoshkaDimViz: lazy(() => import('./MatryoshkaDimViz')),
  DimensionTruncationDemo: lazy(() => import('./DimensionTruncationDemo')),
  QueryDecompViz: lazy(() => import('./QueryDecompViz')),
  MultiStepRetrievalDemo: lazy(() => import('./MultiStepRetrievalDemo')),

  // === Quiz Components (Common Misconceptions) ===
  Quiz3DParallelism: lazy(() => import('./Quiz3DParallelism')),
  QuizAIAgents: lazy(() => import('./QuizAIAgents')),
  QuizAISandbagging: lazy(() => import('./QuizAISandbagging')),
  QuizALiBi: lazy(() => import('./QuizALiBi')),
  QuizActivationFunctions: lazy(() => import('./QuizActivationFunctions')),
  QuizAdamOptimizer: lazy(() => import('./QuizAdamOptimizer')),
  QuizAdapters: lazy(() => import('./QuizAdapters')),
  QuizAdversarialRobustness: lazy(() => import('./QuizAdversarialRobustness')),
  QuizAgenticRAG: lazy(() => import('./QuizAgenticRAG')),
  QuizAlignmentProblem: lazy(() => import('./QuizAlignmentProblem')),
  QuizAttentionSinks: lazy(() => import('./QuizAttentionSinks')),
  QuizAutoregressiveGeneration: lazy(() => import('./QuizAutoregressiveGeneration')),
  QuizBackpropagation: lazy(() => import('./QuizBackpropagation')),
  QuizBenchmarkContamination: lazy(() => import('./QuizBenchmarkContamination')),
  QuizBenchmarks: lazy(() => import('./QuizBenchmarks')),
  QuizBiasFairness: lazy(() => import('./QuizBiasFairness')),
  QuizByteLatentTransformers: lazy(() => import('./QuizByteLatentTransformers')),
  QuizBytePairEncoding: lazy(() => import('./QuizBytePairEncoding')),
  QuizCatastrophicForgetting: lazy(() => import('./QuizCatastrophicForgetting')),
  QuizCausalAttention: lazy(() => import('./QuizCausalAttention')),
  QuizChatbotArena: lazy(() => import('./QuizChatbotArena')),
  QuizChunkingStrategies: lazy(() => import('./QuizChunkingStrategies')),
  QuizCircuitBreakers: lazy(() => import('./QuizCircuitBreakers')),
  QuizCoTTraining: lazy(() => import('./QuizCoTTraining')),
  QuizColBERT: lazy(() => import('./QuizColBERT')),
  QuizCompoundAI: lazy(() => import('./QuizCompoundAI')),
  QuizConstitutionalAI: lazy(() => import('./QuizConstitutionalAI')),
  QuizConstrainedDecoding: lazy(() => import('./QuizConstrainedDecoding')),
  QuizContextExtension: lazy(() => import('./QuizContextExtension')),
  QuizContextWindow: lazy(() => import('./QuizContextWindow')),
  QuizContinuousBatching: lazy(() => import('./QuizContinuousBatching')),
  QuizCorrectiveRAG: lazy(() => import('./QuizCorrectiveRAG')),
  QuizCrossEntropyLoss: lazy(() => import('./QuizCrossEntropyLoss')),
  QuizCurriculumLearning: lazy(() => import('./QuizCurriculumLearning')),
  QuizDPO: lazy(() => import('./QuizDPO')),
  QuizDataMixing: lazy(() => import('./QuizDataMixing')),
  QuizDataParallelism: lazy(() => import('./QuizDataParallelism')),
  QuizDifferentialTransformer: lazy(() => import('./QuizDifferentialTransformer')),
  QuizDistillationReasoning: lazy(() => import('./QuizDistillationReasoning')),
  QuizEmbeddingsVectorDB: lazy(() => import('./QuizEmbeddingsVectorDB')),
  QuizEmergentAbilities: lazy(() => import('./QuizEmergentAbilities')),
  QuizEncoderDecoder: lazy(() => import('./QuizEncoderDecoder')),
  QuizEvaluationMetrics: lazy(() => import('./QuizEvaluationMetrics')),
  QuizExpertParallelism: lazy(() => import('./QuizExpertParallelism')),
  QuizFeedForwardNetworks: lazy(() => import('./QuizFeedForwardNetworks')),
  QuizFlashAttention: lazy(() => import('./QuizFlashAttention')),
  QuizFullVsPEFT: lazy(() => import('./QuizFullVsPEFT')),
  QuizFunctionCalling: lazy(() => import('./QuizFunctionCalling')),
  QuizGRPO: lazy(() => import('./QuizGRPO')),
  QuizGoodhartsLaw: lazy(() => import('./QuizGoodhartsLaw')),
  QuizGradientCheckpointing: lazy(() => import('./QuizGradientCheckpointing')),
  QuizGradientClipping: lazy(() => import('./QuizGradientClipping')),
  QuizGraphRAG: lazy(() => import('./QuizGraphRAG')),
  QuizGrokking: lazy(() => import('./QuizGrokking')),
  QuizGroupedQueryAttention: lazy(() => import('./QuizGroupedQueryAttention')),
  QuizGuardrails: lazy(() => import('./QuizGuardrails')),
  QuizHallucination: lazy(() => import('./QuizHallucination')),
  QuizHumanEvaluation: lazy(() => import('./QuizHumanEvaluation')),
  QuizHyDE: lazy(() => import('./QuizHyDE')),
  QuizICL: lazy(() => import('./QuizICL')),
  QuizInferenceScaling: lazy(() => import('./QuizInferenceScaling')),
  QuizInstructionHierarchy: lazy(() => import('./QuizInstructionHierarchy')),
  QuizJailbreaking: lazy(() => import('./QuizJailbreaking')),
  QuizKVCache: lazy(() => import('./QuizKVCache')),
  QuizKVCacheCompression: lazy(() => import('./QuizKVCacheCompression')),
  QuizKnowledgeDistillation: lazy(() => import('./QuizKnowledgeDistillation')),
  QuizLLMAsJudge: lazy(() => import('./QuizLLMAsJudge')),
  QuizLateChunking: lazy(() => import('./QuizLateChunking')),
  QuizLayerNormalization: lazy(() => import('./QuizLayerNormalization')),
  QuizLearningRateScheduling: lazy(() => import('./QuizLearningRateScheduling')),
  QuizLoRA: lazy(() => import('./QuizLoRA')),
  QuizLogitsAndSoftmax: lazy(() => import('./QuizLogitsAndSoftmax')),
  QuizMCP: lazy(() => import('./QuizMCP')),
  QuizMachineUnlearning: lazy(() => import('./QuizMachineUnlearning')),
  QuizMatryoshka: lazy(() => import('./QuizMatryoshka')),
  QuizMechInterp: lazy(() => import('./QuizMechInterp')),
  QuizMedusa: lazy(() => import('./QuizMedusa')),
  QuizMemorySystems: lazy(() => import('./QuizMemorySystems')),
  QuizMixedPrecisionTraining: lazy(() => import('./QuizMixedPrecisionTraining')),
  QuizMixtureOfDepths: lazy(() => import('./QuizMixtureOfDepths')),
  QuizMixtureOfExperts: lazy(() => import('./QuizMixtureOfExperts')),
  QuizMoA: lazy(() => import('./QuizMoA')),
  QuizModelCollapse: lazy(() => import('./QuizModelCollapse')),
  QuizModelMerging: lazy(() => import('./QuizModelMerging')),
  QuizModelRouting: lazy(() => import('./QuizModelRouting')),
  QuizModelServing: lazy(() => import('./QuizModelServing')),
  QuizMultiAgent: lazy(() => import('./QuizMultiAgent')),
  QuizMultiHeadAttention: lazy(() => import('./QuizMultiHeadAttention')),
  QuizMultiLoRA: lazy(() => import('./QuizMultiLoRA')),
  QuizMultiTokenPred: lazy(() => import('./QuizMultiTokenPred')),
  QuizMultimodal: lazy(() => import('./QuizMultimodal')),
  QuizNeurosymbolic: lazy(() => import('./QuizNeurosymbolic')),
  QuizNextTokenPrediction: lazy(() => import('./QuizNextTokenPrediction')),
  QuizPagedAttention: lazy(() => import('./QuizPagedAttention')),
  QuizPerplexity: lazy(() => import('./QuizPerplexity')),
  QuizPipelineParallelism: lazy(() => import('./QuizPipelineParallelism')),
  QuizPositionalEncoding: lazy(() => import('./QuizPositionalEncoding')),
  QuizPreTraining: lazy(() => import('./QuizPreTraining')),
  QuizPreferenceLearning: lazy(() => import('./QuizPreferenceLearning')),
  QuizPrefillDecode: lazy(() => import('./QuizPrefillDecode')),
  QuizPrefixCaching: lazy(() => import('./QuizPrefixCaching')),
  QuizProcessRewardModels: lazy(() => import('./QuizProcessRewardModels')),
  QuizPromptCompression: lazy(() => import('./QuizPromptCompression')),
  QuizPromptEngineering: lazy(() => import('./QuizPromptEngineering')),
  QuizPromptInjection: lazy(() => import('./QuizPromptInjection')),
  QuizQLoRA: lazy(() => import('./QuizQLoRA')),
  QuizQuantization: lazy(() => import('./QuizQuantization')),
  QuizQueryDecomp: lazy(() => import('./QuizQueryDecomp')),
  QuizRAG: lazy(() => import('./QuizRAG')),
  QuizRAPTOR: lazy(() => import('./QuizRAPTOR')),
  QuizRLAIF: lazy(() => import('./QuizRLAIF')),
  QuizRLHF: lazy(() => import('./QuizRLHF')),
  QuizRLVR: lazy(() => import('./QuizRLVR')),
  QuizReActPattern: lazy(() => import('./QuizReActPattern')),
  QuizReasoningModels: lazy(() => import('./QuizReasoningModels')),
  QuizRedTeaming: lazy(() => import('./QuizRedTeaming')),
  QuizRejectionSampling: lazy(() => import('./QuizRejectionSampling')),
  QuizRepEngineering: lazy(() => import('./QuizRepEngineering')),
  QuizReranking: lazy(() => import('./QuizReranking')),
  QuizResidualConnections: lazy(() => import('./QuizResidualConnections')),
  QuizRewardHacking: lazy(() => import('./QuizRewardHacking')),
  QuizRewardModeling: lazy(() => import('./QuizRewardModeling')),
  QuizRingAttention: lazy(() => import('./QuizRingAttention')),
  QuizRoPE: lazy(() => import('./QuizRoPE')),
  QuizSFT: lazy(() => import('./QuizSFT')),
  QuizSSM: lazy(() => import('./QuizSSM')),
  QuizSamplingStrategies: lazy(() => import('./QuizSamplingStrategies')),
  QuizScalableOversight: lazy(() => import('./QuizScalableOversight')),
  QuizScalingLaws: lazy(() => import('./QuizScalingLaws')),
  QuizSelfAttention: lazy(() => import('./QuizSelfAttention')),
  QuizSelfPlay: lazy(() => import('./QuizSelfPlay')),
  QuizSelfRAG: lazy(() => import('./QuizSelfRAG')),
  QuizSelfReflection: lazy(() => import('./QuizSelfReflection')),
  QuizSleeperAgents: lazy(() => import('./QuizSleeperAgents')),
  QuizSlidingWindowAttention: lazy(() => import('./QuizSlidingWindowAttention')),
  QuizSparseAttention: lazy(() => import('./QuizSparseAttention')),
  QuizSpecGaming: lazy(() => import('./QuizSpecGaming')),
  QuizSpecialTokens: lazy(() => import('./QuizSpecialTokens')),
  QuizSpeculativeDecoding: lazy(() => import('./QuizSpeculativeDecoding')),
  QuizStructuredOutput: lazy(() => import('./QuizStructuredOutput')),
  QuizSycophancy: lazy(() => import('./QuizSycophancy')),
  QuizSyntheticData: lazy(() => import('./QuizSyntheticData')),
  QuizTensorParallelism: lazy(() => import('./QuizTensorParallelism')),
  QuizTestTimeCompute: lazy(() => import('./QuizTestTimeCompute')),
  QuizThroughputLatency: lazy(() => import('./QuizThroughputLatency')),
  QuizTokenEmbeddings: lazy(() => import('./QuizTokenEmbeddings')),
  QuizTokenization: lazy(() => import('./QuizTokenization')),
  QuizToxicityDetection: lazy(() => import('./QuizToxicityDetection')),
  QuizTrainingDataCuration: lazy(() => import('./QuizTrainingDataCuration')),
  QuizTransformerArchitecture: lazy(() => import('./QuizTransformerArchitecture')),
  QuizTreeOfThought: lazy(() => import('./QuizTreeOfThought')),
  QuizVLM: lazy(() => import('./QuizVLM')),
  QuizVocabularyDesign: lazy(() => import('./QuizVocabularyDesign')),
  QuizWatermarking: lazy(() => import('./QuizWatermarking')),
  QuizWeakToStrong: lazy(() => import('./QuizWeakToStrong')),
  QuizZeROFSDP: lazy(() => import('./QuizZeROFSDP')),
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
