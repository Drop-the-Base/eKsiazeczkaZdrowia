import { useState } from 'react';
import { BottomSheet, Button, formatDate } from '../../../ui';
import { saveImport, type ImportProposal, type ImportResult } from '../importApi';
import styles from '../ImportScreen.module.css';

function describe(p: ImportProposal): { title: string; detail: string } {
  switch (p.kind) {
    case 'diagnosis':
      return { title: `Choroba: ${p.item.name}`, detail: `ICD-10 ${p.item.icd10}` };
    case 'exam':
      return {
        title: `Badanie: ${p.name}`,
        detail: p.results.map((r) => `${r.name} ${r.value} ${r.unit}`).join(' · '),
      };
    case 'medication':
      return {
        title: `Lek: ${p.drug.name} ${p.drug.strength}`,
        detail: `${p.drug.activeSubstance} · ${p.drug.otc ? 'bez recepty' : 'na receptę'}`,
      };
  }
}

/** Propozycje z dokumentu – zaznaczone, do zatwierdzenia; tekst dokumentu do wglądu. */
export function ImportReview({
  result,
  onClose,
}: {
  result: ImportResult | null;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={result !== null} onClose={onClose} title={result?.document.title}>
      {result && <Body key={result.document.id} result={result} onDone={onClose} />}
    </BottomSheet>
  );
}

function Body({ result, onDone }: { result: ImportResult; onDone: () => void }) {
  const [checked, setChecked] = useState(() => result.proposals.map(() => true));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const count = checked.filter(Boolean).length;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveImport(
        result.proposals.filter((_, i) => checked[i]),
        result.document.id,
        result.document.date,
      );
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.review}>
      <p className={styles.muted}>Dokument z {formatDate(result.document.date)}</p>
      {result.proposals.length === 0 ? (
        <p>Brak nowych wpisów. Wszystkie dane z tego dokumentu są już w aplikacji.</p>
      ) : (
        <ul className={styles.proposals}>
          {result.proposals.map((p, i) => {
            const { title, detail } = describe(p);
            return (
              <li key={i}>
                <label className={styles.proposal}>
                  <input
                    type="checkbox"
                    checked={checked[i] ?? false}
                    onChange={() => setChecked(checked.map((c, j) => (j === i ? !c : c)))}
                  />
                  <span>
                    <strong>{title}</strong>
                    <span className={styles.muted}>{detail}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
      <details>
        <summary className={styles.muted}>Tekst dokumentu</summary>
        <pre className={styles.text}>{result.text}</pre>
      </details>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {result.proposals.length > 0 && (
        <Button block disabled={saving || count === 0} onClick={() => void save()}>
          {saving ? 'Zapisywanie…' : `Dodaj (${count})`}
        </Button>
      )}
    </div>
  );
}
