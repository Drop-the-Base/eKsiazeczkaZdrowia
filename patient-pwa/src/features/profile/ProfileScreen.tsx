import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, List, ListItem, LoadingState, PageHeader } from '../../ui';
import { DemoDataCard } from './components/DemoDataCard';
import { DiagnosesSection } from './components/DiagnosesSection';
import { ProfileCard } from './components/ProfileCard';
import { ProfileSheet } from './components/ProfileSheet';
import { useProfile } from './useProfile';
import styles from './ProfileScreen.module.css';

export function ProfileScreen() {
  const profile = useProfile();
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

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
        <List>
          <ListItem
            title="Leki na dziś"
            subtitle="Potwierdź: wziąłem / pominąłem"
            trailing="›"
            onClick={() => navigate('/dzis')}
          />
          <ListItem
            title="Leki i suplementy"
            subtitle="Wszystko, co przyjmujesz"
            trailing="›"
            onClick={() => navigate('/leki')}
          />
        </List>
        <DiagnosesSection />
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
