/**
 * Remark plugin that transforms cross-references like `see filename.md`
 * into proper links. Handles patterns:
 *   - (see `filename.md`)
 *   - see `filename.md`
 *   - `filename.md` in inline text
 */
import { visit } from 'unist-util-visit';

// Build filename→slug map from all known concept files
const CONCEPT_FILES = new Map();

function ensureMap() {
  if (CONCEPT_FILES.size > 0) return;

  const modules = {
    'foundational-architecture': [
      'activation-functions', 'attention-sinks', 'autoregressive-generation',
      'byte-latent-transformers', 'causal-attention', 'differential-transformer',
      'encoder-decoder-architecture', 'feed-forward-networks',
      'grouped-query-attention', 'layer-normalization', 'logits-and-softmax',
      'mixture-of-depths', 'mixture-of-experts', 'multi-head-attention',
      'next-token-prediction', 'residual-connections', 'self-attention',
      'sliding-window-attention', 'sparse-attention', 'transformer-architecture',
    ],
    'input-representation': [
      'alibi', 'byte-pair-encoding', 'context-window', 'positional-encoding',
      'rotary-position-embedding', 'special-tokens', 'token-embeddings',
      'tokenization', 'vocabulary-design',
    ],
  };

  for (const [moduleSlug, concepts] of Object.entries(modules)) {
    for (const slug of concepts) {
      CONCEPT_FILES.set(`${slug}.md`, `/concepts/${moduleSlug}/${slug}`);
    }
  }
}

export function remarkCrossReferences() {
  return function (tree, file) {
    ensureMap();

    visit(tree, 'inlineCode', (node, index, parent) => {
      if (!parent || !node.value.endsWith('.md')) return;

      const filename = node.value;
      const url = CONCEPT_FILES.get(filename);

      if (url) {
        // Replace inline code node with a link
        const slug = filename.replace('.md', '');
        const linkNode = {
          type: 'link',
          url,
          data: {
            hProperties: {
              'data-concept': slug,
              class: 'concept-link',
            },
          },
          children: [{
            type: 'text',
            value: formatConceptName(slug),
          }],
        };

        parent.children[index] = linkNode;
      }
    });
  };
}

function formatConceptName(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
