import { describe, expect, it } from 'vitest';
import {
  displayTag,
  formatDate,
  formatPaperNumber,
  isVisiblePublication,
  normalizeTag,
  scoreRelatedPublication,
  selectRelatedPublications,
  sortByPublishedDate,
  type PublicationLike,
} from './publications';

function entry(
  id: string,
  publishedAt: string,
  tags: string[],
  draft = false,
): PublicationLike {
  return {
    id,
    body: '',
    data: {
      publishedAt: new Date(publishedAt),
      tags,
      draft,
    },
  };
}

describe('publication utilities', () => {
  it('excludes drafts unless explicitly requested', () => {
    expect(isVisiblePublication({ draft: true })).toBe(false);
    expect(isVisiblePublication({ draft: true }, true)).toBe(true);
    expect(isVisiblePublication({ draft: false })).toBe(true);
  });

  it('sorts newest publications first without mutating the input', () => {
    const older = entry('older', '2026-01-01', []);
    const newer = entry('newer', '2026-08-22', []);
    const input = [older, newer];

    expect(sortByPublishedDate(input).map(({ id }) => id)).toEqual([
      'newer',
      'older',
    ]);
    expect(input.map(({ id }) => id)).toEqual(['older', 'newer']);
  });

  it('normalizes and displays tags consistently', () => {
    expect(normalizeTag(' Developer Experience ')).toBe('developer-experience');
    expect(displayTag('developer-experience')).toBe('Developer Experience');
  });

  it('ranks related entries by shared tags and recency', () => {
    const current = entry('current', '2026-08-22', ['Astro', 'Architecture']);
    const close = entry('close', '2026-08-20', ['Astro', 'Architecture']);
    const recent = entry('recent', '2026-08-21', ['Astro']);
    const unrelated = entry('unrelated', '2026-08-22', ['Leadership']);

    expect(
      selectRelatedPublications(current, [
        unrelated,
        recent,
        current,
        close,
      ]).map(({ id }) => id),
    ).toEqual(['close', 'recent']);
    expect(scoreRelatedPublication(['Astro'], ['ASTRO', 'DX'])).toBe(1);
  });

  it('pads white-paper numbers', () => {
    expect(formatPaperNumber(4)).toBe('04');
    expect(formatPaperNumber(14)).toBe('14');
  });

  it('formats date-only frontmatter without shifting time zones', () => {
    expect(formatDate(new Date('2026-08-22'))).toBe('Aug 22, 2026');
  });
});
