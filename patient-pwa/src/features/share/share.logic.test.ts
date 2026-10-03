import { describe, expect, it } from 'vitest';
import { createDemoData, lastVisitDate, type ShareSection } from '@ez/shared';
import { buildShareSnapshot, earliestDate, SECTIONS, type ShareInput } from './share.logic';

const now = '2026-10-03T18:00:00.000Z';
const d = createDemoData(now);
const data: ShareInput['data'] = {
  ...d,
  photos: [
    { id: 'p1', blob: new Blob(['x']), takenAt: '2026-09-20T10:00:00.000Z', category: 'skin' },
  ],
  documents: d.documents.map(({ content: _c, ...meta }) => meta),
};
const all = new Set<ShareSection>(SECTIONS.map((s) => s.id));
const input = (over: Partial<ShareInput> = {}): ShareInput => ({
  profile: d.profile,
  data,
  sections: all,
  since: lastVisitDate(d.visits, now)!,
  range: { from: earliestDate(data, '2026-10-03'), to: '2026-10-03' },
  thumbnails: new Map([['p1', 'data:image/jpeg;base64,AAAA']]),
  now,
  ...over,
});

describe('buildShareSnapshot', () => {
  it('sends everything when all sections are on', () => {
    const s = buildShareSnapshot(input());
    expect(s.omitted).toEqual([]);
    expect(s.medications).toHaveLength(d.medications.length);
    expect(s.photos).toEqual([
      expect.objectContaining({ id: 'p1', thumbnailDataUrl: 'data:image/jpeg;base64,AAAA' }),
    ]);
    expect(s.photos[0]).not.toHaveProperty('blob');
    expect(s.summary.symptoms.length).toBeGreaterThan(0);
  });

  it('removes an unchecked section from the history and from the summary', () => {
    const sections = new Set(all);
    sections.delete('symptoms');
    sections.delete('medications');
    sections.delete('photos');
    const s = buildShareSnapshot(input({ sections }));
    expect(s.symptoms).toEqual([]);
    expect(s.summary.symptoms).toEqual([]);
    expect(s.medications).toEqual([]);
    expect(s.intakes).toEqual([]);
    expect(s.summary.medsStarted).toEqual([]);
    expect(s.summary.adherence).toEqual({ taken: 0, skipped: 0 });
    expect(s.photos).toEqual([]);
    expect(s.summary.newPhotos).toEqual([]);
    expect(s.omitted).toEqual(['medications', 'symptoms', 'photos']);
    expect(JSON.stringify(s)).not.toContain('zawroty');
  });

  it('limits history to the range but keeps medications still taken', () => {
    const s = buildShareSnapshot(input({ range: { from: '2026-09-01', to: '2026-10-03' } }));
    expect(s.exams.every((e) => e.date >= '2026-09-01')).toBe(true);
    expect(s.medications.map((m) => m.name)).toContain('Suplement z grzybów');
    expect(s.medications.map((m) => m.name)).not.toContain('Xarelto');
  });

  it('sends only open "powiem lekarzowi" items', () => {
    expect(buildShareSnapshot(input()).visitNoteItems.every((n) => !n.discussed)).toBe(true);
  });
});
