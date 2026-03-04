/**
 * Remark plugin that extracts metadata from the markdown body
 * since the source files have no YAML frontmatter.
 *
 * Extracts: title (h1), summary (One-Line Summary), prerequisites.
 * REMOVES those nodes from the tree so they don't render in the body.
 */
import { toString } from 'mdast-util-to-string';

export function remarkExtractMetadata() {
  return function (tree, file) {
    const frontmatter = {};

    // First pass: extract metadata, mark nodes for removal
    const indicesToRemove = new Set();

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];

      // Extract title from first h1
      if (node.type === 'heading' && node.depth === 1 && !frontmatter.title) {
        frontmatter.title = toString(node);
        indicesToRemove.add(i);
        continue;
      }

      // Extract One-Line Summary and Prerequisites
      if (node.type === 'paragraph' && node.children) {
        const text = toString(node);

        if (text.startsWith('One-Line Summary:') && !frontmatter.summary) {
          frontmatter.summary = text.replace('One-Line Summary:', '').trim();
          indicesToRemove.add(i);
          continue;
        }

        if (text.startsWith('Prerequisites:') && !frontmatter.prerequisites) {
          frontmatter.prerequisites = text.replace('Prerequisites:', '').trim();
          indicesToRemove.add(i);
          continue;
        }
      }
    }

    // Second pass: remove marked nodes (in reverse to preserve indices)
    const sortedIndices = [...indicesToRemove].sort((a, b) => b - a);
    for (const idx of sortedIndices) {
      tree.children.splice(idx, 1);
    }

    // Extract module from file path
    const filePath = file.history[0] || '';
    const moduleMatch = filePath.match(/(\d{2})-([^/]+)\//);
    if (moduleMatch) {
      frontmatter.moduleNumber = moduleMatch[1];
      frontmatter.moduleSlug = moduleMatch[2];
    }

    // Inject into Astro frontmatter
    if (!file.data.astro) {
      file.data.astro = {};
    }
    file.data.astro.frontmatter = {
      ...file.data.astro.frontmatter,
      ...frontmatter,
    };
  };
}
