import type { DoctorSession, QrPayload, ServerMessage, TransportStatus } from '../contracts.js';
import {
  decryptChunk,
  deriveSessionKey,
  generateKeyPair,
  verificationCode,
  type Key,
} from '../crypto/index.js';
import type { ShareSnapshot } from '../types.js';
import { chunkAad, joinBytes } from './chunks.js';
import { isShareSnapshot, parsePeerMessage } from './messages.js';
import { openRelaySocket, type TransportOptions } from './relaySocket.js';
import { createSignal } from './signal.js';

interface Incoming {
  id: string;
  total: number;
  parts: (Uint8Array | undefined)[];
  received: number;
}

/** Doctor side: opens a relay session and waits for the patient's encrypted snapshot. */
export async function createSession(
  relayUrl: string,
  opts: TransportOptions = {},
): Promise<DoctorSession> {
  const keys = await generateKeyPair();
  const status = createSignal<TransportStatus>();
  const code = createSignal<string>();
  const snapshot = createSignal<ShareSnapshot>();
  status.emit('connecting');

  let sessionKey: Key | undefined;
  let patientKey: string | undefined;
  let resume: { sessionId: string; resumeToken: string } | undefined;
  let incoming: Incoming | undefined;
  let finished = false;
  let queue = Promise.resolve();

  return new Promise<DoctorSession>((resolve, reject) => {
    const finish = (s: TransportStatus) => {
      if (finished) return;
      finished = true;
      sessionKey = undefined;
      incoming = undefined;
      // Signals replay their last value; the patient's data must not outlive the session.
      snapshot.clear();
      code.clear();
      socket.close();
      status.emit(s);
    };
    const abort = () => {
      socket.send({ type: 'end-session' });
      finish('error');
    };

    const socket = openRelaySocket(relayUrl, opts, {
      onOpen(reconnect) {
        socket.send(
          reconnect && resume ? { type: 'resume-session', ...resume } : { type: 'create-session' },
        );
      },
      onReconnecting: () => status.emit('connecting'),
      onFailed() {
        reject(new Error('Nie udało się połączyć z serwerem'));
        finish('error');
      },
      // Serialised: key derivation is async and must finish before the first chunk is decrypted.
      onMessage(msg) {
        queue = queue.then(() => handle(msg)).catch(abort);
      },
    });

    async function handle(msg: ServerMessage): Promise<void> {
      switch (msg.type) {
        case 'session-created': {
          resume = { sessionId: msg.sessionId, resumeToken: msg.resumeToken };
          socket.enableResume();
          status.emit('waiting-for-patient');
          const qr: QrPayload = { v: 1, sessionId: msg.sessionId, doctorPublicKey: keys.publicKey };
          resolve({
            sessionId: msg.sessionId,
            qrPayload: JSON.stringify(qr),
            expiresAt: msg.expiresAt,
            onVerificationCode: code.on,
            onSnapshot: snapshot.on,
            onStatus: status.on,
            rejectVerification() {
              socket.send({ type: 'relay', payload: { kind: 'verify-mismatch' } });
              abort();
            },
            close() {
              if (finished) return;
              socket.send({ type: 'end-session' });
              finish('ended');
            },
          });
          return;
        }
        case 'joined':
          status.emit(sessionKey ? 'connected' : 'waiting-for-patient');
          return;
        case 'session-ended':
          return finish(msg.reason === 'expired' ? 'expired' : 'ended');
        case 'error':
          if (!resume) {
            reject(new Error(msg.message));
            finish('error');
          } else if (msg.code === 'no-session') {
            finish('expired');
          }
          return;
        case 'relay':
          return handlePeer(msg.payload);
        default:
          return;
      }
    }

    async function handlePeer(payload: unknown): Promise<void> {
      const p = parsePeerMessage(payload);
      if (!p) throw new Error('Niepoprawna wiadomość od pacjenta');
      switch (p.kind) {
        case 'hello': {
          if (p.patientPublicKey === patientKey) return; // a resumed phone repeats its hello
          // A new phone key (first hello, or the patient page was reloaded): new session key and code,
          // nothing received under the previous key is kept.
          patientKey = p.patientPublicKey;
          incoming = undefined;
          snapshot.clear();
          sessionKey = await deriveSessionKey(keys, p.patientPublicKey);
          code.emit(await verificationCode(keys.publicKey, p.patientPublicKey));
          status.emit('connected');
          return;
        }
        case 'chunk': {
          if (!sessionKey) throw new Error('Kawałek przed kluczem');
          if (incoming?.id !== p.snapshotId) {
            incoming = { id: p.snapshotId, total: p.total, parts: new Array(p.total), received: 0 };
          }
          if (p.total !== incoming.total) throw new Error('Niespójna liczba kawałków');
          if (status.value !== 'transferring') status.emit('transferring');
          const bytes = await decryptChunk(sessionKey, p, chunkAad(p.snapshotId, p.index, p.total));
          if (!incoming.parts[p.index]) {
            incoming.parts[p.index] = bytes;
            incoming.received++;
          }
          socket.send({
            type: 'relay',
            payload: { kind: 'ack', snapshotId: p.snapshotId, index: p.index },
          });
          if (incoming.received < incoming.total) return;
          const data: unknown = JSON.parse(
            new TextDecoder().decode(joinBytes(incoming.parts as Uint8Array[])),
          );
          incoming = undefined;
          if (!isShareSnapshot(data)) throw new Error('Niepoprawne dane pacjenta');
          snapshot.emit(data);
          status.emit('received');
          return;
        }
        case 'verify-mismatch':
          return abort();
        case 'ack':
          return;
      }
    }
  });
}
