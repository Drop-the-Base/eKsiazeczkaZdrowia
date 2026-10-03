import { useState } from 'react';
import { importBackup, type ImportSummary } from '../../db';
import { scheduleNextExportReminder } from './exportReminder';

export type ImportState =
  { step: 'form'; error?: string } | { step: 'working' } | { step: 'done'; summary: ImportSummary };

/** Restores a backup file on this phone (replaces all data, encrypts it with this phone's PIN). */
export function useImport() {
  const [state, setState] = useState<ImportState>({ step: 'form' });

  const run = async (file: File | undefined, password: string, confirmed: boolean) => {
    if (!file) return setState({ step: 'form', error: 'Wybierz plik kopii' });
    if (!password) return setState({ step: 'form', error: 'Wpisz hasło kopii' });
    if (!confirmed) return setState({ step: 'form', error: 'Potwierdź zastąpienie danych' });
    setState({ step: 'working' });
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(await file.text());
      } catch {
        throw new Error('To nie jest plik kopii zapasowej Prywatna Karta Zdrowia');
      }
      const summary = await importBackup(parsed, password);
      await scheduleNextExportReminder();
      setState({ step: 'done', summary });
    } catch (err) {
      setState({
        step: 'form',
        error: err instanceof Error ? err.message : 'Nie udało się wczytać kopii',
      });
    }
  };

  return { state, run };
}
