import type { FlowDiagramDefinition } from '../../components/diagrams/types';

export const siteArchitecture = {
  id: 'site-architecture',
  title: 'From an idea to a published page',
  summary:
    'MDX content is validated by Astro, rendered to static HTML, and deployed to GitHub Pages. React Flow is hydrated only when a page contains a diagram.',
  height: 520,
  nodes: [
    {
      id: 'author',
      type: 'publication',
      position: { x: 0, y: 50 },
      data: {
        eyebrow: 'Authoring',
        label: 'MDX source',
        detail: 'Prose, metadata, and component references',
        tone: 'accent',
      },
    },
    {
      id: 'collections',
      type: 'publication',
      position: { x: 270, y: 50 },
      data: {
        eyebrow: 'Validation',
        label: 'Content collections',
        detail: 'Separate schemas for posts and papers',
      },
    },
    {
      id: 'build',
      type: 'publication',
      position: { x: 540, y: 50 },
      data: {
        eyebrow: 'Build',
        label: 'Astro',
        detail: 'Routes, metadata, RSS, and static rendering',
        tone: 'accent',
      },
    },
    {
      id: 'html',
      type: 'publication',
      position: { x: 810, y: 50 },
      data: {
        eyebrow: 'Output',
        label: 'Static publication',
        detail: 'HTML, CSS, images, and tiny page scripts',
      },
    },
    {
      id: 'pages',
      type: 'publication',
      position: { x: 1080, y: 50 },
      data: {
        eyebrow: 'Delivery',
        label: 'GitHub Pages',
        detail: 'Custom domain with no application server',
        tone: 'signal',
      },
    },
    {
      id: 'diagram',
      type: 'publication',
      position: { x: 540, y: 250 },
      data: {
        eyebrow: 'Optional island',
        label: 'React Flow',
        detail: 'Loaded only where an interactive diagram exists',
        tone: 'signal',
      },
    },
    {
      id: 'browser',
      type: 'publication',
      position: { x: 810, y: 250 },
      data: {
        eyebrow: 'Reader',
        label: 'Browser hydration',
        detail: 'Pan, zoom, select, and drag nodes',
      },
    },
  ],
  edges: [
    { id: 'author-collections', source: 'author', target: 'collections' },
    { id: 'collections-build', source: 'collections', target: 'build' },
    { id: 'build-html', source: 'build', target: 'html' },
    { id: 'html-pages', source: 'html', target: 'pages' },
    {
      id: 'build-diagram',
      source: 'build',
      target: 'diagram',
      label: 'diagram page only',
    },
    { id: 'diagram-browser', source: 'diagram', target: 'browser' },
    { id: 'browser-html', source: 'browser', target: 'html' },
  ],
} satisfies FlowDiagramDefinition;
