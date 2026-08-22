import {
  getCollection,
  type CollectionEntry,
  type CollectionKey,
} from 'astro:content';
import {
  isVisiblePublication,
  normalizeTag,
  scoreRelatedPublication,
  sortByPublishedDate,
} from './publications';

export type PostEntry = CollectionEntry<'posts'>;
export type PaperEntry = CollectionEntry<'papers'>;
export type AnyPublication = PostEntry | PaperEntry;

const includeDrafts = import.meta.env.DEV;

export async function getPosts(): Promise<PostEntry[]> {
  const entries = await getCollection('posts', ({ data }) =>
    isVisiblePublication(data, includeDrafts),
  );
  return sortByPublishedDate(entries);
}

export async function getPapers(): Promise<PaperEntry[]> {
  const entries = await getCollection('papers', ({ data }) =>
    isVisiblePublication(data, includeDrafts),
  );
  return [...entries].sort(
    (left, right) => right.data.paperNumber - left.data.paperNumber,
  );
}

export async function getAllPublications(): Promise<AnyPublication[]> {
  const [posts, papers] = await Promise.all([getPosts(), getPapers()]);
  return sortByPublishedDate<AnyPublication>([...posts, ...papers]);
}

export function publicationPath(entry: AnyPublication): string {
  return entry.collection === 'posts'
    ? `/posts/${entry.id}/`
    : `/papers/${entry.id}/`;
}

export function collectionLabel(collection: CollectionKey): string {
  return collection === 'papers' ? 'White paper' : 'Post';
}

export function getAllTags(entries: AnyPublication[]): Map<string, number> {
  const tags = new Map<string, number>();

  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      const normalized = normalizeTag(tag);
      tags.set(normalized, (tags.get(normalized) ?? 0) + 1);
    }
  }

  return new Map(
    [...tags.entries()].sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function getRelatedPublications(
  current: AnyPublication,
  candidates: AnyPublication[],
  limit = 3,
): AnyPublication[] {
  return candidates
    .filter(
      (candidate) =>
        candidate.id !== current.id ||
        candidate.collection !== current.collection,
    )
    .map((candidate) => ({
      candidate,
      score: scoreRelatedPublication(current.data.tags, candidate.data.tags),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.candidate.data.publishedAt.getTime() -
          left.candidate.data.publishedAt.getTime(),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
