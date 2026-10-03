import { useCallback, useState } from 'react';
import { db } from '../../db';
import { todayIso, useLive } from '../../ui';
import { isCurrent } from '../meds';
import { applyPlan, parseVisitNote, type ApplyResult } from './postVisitApi';
import { buildPlan, type PostVisitPlan } from './postVisit.logic';

export type PostVisitState =
  | { step: 'input'; error?: string }
  | { step: 'reading' }
  | { step: 'review'; transcript: string; plan: PostVisitPlan; error?: string }
  | { step: 'saving' }
  | { step: 'done'; result: ApplyResult };

export function usePostVisit() {
  const [state, setState] = useState<PostVisitState>({ step: 'input' });
  const [markDiscussed, setMarkDiscussed] = useState(true);
  const meds = useLive(() => db.medications.list());
  const openItems = useLive(
    async () => (await db.visitNoteItems.list()).filter((i) => !i.discussed).length,
  );

  const read = useCallback(
    async (text: string) => {
      if (meds.status !== 'ready') return;
      setState({ step: 'reading' });
      try {
        const today = todayIso();
        const changes = await parseVisitNote(text, today);
        const current = meds.data.filter((m) => isCurrent(m, today));
        setState({ step: 'review', transcript: text, plan: buildPlan(changes, current) });
      } catch (err) {
        setState({
          step: 'input',
          error: err instanceof Error ? err.message : 'Nie udało się odczytać notatki',
        });
      }
    },
    [meds],
  );

  const updatePlan = useCallback((update: (plan: PostVisitPlan) => PostVisitPlan) => {
    setState((s) => (s.step === 'review' ? { ...s, plan: update(s.plan), error: undefined } : s));
  }, []);

  const confirm = useCallback(async () => {
    if (state.step !== 'review') return;
    const { plan, transcript } = state;
    if (plan.stops.some((s) => s.selected && !s.reason.trim())) {
      return setState({ ...state, error: 'Podaj powód odstawienia' });
    }
    setState({ step: 'saving' });
    try {
      setState({
        step: 'done',
        result: await applyPlan(plan, transcript, todayIso(), markDiscussed),
      });
    } catch {
      setState({ ...state, error: 'Nie udało się zapisać zmian. Spróbuj ponownie.' });
    }
  }, [state, markDiscussed]);

  const restart = useCallback(() => setState({ step: 'input' }), []);

  return {
    state,
    ready: meds.status === 'ready',
    openItems: openItems.status === 'ready' ? openItems.data : 0,
    markDiscussed,
    setMarkDiscussed,
    read,
    updatePlan,
    confirm,
    restart,
  };
}
