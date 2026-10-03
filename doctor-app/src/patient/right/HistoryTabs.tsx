import { useState } from 'react';
import {
  isOutOfRange,
  type ShareSection,
  type ShareSnapshot,
  type SnapshotPhoto,
} from '@ez/shared';
import { formatDate, formatNumber } from '../../format';
import { describeDose, isOmitted } from '../patient.logic';
import { rangeFlag } from './timeline.logic';
import styles from './Right.module.css';

type Tab = 'exams' | 'photos' | 'visits' | 'stopped' | 'documents';

const TABS: { id: Tab; label: string; section: ShareSection }[] = [
  { id: 'exams', label: 'Badania', section: 'exams' },
  { id: 'photos', label: 'Zdjęcia', section: 'photos' },
  { id: 'visits', label: 'Wizyty', section: 'visits' },
  { id: 'stopped', label: 'Odstawione leki', section: 'medications' },
  { id: 'documents', label: 'Dokumenty', section: 'documents' },
];

const CATEGORY = { skin: 'skóra', wound: 'rana', swelling: 'obrzęk', other: 'inne' } as const;

function Exams({ snapshot }: { snapshot: ShareSnapshot }) {
  const exams = [...snapshot.exams].sort((a, b) => b.date.localeCompare(a.date));
  if (exams.length === 0) return <p className={styles.muted}>brak</p>;
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Data</th>
          <th>Badanie</th>
          <th>Parametr</th>
          <th>Wynik</th>
          <th>Zakres</th>
        </tr>
      </thead>
      <tbody>
        {exams.flatMap((e) =>
          e.results.map((r, i) => (
            <tr key={`${e.id}-${r.name}`} className={isOutOfRange(r) ? styles.strong : undefined}>
              <td>{i === 0 ? formatDate(e.date) : ''}</td>
              <td>{i === 0 ? e.name : ''}</td>
              <td>{r.name}</td>
              <td>
                {formatNumber(r.value)} {r.unit} {rangeFlag(r)}
              </td>
              <td>
                {r.refLow !== undefined ? formatNumber(r.refLow) : ''}–
                {r.refHigh !== undefined ? formatNumber(r.refHigh) : ''}
              </td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

/** Gallery; picking two photos shows them side by side. */
function Photos({ photos }: { photos: SnapshotPhoto[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  if (photos.length === 0) return <p className={styles.muted}>brak</p>;
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)));
  const compare = picked
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is SnapshotPhoto => !!p);
  return (
    <>
      {compare.length === 2 && (
        <div className={styles.compare}>
          {compare.map((p) => (
            <figure key={p.id}>
              <img src={p.thumbnailDataUrl} alt={`Zdjęcie z ${formatDate(p.takenAt)}`} />
              <figcaption>{formatDate(p.takenAt)}</figcaption>
            </figure>
          ))}
        </div>
      )}
      <p className={styles.muted}>Wybierz dwa zdjęcia, żeby porównać je obok siebie.</p>
      <div className={styles.gallery}>
        {[...photos]
          .sort((a, b) => a.takenAt.localeCompare(b.takenAt))
          .map((p) => (
            <button
              key={p.id}
              type="button"
              className={picked.includes(p.id) ? `${styles.photo} ${styles.picked}` : styles.photo}
              onClick={() => toggle(p.id)}
            >
              <img src={p.thumbnailDataUrl} alt="" />
              <span>
                {formatDate(p.takenAt)} · {CATEGORY[p.category]}
              </span>
            </button>
          ))}
      </div>
    </>
  );
}

function Visits({ snapshot }: { snapshot: ShareSnapshot }) {
  const visits = [...snapshot.visits].sort((a, b) => b.date.localeCompare(a.date));
  if (visits.length === 0) return <p className={styles.muted}>brak</p>;
  return (
    <ul className={styles.list}>
      {visits.map((v) => (
        <li key={v.id}>
          <strong>
            {formatDate(v.date)} {[v.specialty, v.doctor].filter(Boolean).join(', ')}
          </strong>
          <p>{v.transcript}</p>
          {v.followUpDate && <p className={styles.muted}>Kontrola: {formatDate(v.followUpDate)}</p>}
        </li>
      ))}
    </ul>
  );
}

function Stopped({ snapshot }: { snapshot: ShareSnapshot }) {
  const stopped = snapshot.medications
    .filter((m) => m.endDate !== undefined)
    .sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''));
  if (stopped.length === 0) return <p className={styles.muted}>brak</p>;
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Lek</th>
          <th>Od – do</th>
          <th>Powód odstawienia</th>
        </tr>
      </thead>
      <tbody>
        {stopped.map((m) => (
          <tr key={m.id}>
            <td>
              {m.name} {describeDose(m)}
            </td>
            <td>
              {formatDate(m.startDate)} – {formatDate(m.endDate ?? '')}
            </td>
            <td>{m.stopReason ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Documents({ snapshot }: { snapshot: ShareSnapshot }) {
  if (snapshot.documents.length === 0) return <p className={styles.muted}>brak</p>;
  return (
    <ul className={styles.list}>
      {[...snapshot.documents]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((d) => (
          <li key={d.id}>
            {formatDate(d.date)} · {d.title}{' '}
            <span className={styles.muted}>({d.source === 'ikp' ? 'z IKP' : 'zdjęcie'})</span>
          </li>
        ))}
    </ul>
  );
}

export function HistoryTabs({ snapshot }: { snapshot: ShareSnapshot }) {
  const [tab, setTab] = useState<Tab>('exams');
  return (
    <section className={styles.tabs}>
      <div role="tablist" className={styles.tabList}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tab}
            className={t.id === tab ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* All panels are rendered: on screen only the selected one, in print one below another. */}
      {TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          className={t.id === tab ? styles.panel : `${styles.panel} ${styles.printOnly}`}
        >
          <h3 className={styles.panelTitle}>{t.label}</h3>
          {isOmitted(snapshot, t.section) ? (
            <p className={styles.muted}>nie udostępniono</p>
          ) : t.id === 'exams' ? (
            <Exams snapshot={snapshot} />
          ) : t.id === 'photos' ? (
            <Photos photos={snapshot.photos} />
          ) : t.id === 'visits' ? (
            <Visits snapshot={snapshot} />
          ) : t.id === 'stopped' ? (
            <Stopped snapshot={snapshot} />
          ) : (
            <Documents snapshot={snapshot} />
          )}
        </div>
      ))}
    </section>
  );
}
