import { useEffect, useRef, useState } from 'react';
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
import { takeSharedFile } from './sharedFile';
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

  // Plik z systemowego „Udostępnij” (Web Share Target, tylko Chrome na Androidzie).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('shared') !== '1') return;
    url.searchParams.delete('shared');
    window.history.replaceState(null, '', url);
    void run(
      takeSharedFile().then((file) => {
        if (!file) throw new Error('Nie otrzymano pliku. Wybierz go ręcznie.');
        return importFile(file);
      }),
    );
  }, []); // tylko przy wejściu na ekran

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
            Pobierz dokument z Internetowego Konta Pacjenta (np. kartę informacyjną, wynik badania,
            e-receptę) i wskaż go poniżej. Dokument zostanie przetworzony na urządzeniu, a aplikacja
            zaproponuje wpisy.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,text/plain"
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button block disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? 'Przetwarzanie…' : 'Wybierz plik PDF'}
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
                subtitle={`${formatDate(d.date)} · wybierz, aby przetworzyć`}
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
