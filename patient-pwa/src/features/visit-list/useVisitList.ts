import { useCallback, useState } from 'react';
import { db } from '../../db';
import { useLive } from '../../ui';
import { activeItems, discussedItems, parseNoteText } from './visitList.logic';
import { addVisitNote, removeVisitNote, setDiscussed } from './visitListApi';

export function useVisitList() {
  const items = useLive(() => db.visitNoteItems.list());
  const [error, setError] = useState<string>();

  const run = useCallback(async (action: () => Promise<unknown>, message: string) => {
    setError(undefined);
    try {
      await action();
    } catch {
      setError(message);
    }
  }, []);

  return {
    active: items.status === 'ready' ? activeItems(items.data) : undefined,
    discussed: items.status === 'ready' ? discussedItems(items.data) : undefined,
    error,
    toggle: (id: string, discussed: boolean) =>
      run(() => setDiscussed(id, discussed), 'Nie udało się zapisać zmiany'),
    remove: (id: string) => run(() => removeVisitNote(id), 'Nie udało się usunąć wpisu'),
  };
}

/** Form state for adding one note; `submit` resolves to true when saved. */
export function useAddVisitNote() {
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const submit = useCallback(async (): Promise<boolean> => {
    const parsed = parseNoteText(text);
    if (!parsed.ok) {
      setError(parsed.error);
      return false;
    }
    setSaving(true);
    setError(undefined);
    try {
      await addVisitNote(parsed.text, 'manual', new Date().toISOString());
      setText('');
      return true;
    } catch {
      setError('Nie udało się zapisać. Spróbuj ponownie.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [text]);

  return { text, setText, error, saving, submit };
}
