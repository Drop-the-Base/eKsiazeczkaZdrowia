import { QrScreen } from './components/QrScreen';
import { StatusScreen } from './components/StatusScreen';
import { TopBar } from './components/TopBar';
import styles from './components/Screens.module.css';
import { SessionProvider, useSession } from './session/SessionContext';

function Screen() {
  const { status, snapshot } = useSession();
  if (status === 'waiting-for-patient') return <QrScreen />;
  // Patient view (B18) replaces this once the snapshot arrives.
  if (status === 'received' && snapshot) {
    return (
      <section className={styles.center}>
        <h1>Dane odebrane: {snapshot.profile.name}</h1>
        <p>
          Leki: {snapshot.medications.length} · badania: {snapshot.exams.length} · objawy:{' '}
          {snapshot.symptoms.length}
        </p>
      </section>
    );
  }
  return <StatusScreen status={status === 'received' ? 'transferring' : status} />;
}

export function App() {
  return (
    <SessionProvider>
      <TopBar />
      <main>
        <Screen />
      </main>
    </SessionProvider>
  );
}
