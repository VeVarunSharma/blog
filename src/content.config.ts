import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const sharedFields = {
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  image: z
    .object({
      src: z.string().min(1),
      alt: z.string().min(1),
    })
    .optional(),
  repositoryUrl: z.url().optional(),
  canonicalUrl: z.url().optional(),
};

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    ...sharedFields,
    kind: z.literal('post').default('post'),
  }),
});

const papers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/papers' }),
  schema: z.object({
    ...sharedFields,
    kind: z.literal('paper').default('paper'),
    paperNumber: z.number().int().positive(),
    abstract: z.string().min(1),
    status: z.enum(['Draft', 'Published', 'Revised']).default('Published'),
    series: z.string().optional(),
  }),
});

export const collections = { posts, papers };
