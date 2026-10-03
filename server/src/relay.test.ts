import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import type { ServerMessage } from '@ez/shared';
import { createApp } from './app';
import { handleVisitNote } from './llm/visit-note';
import { handleQueryStub } from './queryStub';

type Client = { ws: WebSocket; next: () => Promise<ServerMessage>; send: (m: unknown) => void };

const cleanups: (() => void)[] = [];
afterEach(() => cleanups.splice(0).forEach((c) => c()));

async function startServer(ttlMs = 60_000): Promise<string> {
  const server = createApp({
    patientDist: '/nope',
    doctorDist: '/nope',
    llmQuery: handleQueryStub,
    llmVisitNote: handleVisitNote,
    relay: { ttlMs },
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  cleanups.push(() => server.close());
  return `ws://127.0.0.1:${(server.address() as AddressInfo).port}/relay`;
}

async function connect(url: string): Promise<Client> {
  const ws = new WebSocket(url);
  const queue: ServerMessage[] = [];
  const waiters: ((m: ServerMessage) => void)[] = [];
  ws.on('message', (data) => {
    const msg = JSON.parse(String(data)) as ServerMessage;
    const w = waiters.shift();
    if (w) w(msg);
    else queue.push(msg);
  });
  await new Promise((r) => ws.on('open', r));
  cleanups.push(() => ws.terminate());
  return {
    ws,
    next: () => {
      const m = queue.shift();
      return m ? Promise.resolve(m) : new Promise((r) => waiters.push(r));
    },
    send: (m) => ws.send(JSON.stringify(m)),
  };
}

async function pair(url: string) {
  const doctor = await connect(url);
  doctor.send({ type: 'create-session' });
  const created = await doctor.next();
  if (created.type !== 'session-created') throw new Error(created.type);
  const patient = await connect(url);
  patient.send({ type: 'join-session', sessionId: created.sessionId });
  const joined = await patient.next();
  if (joined.type !== 'joined') throw new Error(joined.type);
  expect(await doctor.next()).toEqual({ type: 'peer-joined' });
  return { doctor, patient, sessionId: created.sessionId, patientToken: joined.resumeToken };
}

describe('relay', () => {
  it('forwards messages both ways', async () => {
    const { doctor, patient } = await pair(await startServer());
    patient.send({ type: 'relay', payload: { kind: 'hello', patientPublicKey: 'abc' } });
    expect(await doctor.next()).toEqual({
      type: 'relay',
      payload: { kind: 'hello', patientPublicKey: 'abc' },
    });
    doctor.send({ type: 'relay', payload: { kind: 'ack', snapshotId: 's', index: 0 } });
    expect(await patient.next()).toMatchObject({ type: 'relay', payload: { kind: 'ack' } });
  });

  it('rejects bad messages, unknown sessions and a second patient', async () => {
    const url = await startServer();
    const { sessionId } = await pair(url);
    const stranger = await connect(url);
    stranger.send({ type: 'relay', payload: 'x' });
    expect(await stranger.next()).toMatchObject({ type: 'error', code: 'bad-message' });
    stranger.send({ type: 'join-session', sessionId: 'nope' });
    expect(await stranger.next()).toMatchObject({ type: 'error', code: 'no-session' });
    stranger.send({ type: 'join-session', sessionId });
    expect(await stranger.next()).toMatchObject({ type: 'error', code: 'session-full' });
    stranger.send({ type: 'relay', payload: { kind: 'hello' } });
    expect(await stranger.next()).toMatchObject({ type: 'error', code: 'no-session' });
  });

  it('reports a missing peer before the patient joins', async () => {
    const doctor = await connect(await startServer());
    doctor.send({ type: 'create-session' });
    await doctor.next();
    doctor.send({ type: 'relay', payload: { kind: 'verify-mismatch' } });
    expect(await doctor.next()).toMatchObject({ type: 'error', code: 'no-peer' });
  });

  it('ends the session for both sides', async () => {
    const { doctor, patient } = await pair(await startServer());
    patient.send({ type: 'end-session' });
    expect(await doctor.next()).toEqual({ type: 'session-ended', reason: 'ended' });
    expect(await patient.next()).toEqual({ type: 'session-ended', reason: 'ended' });
  });

  it('expires sessions', async () => {
    const { doctor, patient } = await pair(await startServer(150));
    expect(await doctor.next()).toEqual({ type: 'session-ended', reason: 'expired' });
    expect(await patient.next()).toEqual({ type: 'session-ended', reason: 'expired' });
  });

  it('lets a dropped patient resume the session', async () => {
    const url = await startServer();
    const { doctor, patient, sessionId, patientToken } = await pair(url);
    patient.ws.close();
    expect(await doctor.next()).toEqual({ type: 'peer-disconnected' });

    const back = await connect(url);
    back.send({ type: 'resume-session', sessionId, resumeToken: 'wrong' });
    expect(await back.next()).toMatchObject({ type: 'error', code: 'no-session' });
    back.send({ type: 'resume-session', sessionId, resumeToken: patientToken });
    expect(await back.next()).toMatchObject({ type: 'joined', resumeToken: patientToken });
    expect(await back.next()).toEqual({ type: 'peer-joined' });
    expect(await doctor.next()).toEqual({ type: 'peer-joined' });

    back.send({ type: 'relay', payload: { kind: 'hello', patientPublicKey: 'k' } });
    expect(await doctor.next()).toMatchObject({ type: 'relay' });
  });
});
