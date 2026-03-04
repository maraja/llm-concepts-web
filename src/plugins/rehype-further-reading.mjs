/**
 * Rehype plugin that enhances the "Further Reading" section:
 * 1. Auto-links arXiv IDs (e.g., arXiv:2309.17453) to arxiv.org
 * 2. Auto-links paper titles in quotes to Google Scholar search
 * 3. Wraps the section in a styled container
 */
import { visit } from 'unist-util-visit';

function getTextContent(node) {
  if (node.type === 'text') return node.value || '';
  if (node.children) return node.children.map(getTextContent).join('');
  return '';
}

export function rehypeFurtherReading() {
  return function (tree) {
    const children = tree.children;
    let sectionStart = -1;
    let sectionEnd = children.length;

    // Find the "Further Reading" h2 and its section bounds
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.type === 'element' && node.tagName === 'h2') {
        const text = getTextContent(node).trim().toLowerCase();
        if (text.includes('further reading') || text.includes('references')) {
          sectionStart = i;
          // Find the end (next h2 or end of doc)
          for (let j = i + 1; j < children.length; j++) {
            if (children[j].type === 'element' && children[j].tagName === 'h2') {
              sectionEnd = j;
              break;
            }
          }
          break;
        }
      }
    }

    if (sectionStart === -1) return;

    // Process list items in this section to add links
    for (let i = sectionStart + 1; i < sectionEnd; i++) {
      const node = children[i];
      if (node.type === 'element' && (node.tagName === 'ul' || node.tagName === 'ol')) {
        processListItems(node);
      }
    }

    // Wrap the section content (after the h2) in a styled div
    const sectionNodes = children.splice(sectionStart + 1, sectionEnd - sectionStart - 1);
    const wrapper = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['further-reading-section'] },
      children: sectionNodes,
    };
    children.splice(sectionStart + 1, 0, wrapper);
  };
}

function processListItems(listNode) {
  visit(listNode, 'element', (li) => {
    if (li.tagName !== 'li') return;

    const fullText = getTextContent(li);

    // 1. Try to extract arXiv ID and add link
    const arxivMatch = fullText.match(/arXiv[:\s]*(\d{4}\.\d{4,5})/i);

    // 2. Try to extract paper title (text in quotes)
    const titleMatch = fullText.match(/"([^"]{10,})"/);
    // Also try with smart quotes
    const smartTitleMatch = fullText.match(/\u201C([^\u201D]{10,})\u201D/);
    const paperTitle = titleMatch?.[1] || smartTitleMatch?.[1];

    if (arxivMatch || paperTitle) {
      // Build the link URL
      let href;
      if (arxivMatch) {
        href = `https://arxiv.org/abs/${arxivMatch[1]}`;
      } else if (paperTitle) {
        href = `https://scholar.google.com/scholar?q=${encodeURIComponent(paperTitle)}`;
      }

      // Add a link icon/button at the end of the li children
      if (href) {
        li.children.push({
          type: 'text',
          value: ' ',
        });
        li.children.push({
          type: 'element',
          tagName: 'a',
          properties: {
            href,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: ['paper-link'],
            title: arxivMatch ? `View on arXiv` : `Search on Google Scholar`,
          },
          children: [
            {
              type: 'text',
              value: arxivMatch ? '[arXiv]' : '[Scholar]',
            },
          ],
        });
      }
    }
  });
}
