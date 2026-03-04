export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatConceptName(slug: string): string {
  return slug
    .split('-')
    .map(word => {
      // Keep certain abbreviations uppercase
      const upper = ['moe', 'ffn', 'gqa', 'kv', 'llm'];
      if (upper.includes(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
