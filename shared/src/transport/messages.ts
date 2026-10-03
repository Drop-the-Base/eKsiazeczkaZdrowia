import type { PeerMessage, QrPayload, ServerMessage } from '../contracts.js';
import type { ShareSnapshot } from '../types.js';

/** 512 × 64 KB = 32 MB; protects the doctor's tab from unbounded buffering. */
export const MAX_SNAPSHOT_CHUNKS = 512;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isIndex = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;

export function parsePeerMessage(v: unknown): PeerMessage | null {
  if (!isObject(v)) return null;
  switch (v.kind) {
    case 'hello':
      return isString(v.patientPublicKey)
        ? { kind: 'hello', patientPublicKey: v.patientPublicKey }
        : null;
    case 'chunk':
      return isString(v.snapshotId) &&
        isIndex(v.index) &&
        isIndex(v.total) &&
        v.index < v.total &&
        v.total <= MAX_SNAPSHOT_CHUNKS &&
        isString(v.iv) &&
        isString(v.data)
        ? {
            kind: 'chunk',
            snapshotId: v.snapshotId,
            index: v.index,
            total: v.total,
            iv: v.iv,
            data: v.data,
          }
        : null;
    case 'ack':
      return isString(v.snapshotId) && isIndex(v.index)
        ? { kind: 'ack', snapshotId: v.snapshotId, index: v.index }
        : null;
    case 'verify-mismatch':
      return { kind: 'verify-mismatch' };
    default:
      return null;
  }
}

/** Shape check only; `relay` payloads are validated separately with `parsePeerMessage`. */
export function parseServerMessage(raw: string): ServerMessage | null {
  let msg: unknown;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObject(msg) || typeof msg.type !== 'string') return null;
  switch (msg.type) {
    case 'session-created':
      return isString(msg.sessionId) && isString(msg.resumeToken) && isString(msg.expiresAt)
        ? (msg as ServerMessage)
        : null;
    case 'joined':
      return isString(msg.resumeToken) && isString(msg.expiresAt) ? (msg as ServerMessage) : null;
    case 'peer-joined':
    case 'peer-disconnected':
    case 'relay':
    case 'session-ended':
    case 'error':
      return msg as ServerMessage;
    default:
      return null;
  }
}

/** Throws a message for the patient when the scanned QR is not ours. */
export function parseQrPayload(raw: string): QrPayload {
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    throw new Error('To nie jest kod QR z aplikacji lekarza');
  }
  if (!isObject(v) || v.v !== 1 || !isString(v.sessionId) || !isString(v.doctorPublicKey)) {
    throw new Error('To nie jest kod QR z aplikacji lekarza');
  }
  return { v: 1, sessionId: v.sessionId, doctorPublicKey: v.doctorPublicKey };
}

const ARRAY_FIELDS = [
  'medications',
  'intakes',
  'symptoms',
  'diagnoses',
  'exams',
  'photos',
  'documents',
  'visitNoteItems',
  'visits',
] as const;

/** Top-level shape of a received snapshot (it was encrypted by the patient's app). */
export function isShareSnapshot(v: unknown): v is ShareSnapshot {
  return (
    isObject(v) &&
    isObject(v.summary) &&
    isObject(v.profile) &&
    isObject(v.range) &&
    ARRAY_FIELDS.every((f) => Array.isArray(v[f]))
  );
}
