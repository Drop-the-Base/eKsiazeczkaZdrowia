import { useState } from 'react';
import { exportBackup, MIN_PASSWORD } from '../../db';
import { todayIso } from '../../ui';
import { backupFileName, validateNewPassword } from './backup.logic';

export type ExportState =
  { step: 'form'; error?: string } | { step: 'working' } | { step: 'done'; fileName: string };

/** Builds the encrypted file and hands it to the browser to save (the patient decides where). */
export function useExport() {
  const [state, setState] = useState<ExportState>({ step: 'form' });

  const run = async (password: string, repeat: string) => {
    const invalid = validateNewPassword(password, repeat, MIN_PASSWORD);
    if (invalid) return setState({ step: 'form', error: invalid });
    setState({ step: 'working' });
    try {
      const file = await exportBackup(password);
      const fileName = backupFileName(todayIso());
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(file)], { type: 'application/json' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setState({ step: 'done', fileName });
    } catch (err) {
      setState({
        step: 'form',
        error: err instanceof Error ? err.message : 'Nie udało się utworzyć kopii',
      });
    }
  };

  return { state, run, reset: () => setState({ step: 'form' }) };
}
