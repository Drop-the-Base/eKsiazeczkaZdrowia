import {
  SNAPSHOT_CHUNK_BYTES,
  type PatientConnection,
  type ServerMessage,
  type TransportStatus,
} from '../contracts.js';
import {
  deriveSessionKey,
  encryptChunk,
  generateKeyPair,
  toBase64Url,
  verificationCode,
} from '../crypto/index.js';
import { chunkAad, splitBytes } from './chunks.js';
import { MAX_SNAPSHOT_CHUNKS, parsePeerMessage, parseQrPayload } from './messages.js';
import { openRelaySocket, type TransportOptions } from './relaySocket.js';
import { createSignal } from './signal.js';

/** Covers a full reconnect cycle of the relay socket (~15 s). */
const ACK_TIMEOUT_MS = 30_000;

interface PendingChunk {
  snapshotId: string;
  index: number;
  acked: () => void;
  resend: () => void;
  fail: (err: Error) => void;
}

/** Patient side: joins the doctor's session from the scanned QR code. */
export async function connect(
  relayUrl: string,
  qrPayload: string,
  opts: TransportOptions = {},
): Promise<PatientConnection> {
  const qr = parseQrPayload(qrPayload);
  const keys = await generateKeyPair();
  const key = await deriveSessionKey(keys, qr.doctorPublicKey);
  const code = await verificationCode(qr.doctorPublicKey, keys.publicKey);
  const status = createSignal<TransportStatus>();
  status.emit('connecting');

  let resume: { sessionId: string; resumeToken: string } | undefined;
  let pending: PendingChunk | undefined;
  let finished = false;

  return new Promise<PatientConnection>((resolve, reject) => {
    const finish = (s: TransportStatus) => {
      if (finished) return;
      finished = true;
      socket.close();
      status.emit(s);
      pending?.fail(
        new Error(s === 'expired' ? 'Sesja wygasła' : 'Połączenie z lekarzem zakończone'),
      );
    };

    const socket = openRelaySocket(relayUrl, opts, {
      onOpen(reconnect) {
        socket.send(
          reconnect && resume
            ? { type: 'resume-session', ...resume }
            : { type: 'join-session', sessionId: qr.sessionId },
        );
      },
      onReconnecting: () => status.emit('connecting'),
      onFailed() {
        reject(new Error('Nie udało się połączyć z serwerem'));
        finish('error');
      },
      onMessage: handle,
    });

    function handle(msg: ServerMessage): void {
      switch (msg.type) {
        case 'joined': {
          const first = !resume;
          resume = { sessionId: qr.sessionId, resumeToken: msg.resumeToken };
          socket.enableResume();
          if (first) {
            socket.send({
              type: 'relay',
              payload: { kind: 'hello', patientPublicKey: keys.publicKey },
            });
            status.emit('connected');
            resolve(connection);
          } else {
            status.emit(pending ? 'transferring' : 'connected');
            pending?.resend();
          }
          return;
        }
        case 'peer-joined':
          // The doctor's tab reconnected: the chunk in flight may have been lost.
          pending?.resend();
          return;
        case 'relay': {
          const p = parsePeerMessage(msg.payload);
          if (
            p?.kind === 'ack' &&
            p.snapshotId === pending?.snapshotId &&
            p.index === pending.index
          )
            pending.acked();
          if (p?.kind === 'verify-mismatch') finish('error');
          return;
        }
        case 'session-ended':
          return finish(msg.reason === 'expired' ? 'expired' : 'ended');
        case 'error':
          if (!resume) {
            reject(
              new Error(
                msg.code === 'no-session' ? 'Sesja nie istnieje albo wygasła' : msg.message,
              ),
            );
            finish('error');
          } else if (msg.code === 'no-session') {
            finish('expired');
          }
          return;
        default:
          return;
      }
    }

    function sendChunk(
      snapshotId: string,
      index: number,
      total: number,
      bytes: Uint8Array,
    ): Promise<void> {
      return new Promise<void>((done, fail) => {
        const timeout = setTimeout(
          () => fail(new Error('Brak potwierdzenia od lekarza')),
          ACK_TIMEOUT_MS,
        );
        const send = () => {
          encryptChunk(key, bytes, chunkAad(snapshotId, index, total))
            .then((c) =>
              socket.send({
                type: 'relay',
                payload: { kind: 'chunk', snapshotId, index, total, ...c },
              }),
            )
            .catch((err: unknown) =>
              fail(err instanceof Error ? err : new Error('Błąd szyfrowania')),
            );
        };
        pending = {
          snapshotId,
          index,
          acked: () => {
            clearTimeout(timeout);
            done();
          },
          resend: send,
          fail: (err) => {
            clearTimeout(timeout);
            fail(err);
          },
        };
        send();
      });
    }

    const connection: PatientConnection = {
      verificationCode: code,
      onStatus: status.on,
      async sendSnapshot(snapshot, onProgress) {
        if (finished) throw new Error('Połączenie z lekarzem zakończone');
        if (pending) throw new Error('Wysyłanie już trwa');
        const parts = splitBytes(
          new TextEncoder().encode(JSON.stringify(snapshot)),
          SNAPSHOT_CHUNK_BYTES,
        );
        if (parts.length > MAX_SNAPSHOT_CHUNKS) throw new Error('Za dużo danych do wysłania');
        const snapshotId = toBase64Url(crypto.getRandomValues(new Uint8Array(12)));
        status.emit('transferring');
        try {
          for (const [index, bytes] of parts.entries()) {
            await sendChunk(snapshotId, index, parts.length, bytes);
            onProgress?.(index + 1, parts.length);
          }
          status.emit('received');
        } catch (err) {
          if (!finished) status.emit('connected');
          throw err;
        } finally {
          pending = undefined;
        }
      },
      rejectVerification() {
        if (finished) return;
        socket.send({ type: 'relay', payload: { kind: 'verify-mismatch' } });
        socket.send({ type: 'end-session' });
        finish('error');
      },
      disconnect() {
        finish('ended');
      },
      close() {
        if (finished) return;
        socket.send({ type: 'end-session' });
        finish('ended');
      },
    };
  });
}
