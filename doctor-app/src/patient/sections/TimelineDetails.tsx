import { useEffect } from 'react';
import { isOutOfRange, type TimelineData, type TimelineRef } from '@ez/shared';
import { formatDate, formatDateTime, formatNumber } from '../../format';
import { describeDose, describeSchedule, MED_GROUPS } from '../patient.logic';
import { rangeFlag } from './timeline.logic';
import styles from './TimelineDetails.module.css';

interface Props {
  selected: TimelineRef;
  data: TimelineData;
  onClose: () => void;
}

export function TimelineDetails({ selected, data, onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const content = renderContent(selected, data);
  if (!content) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-details-title"
    >
      <div className={styles.modal} data-tour="timeline-details">
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.kicker}>{content.kicker}</div>
            <h3 id="timeline-details-title" className={styles.title}>
              {content.title}
            </h3>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Zamknij szczegóły"
            data-tour="timeline-details-close"
          >
            ×
          </button>
        </div>
        <div className={styles.body}>{content.body}</div>
        <div className={styles.footer}>
          <button type="button" className={styles.button} onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}

function renderContent(
  selected: TimelineRef,
  data: TimelineData,
): { kicker: string; title: string; body: React.ReactNode } | null {
  switch (selected.entity) {
    case 'exam': {
      const e = data.exams.find((x) => x.id === selected.id);
      if (!e) return null;
      return {
        kicker: 'Badanie laboratoryjne',
        title: `${e.name} · ${formatDate(e.date)}`,
        body: (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Parametr</th>
                <th>Wynik</th>
                <th>Zakres referencyjny</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {e.results.map((r) => {
                const out = isOutOfRange(r);
                const flag = rangeFlag(r);
                return (
                  <tr key={r.name} className={out ? styles.outOfRangeRow : undefined}>
                    <td>
                      <span className={out ? styles.outOfRange : undefined}>{r.name}</span>
                    </td>
                    <td>
                      <span className={out ? styles.outOfRange : undefined}>
                        {formatNumber(r.value)} {r.unit}
                      </span>
                      {flag && <span className={styles.flag}>{flag}</span>}
                    </td>
                    <td className={styles.ref}>
                      {r.refLow !== undefined || r.refHigh !== undefined
                        ? `${r.refLow !== undefined ? formatNumber(r.refLow) : '…'} – ${r.refHigh !== undefined ? formatNumber(r.refHigh) : '…'} ${r.unit}`
                        : '—'}
                    </td>
                    <td>
                      {out ? (
                        <span className={styles.badgeAlert}>
                          {flag === '↑' ? '↑ powyżej normy' : '↓ poniżej normy'}
                        </span>
                      ) : (
                        <span className={styles.badgeNormal}>W normie</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ),
      };
    }
    case 'medication': {
      const m = data.medications.find((x) => x.id === selected.id);
      if (!m) return null;
      const group = MED_GROUPS.find((g) => g.category === m.category);
      return {
        kicker: group?.label ?? 'Preparat',
        title: `${m.name} ${describeDose(m)}`,
        body: (
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Dawkowanie:</span>
              <span className={styles.infoValue}>
                {describeDose(m)} · {describeSchedule(m.schedule)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Okres przyjmowania:</span>
              <span className={styles.infoValue}>
                {formatDate(m.startDate)} – {m.endDate ? formatDate(m.endDate) : 'nadal (aktualny)'}
              </span>
            </div>
            {m.activeSubstance && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Substancja czynna:</span>
                <span className={styles.infoValue}>{m.activeSubstance}</span>
              </div>
            )}
            {m.atcCode && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Kod ATC:</span>
                <span className={styles.infoValue}>{m.atcCode}</span>
              </div>
            )}
            {m.stopReason && (
              <div className={styles.stopAlert}>
                <strong>Powód odstawienia:</strong> {m.stopReason}
              </div>
            )}
          </div>
        ),
      };
    }
    case 'symptom': {
      const s = data.symptoms.find((x) => x.id === selected.id);
      if (!s) return null;
      return {
        kicker: 'Objaw zgłoszony przez pacjenta',
        title: s.name,
        body: (
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Data i czas:</span>
              <span className={styles.infoValue}>{formatDateTime(s.startedAt)}</span>
            </div>
            {s.severity && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nasilenie:</span>
                <span className={styles.infoValue}>{s.severity}/5</span>
              </div>
            )}
            {s.notes && (
              <div className={styles.notes}>
                <strong>Notatka pacjenta:</strong> {s.notes}
              </div>
            )}
          </div>
        ),
      };
    }
    case 'visit': {
      const v = data.visits.find((x) => x.id === selected.id);
      if (!v) return null;
      return {
        kicker: 'Wizyta lekarska',
        title: `Wizyta · ${formatDate(v.date)}`,
        body: (
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Lekarz:</span>
              <span className={styles.infoValue}>
                {v.doctor} {v.specialty ? `(${v.specialty})` : ''}
              </span>
            </div>
            {v.followUpDate && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Planowana kontrola:</span>
                <span className={styles.infoValue}>{formatDate(v.followUpDate)}</span>
              </div>
            )}
            {v.transcript && (
              <div className={styles.notes}>
                <strong>Zalecenia i podsumowanie:</strong>
                <p style={{ margin: 'var(--space-1) 0 0', whiteSpace: 'pre-wrap' }}>
                  {v.transcript}
                </p>
              </div>
            )}
          </div>
        ),
      };
    }
    case 'photo': {
      const p = data.photos.find((x) => x.id === selected.id);
      if (!p) return null;
      return {
        kicker: 'Zdjęcie pacjenta',
        title: `${p.category || 'Zdjęcie'} · ${formatDateTime(p.takenAt)}`,
        body: (
          <div>
            <img className={styles.photo} src={p.thumbnailUrl} alt={p.category || 'Zdjęcie'} />
          </div>
        ),
      };
    }
    case 'document': {
      const d = data.documents.find((x) => x.id === selected.id);
      if (!d) return null;
      return {
        kicker: 'Dokumentacja medyczna',
        title: d.title,
        body: (
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Data:</span>
              <span className={styles.infoValue}>{formatDate(d.date)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Źródło:</span>
              <span className={styles.infoValue}>
                {d.source === 'ikp' ? 'Internetowe Konto Pacjenta (IKP)' : 'Wprowadzone ręcznie'}
              </span>
            </div>
          </div>
        ),
      };
    }
    case 'intake': {
      const i = data.intakes.find((x) => x.id === selected.id);
      if (!i) return null;
      const m = data.medications.find((x) => x.id === i.medicationId);
      return {
        kicker: 'Przyjęcie dawki leku',
        title: m ? `${m.name} ${describeDose(m)}` : 'Dawka leku',
        body: (
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Zaplanowano na:</span>
              <span className={styles.infoValue}>{formatDateTime(i.scheduledAt)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status:</span>
              <span className={styles.infoValue}>
                {i.status === 'taken' ? 'Przyjęty' : 'Pominięty'}
                {i.confirmedAt && ` (potwierdzono ${formatDateTime(i.confirmedAt)})`}
              </span>
            </div>
          </div>
        ),
      };
    }
  }
}
