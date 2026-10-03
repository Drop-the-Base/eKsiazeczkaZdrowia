import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import {
  connect,
  createDemoSnapshot,
  createSession,
  type ShareSnapshot,
  type SocketLike,
  type TransportStatus,
} from '@ez/shared';
import { createApp } from './app';
import { createVisitNoteHandler } from './llm/visit-note';
import { createQueryHandler } from './llm/query';

const cleanups: (() => void)[] = [];
afterEach(() => cleanups.splice(0).forEach((c) => c()));

async function startRelay(): Promise<string> {
  const server = createApp({
    patientDist: '/nope',
    doctorDist: '/nope',
    llmQuery: createQueryHandler(null),
    llmVisitNote: createVisitNoteHandler(null),
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
  const snapshot = createDemoSnapshot('2026-10-03T18:00:00.000Z');
  // ~200 KB photo → several 64 KB chunks
  const photo = { id: 'p1', takenAt: snapshot.createdAt, category: 'skin' as const };
  return {
    ...snapshot,
    photos: [{ ...photo, thumbnailDataUrl: `data:image/jpeg;base64,${'A'.repeat(200_000)}` }],
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
    // Nothing replays the patient's data after the session ended.
    let late: ShareSnapshot | undefined;
    doctor.onSnapshot((s) => (late = s));
    expect(late).toBeUndefined();
  });

  it('keeps the data at the doctor when the phone only disconnects', async () => {
    const url = await startRelay();
    const doctor = await createSession(url, socketFactory());
    const statuses: TransportStatus[] = [];
    doctor.onStatus((s) => statuses.push(s));
    const patient = await connect(url, doctor.qrPayload, socketFactory());
    await patient.sendSnapshot(demoSnapshot());
    patient.disconnect();
    await new Promise((r) => setTimeout(r, 200));
    expect(statuses.at(-1)).toBe('received');
  });

  it('finishes the transfer after the phone connection drops', async () => {
    const url = await startRelay();
    const doctor = await createSession(url, socketFactory());
    const received = new Promise<ShareSnapshot>((r) => doctor.onSnapshot(r));
    const phone = socketFactory();
    const patient = await connect(url, doctor.qrPayload, phone);
    cleanups.push(
      () => patient.disconnect(),
      () => doctor.close(),
    );

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

  it('aborts on the doctor side when the patient rejects the code', async () => {
    const url = await startRelay();
    const doctor = await createSession(url, socketFactory());
    const patient = await connect(url, doctor.qrPayload, socketFactory());
    await new Promise<void>((r) => doctor.onVerificationCode(() => r()));
    patient.rejectVerification();
    await waitFor(doctor.onStatus, 'error');
    await waitFor(patient.onStatus, 'error');
  });

  it('accepts the patient again after the page was reloaded, with a new code', async () => {
    const url = await startRelay();
    const doctor = await createSession(url, socketFactory());
    const codes: string[] = [];
    doctor.onVerificationCode((c) => codes.push(c));
    const first = await connect(url, doctor.qrPayload, socketFactory());
    first.disconnect();
    await new Promise((r) => setTimeout(r, 100));
    const second = await connect(url, doctor.qrPayload, socketFactory());
    await new Promise((r) => setTimeout(r, 100));
    expect(codes).toEqual([first.verificationCode, second.verificationCode]);
    const received = new Promise<ShareSnapshot>((r) => doctor.onSnapshot(r));
    await second.sendSnapshot(demoSnapshot());
    expect((await received).profile.name).toBe('Anna Kowalska');
    second.disconnect();
  });

  it('rejects a foreign QR code and an unknown session', async () => {
    const url = await startRelay();
    await expect(connect(url, 'https://example.com', socketFactory())).rejects.toThrow('kod QR');
    const doctor = await createSession(url, socketFactory());
    const forged = JSON.stringify({ ...JSON.parse(doctor.qrPayload), sessionId: 'nope' });
    await expect(connect(url, forged, socketFactory())).rejects.toThrow('Sesja nie istnieje');
  });
});
