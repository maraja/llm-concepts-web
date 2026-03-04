/**
 * Rehype plugin that injects interactive element markers into the HTML AST.
 *
 * For each concept, looks up which interactive components should be placed
 * and after which h2 section they belong. Injects a <div data-interactive="...">
 * placeholder that the client-side React hydrator will mount components into.
 */
import { visit } from 'unist-util-visit';
import { interactiveRegistry } from '../data/interactive-registry.mjs';

export function rehypeInteractiveMarkers() {
  return function (tree, file) {
    // Extract concept slug from file path
    const filePath = file.history?.[0] || '';
    const match = filePath.match(/([^/]+)\.md$/);
    if (!match) return;

    const slug = match[1];
    const config = interactiveRegistry[slug];
    if (!config || config.length === 0) return;

    // Build a map: afterSection → list of component names to inject
    const sectionMap = {};
    for (const item of config) {
      if (!sectionMap[item.afterSection]) {
        sectionMap[item.afterSection] = [];
      }
      sectionMap[item.afterSection].push(item.component);
    }

    // Walk the tree to find h2 elements and inject markers after their sections
    const children = tree.children;
    const insertions = []; // { index, components[] }

    for (let i = 0; i < children.length; i++) {
      const node = children[i];

      // Check if this is an h2 element
      if (node.type === 'element' && node.tagName === 'h2') {
        // Get the text content of the heading
        const headingText = getTextContent(node).trim();

        if (sectionMap[headingText]) {
          // Find the end of this section (next h2 or end of document)
          let sectionEnd = children.length;
          for (let j = i + 1; j < children.length; j++) {
            if (children[j].type === 'element' && children[j].tagName === 'h2') {
              sectionEnd = j;
              break;
            }
          }

          // Insert markers just before the next h2 (at sectionEnd)
          insertions.push({
            index: sectionEnd,
            components: sectionMap[headingText],
          });
        }
      }
    }

    // Insert in reverse order to preserve indices
    insertions.sort((a, b) => b.index - a.index);
    for (const ins of insertions) {
      for (let c = ins.components.length - 1; c >= 0; c--) {
        const markerNode = {
          type: 'element',
          tagName: 'div',
          properties: {
            'data-interactive': ins.components[c],
            className: ['interactive-slot'],
          },
          children: [],
        };
        children.splice(ins.index, 0, markerNode);
      }
    }
  };
}

function getTextContent(node) {
  if (node.type === 'text') return node.value || '';
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}
