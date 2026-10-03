import type { ShareSnapshot } from '@ez/shared';
import { Link } from 'react-router-dom';
import { Button, EmptyState, LoadingState, formatDate } from '../../../ui';
import { useShareSummary } from '../useShareSummary';
import { SummaryPreview } from './SummaryPreview';
import styles from './SummaryStep.module.css';

type Props = {
  /** Next step (scanning the doctor's QR); the button is disabled until it is provided. */
  onContinue?: (snapshot: ShareSnapshot) => void;
};

export function SummaryStep({ onContinue }: Props) {
  const share = useShareSummary();
  if (share.status === 'loading') return <LoadingState />;
  if (share.status === 'no-profile' || !share.full || !share.selected) {
    return (
      <EmptyState title="Najpierw uzupełnij profil">
        Lekarz zobaczy Twoje imię, wiek i alergie. <Link to="/profil">Przejdź do profilu</Link>
      </EmptyState>
    );
  }
  const selected = share.selected;
  return (
    <div className={styles.step}>
      <p className={styles.lead}>
        Lekarz zobaczy to podsumowanie od {formatDate(share.since ?? '')} oraz Twoją historię.
        Odznacz to, czego nie chcesz pokazywać.
      </p>
      <SummaryPreview
        full={share.full}
        photoCount={share.photoCount ?? 0}
        sections={share.sections}
        onToggle={share.toggle}
      />
      <div className={styles.footer}>
        <Button block disabled={!onContinue} onClick={() => onContinue?.(selected)}>
          Dalej: zeskanuj kod lekarza
        </Button>
      </div>
    </div>
  );
}
