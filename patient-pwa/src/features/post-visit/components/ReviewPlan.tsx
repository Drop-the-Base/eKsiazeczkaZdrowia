import type { MedicationCategory } from '@ez/shared';
import { Card, formatDate } from '../../../ui';
import { CATEGORY_LABEL, CATEGORY_ORDER, describeDose, describeSchedule } from '../../meds';
import type { PostVisitPlan } from '../postVisit.logic';
import styles from './ReviewPlan.module.css';

type Props = {
  plan: PostVisitPlan;
  update: (fn: (plan: PostVisitPlan) => PostVisitPlan) => void;
};

/** Proposed changes with checkboxes; nothing is saved until the patient confirms. */
export function ReviewPlan({ plan, update }: Props) {
  const setStop = (key: string, patch: Partial<PostVisitPlan['stops'][number]>) =>
    update((p) => ({ ...p, stops: p.stops.map((s) => (s.key === key ? { ...s, ...patch } : s)) }));
  const setAdd = (key: string, patch: Partial<PostVisitPlan['adds'][number]>) =>
    update((p) => ({ ...p, adds: p.adds.map((a) => (a.key === key ? { ...a, ...patch } : a)) }));

  return (
    <>
      {plan.stops.map((s) => (
        <Card key={s.key} className={styles.card}>
          <label className={styles.head}>
            <input
              type="checkbox"
              checked={s.selected}
              disabled={!s.medicationId}
              onChange={(e) => setStop(s.key, { selected: e.target.checked })}
            />
            <span>
              <strong>Odstawić:</strong>{' '}
              {s.candidates.find((m) => m.id === s.medicationId)?.name ?? s.said}
            </span>
          </label>
          {(!s.matched || s.candidates.length > 1) && (
            <label className={styles.field}>
              {s.matched ? 'Który lek?' : `Nie znaleziono leku „${s.said}”. Wybierz z listy.`}
              <select
                value={s.medicationId ?? ''}
                onChange={(e) =>
                  setStop(s.key, {
                    medicationId: e.target.value || undefined,
                    selected: !!e.target.value,
                  })
                }
              >
                <option value="">—</option>
                {s.candidates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {describeDose(m)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={styles.field}>
            Powód
            <input value={s.reason} onChange={(e) => setStop(s.key, { reason: e.target.value })} />
          </label>
        </Card>
      ))}

      {plan.adds.map((a) => (
        <Card key={a.key} className={styles.card}>
          <label className={styles.head}>
            <input
              type="checkbox"
              checked={a.selected}
              onChange={(e) => setAdd(a.key, { selected: e.target.checked })}
            />
            <span>
              <strong>Nowy lek:</strong> {a.name} {describeDose(a)} · {describeSchedule(a.schedule)}
            </span>
          </label>
          <label className={styles.field}>
            Rodzaj
            <select
              value={a.category}
              onChange={(e) => setAdd(a.key, { category: e.target.value as MedicationCategory })}
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
        </Card>
      ))}

      {plan.followUp && (
        <Card className={styles.card}>
          <label className={styles.head}>
            <input
              type="checkbox"
              checked={plan.followUp.selected}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  followUp: p.followUp && { ...p.followUp, selected: e.target.checked },
                }))
              }
            />
            <span>
              <strong>Kontrola:</strong> {formatDate(plan.followUp.date)} – przypomnienie
            </span>
          </label>
          <label className={styles.field}>
            Data
            <input
              type="date"
              value={plan.followUp.date}
              onChange={(e) =>
                e.target.value &&
                update((p) => ({
                  ...p,
                  followUp: p.followUp && { ...p.followUp, date: e.target.value },
                }))
              }
            />
          </label>
        </Card>
      )}
    </>
  );
}
