import { useRef, useState } from 'react';
import type { MedicalDocument } from '@ez/shared';
import { db } from '../../db';
import {
  Button,
  Card,
  EmptyState,
  List,
  ListItem,
  LoadingState,
  PageHeader,
  formatDate,
  useLive,
} from '../../ui';
import { ImportReview } from './components/ImportReview';
import { importFile, readStoredDocument, type ImportResult } from './importApi';
import styles from './ImportScreen.module.css';

/** Import z IKP: pacjent pobiera dokument z IKP i wybiera go tutaj (albo „Udostępnij”, A28). */
export function ImportScreen() {
  const fileRef = useRef<HTMLInputElement>(null);
  const docs = useLive(async () =>
    (await db.documents.list()).filter((d) => d.source === 'ikp').reverse(),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const run = async (work: Promise<ImportResult>) => {
    setBusy(true);
    setError(null);
    try {
      setResult(await work);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się odczytać dokumentu');
    } finally {
      setBusy(false);
    }
  };

  const onFile = (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = '';
    if (file) void run(importFile(file));
  };

  return (
    <>
      <PageHeader title="Import z IKP" back="/profil" />
      <div className={styles.content}>
        <Card className={styles.how}>
          <p>
            W Internetowym Koncie Pacjenta pobierz dokument (np. kartę informacyjną, wynik badania,
            e-receptę) i wybierz go tutaj. Odczytamy go na tym telefonie i zaproponujemy wpisy.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,text/plain"
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button block disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? 'Odczytuję…' : 'Wybierz plik PDF'}
          </Button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </Card>

        <h2 className={styles.heading}>Dokumenty z IKP</h2>
        {docs.status === 'loading' ? (
          <LoadingState />
        ) : docs.data.length === 0 ? (
          <EmptyState title="Brak zaimportowanych dokumentów" />
        ) : (
          <List>
            {docs.data.map((d: MedicalDocument) => (
              <ListItem
                key={d.id}
                title={d.title}
                subtitle={`${formatDate(d.date)} · dotknij, żeby odczytać`}
                trailing="›"
                onClick={() => void run(readStoredDocument(d))}
              />
            ))}
          </List>
        )}
      </div>
      <ImportReview result={result} onClose={() => setResult(null)} />
    </>
  );
}
