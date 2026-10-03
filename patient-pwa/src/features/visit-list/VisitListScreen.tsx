import { Link } from 'react-router-dom';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, formatDate } from '../../ui';
import { ABROAD_PATH } from '../abroad';
import { POST_VISIT_PATH } from '../post-visit';
import { SHARE_PATH } from '../share';
import { NoteForm } from './components/NoteForm';
import { NoteRow } from './components/NoteRow';
import { whenText } from './beforeVisit.logic';
import { useUpcomingVisit } from './useUpcomingVisit';
import { useVisitList } from './useVisitList';
import styles from './VisitListScreen.module.css';

export function VisitListScreen() {
  const list = useVisitList();
  const next = useUpcomingVisit(365);
  const upcoming = next.status === 'ready' ? next.data.upcoming : undefined;
  return (
    <>
      <PageHeader title="Wizyta" />
      <div className={styles.content}>
        {upcoming && (
          <p className={styles.next}>
            Najbliższa kontrola: <strong>{formatDate(upcoming.date)}</strong> (
            {whenText(upcoming.daysLeft)})
          </p>
        )}
        <Link to={SHARE_PATH} className={styles.share}>
          Udostępnij lekarzowi
          <span className={styles.shareHint}>
            Podsumowanie i historia leczenia, szyfrowane połączenie przez kod QR
          </span>
        </Link>
        <div className={styles.links}>
          <Link to={POST_VISIT_PATH} className={styles.secondaryLink}>
            Po wizycie
          </Link>
          <Link to={ABROAD_PATH} className={styles.secondaryLink}>
            Za granicą
          </Link>
        </div>
        <Card>
          <h2 className={styles.heading}>Do omówienia z lekarzem</h2>
          <NoteForm />
        </Card>

        {list.error && <ErrorState message={list.error} />}
        {!list.active || !list.discussed ? (
          <LoadingState />
        ) : list.active.length === 0 ? (
          <EmptyState title="Brak spraw do omówienia">
            Zapisuj pytania i obserwacje, które chcesz omówić z lekarzem. Przycisk dodawania jest
            dostępny na każdym ekranie.
          </EmptyState>
        ) : (
          <ol className={styles.list} aria-label="Do omówienia">
            {list.active.map((item, i, all) => (
              <NoteRow
                key={item.id}
                item={item}
                dataTour={i === all.length - 1 ? 'note-new' : undefined}
                onToggle={(d) => void list.toggle(item.id, d)}
                onRemove={() => void list.remove(item.id)}
              />
            ))}
          </ol>
        )}

        {list.discussed && list.discussed.length > 0 && (
          <details className={styles.discussed}>
            <summary>Omówione ({list.discussed.length})</summary>
            <ul className={styles.list}>
              {list.discussed.map((item) => (
                <NoteRow
                  key={item.id}
                  item={item}
                  onToggle={(d) => void list.toggle(item.id, d)}
                  onRemove={() => void list.remove(item.id)}
                />
              ))}
            </ul>
          </details>
        )}
      </div>
    </>
  );
}
