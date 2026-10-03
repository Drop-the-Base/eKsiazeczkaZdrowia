import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ShareSnapshot } from '@ez/shared';
import { PageHeader } from '../../ui';
import { ScanStep } from './components/ScanStep';
import { SendSteps } from './components/SendSteps';
import { SummaryStep } from './components/SummaryStep';
import { useShareSession } from './useShareSession';

/** Summary preview → scan the doctor's QR → check the code → send. */
export function ShareScreen() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<ShareSnapshot>();
  const session = useShareSession();
  const { state } = session;

  return (
    <>
      <PageHeader title="Udostępnij lekarzowi" />
      {!snapshot ? (
        <SummaryStep onContinue={setSnapshot} />
      ) : state.step === 'scan' ? (
        <ScanStep onPayload={(p) => void session.join(p)} error={state.error} />
      ) : (
        <SendSteps
          state={state}
          onSend={() => void session.send(snapshot)}
          onReject={session.rejectCode}
          onEnd={session.end}
          onRescan={session.rescan}
          onDone={() => navigate('/wizyta')}
        />
      )}
    </>
  );
}
