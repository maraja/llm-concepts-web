export interface ModuleInfo {
  number: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  conceptCount: number;
}

export const modules: ModuleInfo[] = [
  {
    number: '01',
    slug: 'foundational-architecture',
    title: 'Foundational Architecture',
    description: 'Core transformer components — self-attention, multi-head attention, feed-forward networks, residual connections, and architectural variants like MoE and sparse attention.',
    icon: '🏗',
    conceptCount: 20,
  },
  {
    number: '02',
    slug: 'input-representation',
    title: 'Input Representation',
    description: 'Tokenization, positional encoding, embeddings, and how text becomes numbers.',
    icon: '📝',
    conceptCount: 9,
  },
  {
    number: '03',
    slug: 'training-fundamentals',
    title: 'Training Fundamentals',
    description: 'Optimization, loss functions, scaling laws, and training data.',
    icon: '📈',
    conceptCount: 17,
  },
  {
    number: '04',
    slug: 'distributed-training',
    title: 'Distributed Training',
    description: 'Parallelism strategies and distributed systems for large-scale training.',
    icon: '🔀',
    conceptCount: 7,
  },
  {
    number: '05',
    slug: 'alignment-and-post-training',
    title: 'Alignment & Post-Training',
    description: 'RLHF, DPO, reward modeling, and preference learning.',
    icon: '🎯',
    conceptCount: 16,
  },
  {
    number: '06',
    slug: 'parameter-efficient-fine-tuning',
    title: 'Parameter-Efficient Fine-Tuning',
    description: 'LoRA, adapters, and methods for efficient model adaptation.',
    icon: '🔧',
    conceptCount: 10,
  },
  {
    number: '07',
    slug: 'inference-and-deployment',
    title: 'Inference & Deployment',
    description: 'Serving, decoding strategies, caching, and quantization.',
    icon: '🚀',
    conceptCount: 20,
  },
  {
    number: '08',
    slug: 'practical-applications',
    title: 'Practical Applications',
    description: 'RAG, agents, tool use, and prompt engineering.',
    icon: '💡',
    conceptCount: 20,
  },
  {
    number: '09',
    slug: 'safety-and-alignment',
    title: 'Safety & Alignment',
    description: 'Attacks, defenses, alignment failures, and guardrails.',
    icon: '🛡',
    conceptCount: 10,
  },
  {
    number: '10',
    slug: 'evaluation',
    title: 'Evaluation',
    description: 'Benchmarks, metrics, and evaluation methodology.',
    icon: '📊',
    conceptCount: 10,
  },
  {
    number: '11',
    slug: 'advanced-and-emerging',
    title: 'Advanced & Emerging',
    description: 'Cutting-edge research and emerging techniques.',
    icon: '🔬',
    conceptCount: 10,
  },
];

export function getModule(slug: string): ModuleInfo | undefined {
  return modules.find(m => m.slug === slug);
}

export function getModuleByNumber(num: string): ModuleInfo | undefined {
  return modules.find(m => m.number === num);
}
