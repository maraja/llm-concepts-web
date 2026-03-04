import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const concepts = defineCollection({
  loader: glob({
    pattern: '{01-foundational-architecture,02-input-representation,03-training-fundamentals,04-distributed-training}/*.md',
    base: '../research/llm-concepts',
  }),
  schema: z.object({}).passthrough(),
});

export const collections = { concepts };
