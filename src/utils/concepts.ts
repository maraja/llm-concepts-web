import { getCollection } from 'astro:content';

/** Map content directory names to module slugs */
const MODULE_DIR_MAP: Record<string, string> = {
  '01-foundational-architecture': 'foundational-architecture',
  '02-input-representation': 'input-representation',
  '03-training-fundamentals': 'training-fundamentals',
  '04-distributed-training': 'distributed-training',
};

/** Parse a content collection ID like "01-foundational-architecture/self-attention.md"
 *  into { moduleDir, moduleSlug, conceptSlug } */
function parseConceptId(id: string) {
  // ID format: "01-module-name/concept-name.md" or possibly just "concept-name.md"
  const parts = id.replace(/\.md$/, '').split('/');
  if (parts.length >= 2) {
    const moduleDir = parts.slice(0, -1).join('/');
    const conceptSlug = parts[parts.length - 1];
    return {
      moduleDir,
      moduleSlug: MODULE_DIR_MAP[moduleDir] || moduleDir.replace(/^\d+-/, ''),
      conceptSlug,
    };
  }
  // Fallback for flat IDs
  return {
    moduleDir: '01-foundational-architecture',
    moduleSlug: 'foundational-architecture',
    conceptSlug: parts[0],
  };
}

export async function getAllConcepts() {
  const concepts = await getCollection('concepts');
  return concepts.map(concept => {
    const { moduleSlug, conceptSlug } = parseConceptId(concept.id);
    return {
      ...concept,
      slug: conceptSlug,
      moduleSlug,
      url: `/concepts/${moduleSlug}/${conceptSlug}`,
    };
  });
}

export async function getConceptBySlug(slug: string) {
  const concepts = await getAllConcepts();
  return concepts.find(c => c.slug === slug);
}

export async function getModuleConcepts(moduleSlug: string) {
  const concepts = await getAllConcepts();
  return concepts
    .filter(c => c.moduleSlug === moduleSlug)
    .sort((a, b) => {
      const orderA = getConceptOrder(moduleSlug);
      const idxA = orderA.indexOf(a.slug);
      const idxB = orderA.indexOf(b.slug);
      if (idxA === -1 && idxB === -1) return a.slug.localeCompare(b.slug);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
}

/** Get ordered concept list for prev/next navigation */
export function getConceptOrder(moduleSlug?: string): string[] {
  const orders: Record<string, string[]> = {
    'foundational-architecture': [
      'transformer-architecture',
      'self-attention',
      'multi-head-attention',
      'causal-attention',
      'grouped-query-attention',
      'sliding-window-attention',
      'sparse-attention',
      'attention-sinks',
      'differential-transformer',
      'feed-forward-networks',
      'activation-functions',
      'residual-connections',
      'layer-normalization',
      'logits-and-softmax',
      'encoder-decoder-architecture',
      'autoregressive-generation',
      'next-token-prediction',
      'mixture-of-experts',
      'mixture-of-depths',
      'byte-latent-transformers',
    ],
    'input-representation': [
      'tokenization',
      'byte-pair-encoding',
      'vocabulary-design',
      'special-tokens',
      'token-embeddings',
      'positional-encoding',
      'rotary-position-embedding',
      'alibi',
      'context-window',
    ],
    'training-fundamentals': [
      'cross-entropy-loss',
      'backpropagation',
      'adam-optimizer',
      'learning-rate-scheduling',
      'gradient-clipping',
      'mixed-precision-training',
      'gradient-checkpointing',
      'pre-training',
      'training-data-curation',
      'data-mixing',
      'curriculum-learning',
      'scaling-laws',
      'emergent-abilities',
      'grokking',
      'model-collapse',
      'catastrophic-forgetting',
      'self-play-and-self-improvement',
    ],
    'distributed-training': [
      'data-parallelism',
      'tensor-parallelism',
      'pipeline-parallelism',
      'zero-and-fsdp',
      '3d-parallelism',
      'expert-parallelism',
      'ring-attention',
    ],
  };

  if (moduleSlug && orders[moduleSlug]) {
    return orders[moduleSlug];
  }

  // Return all concepts flattened (for backwards compatibility)
  return Object.values(orders).flat();
}

export function getPrevNext(slug: string, moduleSlug: string) {
  const order = getConceptOrder(moduleSlug);
  const idx = order.indexOf(slug);
  return {
    prev: idx > 0 ? order[idx - 1] : null,
    next: idx < order.length - 1 ? order[idx + 1] : null,
  };
}
