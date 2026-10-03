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

/** Saving one note; `submit` resolves to true when saved. */
export function useAddVisitNote() {
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  /** Bumped after each save, used as a `key` to reset the input. */
  const [savedCount, setSavedCount] = useState(0);

  const submit = useCallback(async (text: string): Promise<boolean> => {
    const parsed = parseNoteText(text);
    if (!parsed.ok) {
      setError(parsed.error);
      return false;
    }
    setSaving(true);
    setError(undefined);
    try {
      await addVisitNote(parsed.text, 'manual', new Date().toISOString());
      setSavedCount((n) => n + 1);
      return true;
    } catch {
      setError('Nie udało się zapisać. Spróbuj ponownie.');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { error, saving, savedCount, submit };
}
