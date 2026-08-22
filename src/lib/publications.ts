import readingTime from 'reading-time';

export interface PublicationData {
  publishedAt: Date;
  tags: string[];
  draft: boolean;
}

export interface PublicationLike {
  id: string;
  body?: string;
  data: PublicationData;
}

export function isVisiblePublication(
  data: Pick<PublicationData, 'draft'>,
  includeDrafts = false,
): boolean {
  return includeDrafts || !data.draft;
}

export function sortByPublishedDate<T extends Pick<PublicationLike, 'data'>>(
  entries: T[],
): T[] {
  return [...entries].sort(
    (left, right) =>
      right.data.publishedAt.getTime() - left.data.publishedAt.getTime(),
  );
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

export function displayTag(tag: string): string {
  return tag
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getReadingMinutes(body = ''): number {
  return Math.max(1, Math.ceil(readingTime(body).minutes));
}

export function scoreRelatedPublication(
  currentTags: string[],
  candidateTags: string[],
): number {
  const current = new Set(currentTags.map(normalizeTag));
  return candidateTags.reduce(
    (score, tag) => score + (current.has(normalizeTag(tag)) ? 1 : 0),
    0,
  );
}

export function selectRelatedPublications<T extends PublicationLike>(
  current: T,
  candidates: T[],
  limit = 3,
): T[] {
  return candidates
    .filter((candidate) => candidate.id !== current.id)
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

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatPaperNumber(number: number): string {
  return String(number).padStart(2, '0');
}
