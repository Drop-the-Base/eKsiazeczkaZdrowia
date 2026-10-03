import { useState } from 'react';
import { resetDemoData } from '../../../db';
import { Button, Card } from '../../../ui';

/** Wczytanie danych „Pani Anny” – na hackathonie każdy może zacząć od pełnej historii. */
export function DemoDataCard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onReset = async () => {
    if (!window.confirm('Zastąpić wszystkie dane danymi demo (Pani Anna)?')) return;
    setBusy(true);
    setError(null);
    try {
      await resetDemoData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wczytać danych demo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Button variant="secondary" block onClick={onReset} disabled={busy}>
        {busy ? 'Wczytywanie…' : 'Wczytaj dane demo'}
      </Button>
      {error && <p role="alert">{error}</p>}
    </Card>
  );
}
