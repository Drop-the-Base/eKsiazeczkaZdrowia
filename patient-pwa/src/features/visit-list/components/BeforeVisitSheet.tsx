import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet, Button, formatDate, todayIso } from '../../../ui';
import { whenText } from '../beforeVisit.logic';
import { dismiss, isDismissed } from '../dismissal';
import { VISIT_PATH } from '../route';
import { useUpcomingVisit } from '../useUpcomingVisit';
import { NoteForm } from './NoteForm';
import styles from './BeforeVisitSheet.module.css';

/** Opens by itself when a follow-up visit is near: the patient's agenda, ready for the doctor. */
export function BeforeVisitSheet() {
  const navigate = useNavigate();
  const [closed, setClosed] = useState(false);
  const live = useUpcomingVisit();

  if (closed || live.status !== 'ready' || !live.data.upcoming) return null;
  const { upcoming, items } = live.data;
  const today = todayIso();
  if (isDismissed(upcoming.reminderId, today)) return null;

  const close = () => {
    dismiss(upcoming.reminderId, today);
    setClosed(true);
  };

  return (
    <BottomSheet
      open
      onClose={close}
      title={`Wizyta kontrolna ${whenText(upcoming.daysLeft)} (${formatDate(upcoming.date)})`}
    >
      <div className={styles.body}>
        {items.length > 0 ? (
          <>
            <p className={styles.lead}>Chcesz powiedzieć lekarzowi:</p>
            <ol className={styles.items}>
              {items.map((i) => (
                <li key={i.id}>{i.text}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className={styles.lead}>
            Lista na wizytę jest pusta. Coś Cię niepokoi? Zapisz to teraz.
          </p>
        )}
        <NoteForm />
        <Button
          block
          variant="secondary"
          onClick={() => {
            close();
            navigate(VISIT_PATH);
          }}
        >
          Zobacz listę
        </Button>
        <Button block variant="ghost" onClick={close}>
          Zamknij
        </Button>
      </div>
    </BottomSheet>
  );
}
