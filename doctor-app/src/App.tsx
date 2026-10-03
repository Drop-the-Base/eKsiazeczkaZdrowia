import { QrScreen } from './components/QrScreen';
import { StatusScreen, type StatusScreenStatus } from './components/StatusScreen';
import { TopBar } from './components/TopBar';
import { VerifyScreen } from './components/VerifyScreen';
import { PatientView } from './patient/PatientView';
import { DemoGuide } from './demo/DemoGuide';
import { DemoPhoneProvider } from './demo/DemoPhone';
import { isDemo } from './demo/demoMode';
import { SessionProvider, useSession } from './session/SessionContext';

function Screen() {
  const { status, snapshot, code, verified } = useSession();
  if (status === 'waiting-for-patient') return <QrScreen />;
  if (code && !verified) return <VerifyScreen code={code} />;
  if (status === 'received' && snapshot) return <PatientView snapshot={snapshot} />;
  // 'ended' / 'expired' reload the tab (useDoctorSession), so they are never rendered.
  const shown: StatusScreenStatus =
    status === 'received'
      ? 'transferring'
      : status === 'ended' || status === 'expired'
        ? 'connecting'
        : status;
  return <StatusScreen status={shown} />;
}

function Page() {
  return (
    <>
      <TopBar />
      <main>
        <Screen />
      </main>
    </>
  );
}

export function App() {
  return (
    <SessionProvider>
      {isDemo ? (
        <DemoPhoneProvider>
          <Page />
          <DemoGuide />
        </DemoPhoneProvider>
      ) : (
        <Page />
      )}
    </SessionProvider>
  );
}
