import { useState } from 'react';
import { BottomSheet, Button, formatDateTime } from '../../../ui';
import { saveProposals, type Proposal } from '../parseEntry';
import styles from './ProposalSheet.module.css';

type Props = {
  proposals: Proposal[] | null;
  onClose: () => void;
  onSaved: () => void;
};

function describe(p: Proposal): { title: string; detail: string } {
  if (p.kind === 'symptom') {
    return {
      title: `Objaw: ${p.item.name}`,
      detail: [
        `od ${formatDateTime(p.item.startedAt)}`,
        p.item.severity && `nasilenie ${p.item.severity}/5`,
      ]
        .filter(Boolean)
        .join(' · '),
    };
  }
  return {
    title: `Przyjęty lek: ${p.existing ?? p.item.name}`,
    detail: [
      formatDateTime(p.item.takenAt),
      p.existing ? 'z Twojej listy leków' : 'nowy lek doraźny na liście',
      p.item.drug?.activeSubstance,
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

/** Rozpoznane wpisy – zatwierdzenie jednym dotknięciem (można odznaczyć pomyłki). */
export function ProposalSheet({ proposals, onClose, onSaved }: Props) {
  return (
    <BottomSheet open={proposals !== null} onClose={onClose} title="Czy dobrze zrozumiałem?">
      {proposals && <Body proposals={proposals} onSaved={onSaved} />}
    </BottomSheet>
  );
}

function Body({ proposals, onSaved }: { proposals: Proposal[]; onSaved: () => void }) {
  const [checked, setChecked] = useState(() => proposals.map(() => true));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const count = checked.filter(Boolean).length;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveProposals(proposals.filter((_, i) => checked[i]));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.body}>
      <ul className={styles.list}>
        {proposals.map((p, i) => {
          const { title, detail } = describe(p);
          return (
            <li key={i}>
              <label className={styles.item}>
                <input
                  type="checkbox"
                  checked={checked[i] ?? false}
                  onChange={() => setChecked(checked.map((c, j) => (j === i ? !c : c)))}
                />
                <span>
                  <strong>{title}</strong>
                  <span className={styles.detail}>{detail}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Button block disabled={saving || count === 0} onClick={() => void save()}>
        {saving ? 'Zapisywanie…' : `Zapisz (${count})`}
      </Button>
    </div>
  );
}
