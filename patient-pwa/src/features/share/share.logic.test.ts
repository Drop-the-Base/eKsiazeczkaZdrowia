import { describe, expect, it } from 'vitest';
import { createDemoData, lastVisitDate } from '@ez/shared';
import { buildShareSnapshot, earliestDate, type ShareInput } from './share.logic';

const now = '2026-10-03T18:00:00.000Z';
const d = createDemoData(now);
const data: ShareInput['data'] = {
  ...d,
  photos: [
    { id: 'p1', blob: new Blob(['x']), takenAt: '2026-09-20T10:00:00.000Z', category: 'skin' },
  ],
  documents: d.documents.map(({ content: _c, ...meta }) => meta),
};
const input = (over: Partial<ShareInput> = {}): ShareInput => ({
  profile: d.profile,
  data,
  since: lastVisitDate(d.visits, now)!,
  range: { from: earliestDate(data, '2026-10-03'), to: '2026-10-03' },
  thumbnails: new Map([['p1', 'data:image/jpeg;base64,AAAA']]),
  now,
  ...over,
});

describe('buildShareSnapshot', () => {
  it('always sends the full record', () => {
    const s = buildShareSnapshot(input());
    expect(s.medications).toHaveLength(d.medications.length);
    expect(s.photos).toEqual([
      expect.objectContaining({ id: 'p1', thumbnailDataUrl: 'data:image/jpeg;base64,AAAA' }),
    ]);
    expect(s.photos[0]).not.toHaveProperty('blob');
    expect(s.summary.symptoms.length).toBeGreaterThan(0);
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
