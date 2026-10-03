import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, List, ListItem, LoadingState, PageHeader } from '../../ui';
import { BACKUP_PATH } from '../backup';
import { lockNow, SECURITY_PATH } from '../lock';
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
          <EmptyState title="Profil nie został utworzony">
            <Button onClick={() => setEditing(true)}>Uzupełnij profil</Button>
          </EmptyState>
        )}
        <List>
          <ListItem
            title="Leki na dziś"
            subtitle="Potwierdzanie przyjęć"
            trailing="›"
            onClick={() => navigate('/dzis')}
          />
          <ListItem
            title="Leki i suplementy"
            subtitle="Leki, suplementy i zioła"
            trailing="›"
            onClick={() => navigate('/leki')}
          />
          <ListItem
            title="Objawy"
            subtitle="Samopoczucie i dolegliwości"
            trailing="›"
            onClick={() => navigate('/objawy')}
          />
          <ListItem
            title="Badania"
            subtitle="Wyniki z normami"
            trailing="›"
            onClick={() => navigate('/badania')}
          />
          <ListItem
            title="Zdjęcia"
            subtitle="Zmiany skórne, rany, obrzęki w czasie"
            trailing="›"
            onClick={() => navigate('/zdjecia')}
          />
          <ListItem
            title="Dokumenty z IKP"
            subtitle="Import kart, wyników i e-recept"
            trailing="›"
            onClick={() => navigate('/import')}
          />
          <ListItem
            title="Kopia zapasowa"
            subtitle="Eksport i przywracanie danych"
            trailing="›"
            onClick={() => navigate(BACKUP_PATH)}
          />
          <ListItem
            title="Zabezpieczenia"
            subtitle="PIN, odcisk palca, blokada"
            trailing="›"
            onClick={() => navigate(SECURITY_PATH)}
          />
        </List>
        <DiagnosesSection />
        <Button variant="secondary" block onClick={lockNow}>
          Zablokuj aplikację
        </Button>
      </div>
      <ProfileSheet
        open={editing}
        onClose={() => setEditing(false)}
        profile={profile.status === 'ready' ? profile.data : undefined}
      />
    </>
  );
}
