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
  if (share.status === 'no-profile' || !share.snapshot) {
    return (
      <EmptyState title="Najpierw uzupełnij profil">
        Podsumowanie dla lekarza obejmuje imię, wiek i alergie.{' '}
        <Link to="/profil">Przejdź do profilu</Link>
      </EmptyState>
    );
  }
  const snapshot = share.snapshot;
  return (
    <div className={styles.step} data-tour="share-sections">
      <p className={styles.lead}>
        Po zeskanowaniu kodu lekarz otrzyma pełne podsumowanie od {formatDate(share.since ?? '')}{' '}
        oraz całą historię leczenia.
      </p>
      <SummaryPreview
        snapshot={snapshot}
        photoCount={share.photoCount ?? 0}
        photosFailed={share.photosFailed ?? 0}
      />
      <div className={styles.footer}>
        <Button block disabled={!onContinue} onClick={() => onContinue?.(snapshot)}>
          Dalej: skanowanie kodu QR
        </Button>
      </div>
    </div>
  );
}
