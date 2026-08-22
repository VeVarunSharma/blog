export const SITE = {
  title: 'Ve Sharma',
  description:
    'Technical notes and long-form papers about software, systems, and the craft of building.',
  url: 'https://blog.vesharma.dev',
  author: 'Ve Sharma',
  githubUrl: 'https://github.com/VeVarunSharma',
  themeStorageKey: 've-sharma-theme',
} as const;

export const NAV_ITEMS = [
  { href: '/posts/', label: 'Posts' },
  { href: '/papers/', label: 'White papers' },
  { href: '/tags/', label: 'Tags' },
  { href: '/about/', label: 'About' },
] as const;
