import rss from '@astrojs/rss';
import { SITE } from '../config';
import {
  collectionLabel,
  getAllPublications,
  publicationPath,
} from '../lib/content';

export async function GET(context: { site: URL | undefined }) {
  const entries = await getAllPublications();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: true,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishedAt,
      link: publicationPath(entry),
      categories: [collectionLabel(entry.collection), ...entry.data.tags],
    })),
    customData: '<language>en-us</language>',
  });
}
