import { useState } from 'react';
import { Button, EmptyState, LoadingState, PageHeader } from '../../ui';
import { DemoDataCard } from './components/DemoDataCard';
import { ProfileCard } from './components/ProfileCard';
import { ProfileSheet } from './components/ProfileSheet';
import { useProfile } from './useProfile';
import styles from './ProfileScreen.module.css';

export function ProfileScreen() {
  const profile = useProfile();
  const [editing, setEditing] = useState(false);

  return (
    <>
      <PageHeader title="Profil" />
      <div className={styles.content}>
        {profile.status === 'loading' ? (
          <LoadingState />
        ) : profile.data ? (
          <ProfileCard profile={profile.data} onEdit={() => setEditing(true)} />
        ) : (
          <EmptyState title="Nie masz jeszcze profilu">
            <Button onClick={() => setEditing(true)}>Uzupełnij profil</Button>
          </EmptyState>
        )}
        <DemoDataCard />
      </div>
      <ProfileSheet
        open={editing}
        onClose={() => setEditing(false)}
        profile={profile.status === 'ready' ? profile.data : undefined}
      />
    </>
  );
}
