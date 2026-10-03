import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import {
  connect,
  createDemoData,
  createSession,
  type ShareSnapshot,
  type SocketLike,
  type TransportStatus,
} from '@ez/shared';
import { createApp } from './app';
import { handleQueryStub } from './queryStub';

const cleanups: (() => void)[] = [];
afterEach(() => cleanups.splice(0).forEach((c) => c()));

async function startRelay(): Promise<string> {
  const server = createApp({
    patientDist: '/nope',
    doctorDist: '/nope',
    llmQuery: handleQueryStub,
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  cleanups.push(() => server.close());
  return `ws://127.0.0.1:${(server.address() as AddressInfo).port}/relay`;
}

/** Records sockets so a test can drop a connection. */
function socketFactory() {
  const sockets: WebSocket[] = [];
  return {
    sockets,
    createSocket: (url: string) => {
      const ws = new WebSocket(url);
      sockets.push(ws);
      cleanups.push(() => ws.terminate());
      return ws as unknown as SocketLike;
    },
  };
}

function demoSnapshot(): ShareSnapshot {
  const now = '2026-10-03T18:00:00.000Z';
  const d = createDemoData(now);
  return {
    summary: {
      since: '2026-09-03',
      medsStarted: [],
      medsStopped: [],
      medsChanged: [],
      adherence: { taken: 60, skipped: 2 },
      symptoms: [],
      newExams: [],
      newPhotos: [],
      visitNoteItems: d.visitNoteItems,
    },
    profile: d.profile,
    medications: d.medications,
    intakes: d.intakes,
    symptoms: d.symptoms,
    diagnoses: d.diagnoses,
    exams: d.exams,
    // ~200 KB photo → several 64 KB chunks
    photos: [
      {
        id: 'p1',
        takenAt: now,
        category: 'skin',
        thumbnailDataUrl: `data:image/jpeg;base64,${'A'.repeat(200_000)}`,
      },
    ],
    documents: d.documents.map(({ content: _content, ...meta }) => meta),
    visitNoteItems: d.visitNoteItems,
    visits: d.visits,
    range: { from: '2026-07-01', to: '2026-10-03' },
    createdAt: now,
  };
}

const waitFor = (on: (cb: (s: TransportStatus) => void) => () => void, wanted: TransportStatus) =>
  new Promise<void>((resolve) => {
    const off = on((s) => {
      if (s === wanted) {
        queueMicrotask(() => off());
        resolve();
      }
    });
  });

describe('transport (doctor ↔ relay ↔ patient)', () => {
  it('delivers an encrypted snapshot in chunks with the same code on both sides', async () => {
    const url = await startRelay();
    const doctor = await createSession(url, socketFactory());
    const received = new Promise<ShareSnapshot>((r) => doctor.onSnapshot(r));
    const doctorCode = new Promise<string>((r) => doctor.onVerificationCode(r));

    const patient = await connect(url, doctor.qrPayload, socketFactory());
    expect(await doctorCode).toBe(patient.verificationCode);

    const progress: number[] = [];
    const snapshot = demoSnapshot();
    await patient.sendSnapshot(snapshot, (sent) => progress.push(sent));
    expect(progress.length).toBeGreaterThan(2);
    expect(await received).toEqual(snapshot);
    await waitFor(doctor.onStatus, 'received');

    patient.close();
    await waitFor(doctor.onStatus, 'ended');
  });

  it('finishes the transfer after the phone connection drops', async () => {
    const url = await startRelay();
    const doctor = await createSession(url, socketFactory());
    const received = new Promise<ShareSnapshot>((r) => doctor.onSnapshot(r));
    const phone = socketFactory();
    const patient = await connect(url, doctor.qrPayload, phone);

    let dropped = false;
    await patient.sendSnapshot(demoSnapshot(), () => {
      if (dropped) return;
      dropped = true;
      phone.sockets[0]!.terminate();
    });
    expect(phone.sockets.length).toBeGreaterThan(1);
    expect((await received).profile.name).toBe('Anna Kowalska');
  });

  it('aborts on the patient side when the doctor rejects the code', async () => {
    const url = await startRelay();
    const doctor = await createSession(url, socketFactory());
    const patient = await connect(url, doctor.qrPayload, socketFactory());
    await new Promise<void>((r) => doctor.onVerificationCode(() => r()));
    doctor.rejectVerification();
    await waitFor(patient.onStatus, 'error');
    await expect(patient.sendSnapshot(demoSnapshot())).rejects.toThrow();
  });

  it('rejects a foreign QR code and an unknown session', async () => {
    const url = await startRelay();
    await expect(connect(url, 'https://example.com', socketFactory())).rejects.toThrow('kod QR');
    const doctor = await createSession(url, socketFactory());
    const forged = JSON.stringify({ ...JSON.parse(doctor.qrPayload), sessionId: 'nope' });
    await expect(connect(url, forged, socketFactory())).rejects.toThrow('Sesja nie istnieje');
  });
});
