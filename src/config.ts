export const SITE = {
  title: 'After the Diagram',
  description:
    'Ve Sharma on AI developer platforms, cloud economics, and the engineering systems that turn technical strategy into shipped software.',
  url: 'https://blog.vesharma.dev',
  author: 'Ve Sharma',
  authorRole: 'Engineer, founder, and technical leader',
  authorUrl: 'https://www.vesharma.dev',
  githubUrl: 'https://github.com/VeVarunSharma',
  defaultTheme: 'light',
  themeStorageKey: 've-sharma-theme',
} as const;

export const NAV_ITEMS = [
  { href: '/posts/', label: 'Posts' },
  { href: '/papers/', label: 'White papers' },
  { href: '/tags/', label: 'Tags' },
  { href: '/about/', label: 'About' },
] as const;
