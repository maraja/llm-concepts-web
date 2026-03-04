/**
 * Rehype plugin that wraps images in figure elements with captions,
 * and styles "Recommended visual:" placeholders as cards.
 */
import { visit } from 'unist-util-visit';

export function rehypeConceptImages() {
  return function (tree) {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'img' || !parent) return;

      const alt = node.properties?.alt || '';
      const src = node.properties?.src || '';

      // Check if the next sibling is an italic/em source attribution
      let caption = null;
      const nextIndex = index + 1;
      if (parent.children[nextIndex]) {
        const next = parent.children[nextIndex];
        // Check for <em> or <p> containing source attribution
        if (next.tagName === 'em' || (next.tagName === 'p' && next.children?.[0]?.tagName === 'em')) {
          const emNode = next.tagName === 'em' ? next : next.children[0];
          caption = emNode;
        }
      }

      // Wrap image in figure
      const figureChildren = [
        {
          type: 'element',
          tagName: 'img',
          properties: {
            src,
            alt,
            loading: 'lazy',
            class: 'concept-image',
          },
          children: [],
        },
      ];

      // Add figcaption from alt text
      if (alt) {
        figureChildren.push({
          type: 'element',
          tagName: 'figcaption',
          properties: { class: 'image-caption' },
          children: [{ type: 'text', value: alt }],
        });
      }

      const figure = {
        type: 'element',
        tagName: 'figure',
        properties: { class: 'concept-figure' },
        children: figureChildren,
      };

      parent.children[index] = figure;
    });
  };
}
