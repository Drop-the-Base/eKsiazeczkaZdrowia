import { Link } from 'react-router-dom';
import { Button, Card, LoadingState, PageHeader, formatDate } from '../../ui';
import { VoiceInput } from '../voice';
import { ReviewPlan } from './components/ReviewPlan';
import { isEmptyPlan } from './postVisit.logic';
import { usePostVisit } from './usePostVisit';
import styles from './PostVisitScreen.module.css';

export function PostVisitScreen() {
  const pv = usePostVisit();
  const { state } = pv;
  return (
    <>
      <PageHeader title="Po wizycie" />
      <div className={styles.content}>
        {state.step === 'input' && (
          <>
            <p className={styles.lead}>
              Powiedz albo wpisz, co ustalił lekarz. Do serwera trafia tylko ten tekst – bez imienia
              i historii; nagranie nie jest zapisywane.
            </p>
            <VoiceInput
              mode="postVisit"
              clearOnSubmit={false}
              disabled={!pv.ready}
              onSubmit={(t) => void pv.read(t)}
            />
            {state.error && (
              <p className={styles.error} role="alert">
                {state.error}
              </p>
            )}
          </>
        )}

        {(state.step === 'reading' || state.step === 'saving') && (
          <LoadingState
            label={state.step === 'reading' ? 'Odczytuję notatkę…' : 'Zapisuję zmiany…'}
          />
        )}

        {state.step === 'review' && (
          <>
            <Card className={styles.transcript}>„{state.transcript}”</Card>
            {isEmptyPlan(state.plan) ? (
              <p className={styles.lead}>
                Nie rozpoznano zmian w lekach ani terminu kontroli. Notatka zostanie zapisana.
              </p>
            ) : (
              <>
                <p className={styles.lead}>Sprawdź i zaznacz, co zapisać:</p>
                <ReviewPlan plan={state.plan} update={pv.updatePlan} />
              </>
            )}
            {pv.openItems > 0 && (
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={pv.markDiscussed}
                  onChange={(e) => pv.setMarkDiscussed(e.target.checked)}
                />
                Lista „powiem lekarzowi” omówiona ({pv.openItems})
              </label>
            )}
            {state.error && (
              <p className={styles.error} role="alert">
                {state.error}
              </p>
            )}
            <Button block onClick={() => void pv.confirm()}>
              Zatwierdź
            </Button>
            <Button block variant="ghost" onClick={pv.restart}>
              Popraw notatkę
            </Button>
          </>
        )}

        {state.step === 'done' && (
          <Card className={styles.done}>
            <p className={styles.success}>✓ Zapisano wizytę</p>
            {state.result.stopped.length > 0 && (
              <p>Odstawione: {state.result.stopped.join(', ')}</p>
            )}
            {state.result.added.length > 0 && <p>Nowe leki: {state.result.added.join(', ')}</p>}
            {state.result.followUp && (
              <p>Przypomnienie o kontroli: {formatDate(state.result.followUp)}</p>
            )}
            <Link to="/wizyta">Wróć do wizyty</Link>
          </Card>
        )}
      </div>
    </>
  );
}
