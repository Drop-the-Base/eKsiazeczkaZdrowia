import { QrScreen } from './components/QrScreen';
import { StatusScreen } from './components/StatusScreen';
import { TopBar } from './components/TopBar';
import { PatientView } from './patient/PatientView';
import { SessionProvider, useSession } from './session/SessionContext';

function Screen() {
  const { status, snapshot } = useSession();
  if (status === 'waiting-for-patient') return <QrScreen />;
  if (status === 'received' && snapshot) return <PatientView snapshot={snapshot} />;
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
