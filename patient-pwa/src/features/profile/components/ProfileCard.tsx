import type { Profile } from '@ez/shared';
import { Button, Card, Chip, formatDate, todayIso } from '../../../ui';
import { ageOn } from '../profile.logic';
import styles from './ProfileCard.module.css';

export function ProfileCard({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  return (
    <Card className={styles.card}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.name}>{profile.name}</h2>
          <p className={styles.meta}>
            {formatDate(profile.birthDate)} · {ageOn(profile.birthDate, todayIso())} lat
            {profile.bloodType && ` · gr. krwi ${profile.bloodType}`}
          </p>
        </div>
        <Button variant="ghost" onClick={onEdit}>
          Edytuj
        </Button>
      </div>
      <div>
        <h3 className={styles.label}>Alergie</h3>
        {profile.allergies.length > 0 ? (
          <div className={styles.chips}>
            {profile.allergies.map((a) => (
              <Chip key={a}>{a}</Chip>
            ))}
          </div>
        ) : (
          <p className={styles.meta}>brak</p>
        )}
      </div>
    </Card>
  );
}
