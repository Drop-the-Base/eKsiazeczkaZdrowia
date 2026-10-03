import type { ClientMessage, PeerMessage } from '@ez/shared';

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isId = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 64;

/** Validates a message from a browser. The relay payload is end-to-end and only checked for shape. */
export function parseClientMessage(raw: string): ClientMessage | null {
  let msg: unknown;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObject(msg)) return null;
  switch (msg.type) {
    case 'create-session':
    case 'end-session':
      return { type: msg.type };
    case 'join-session':
      return isId(msg.sessionId) ? { type: 'join-session', sessionId: msg.sessionId } : null;
    case 'resume-session':
      return isId(msg.sessionId) && isId(msg.resumeToken)
        ? { type: 'resume-session', sessionId: msg.sessionId, resumeToken: msg.resumeToken }
        : null;
    case 'relay':
      // Opaque to the server: the receiving browser validates the full PeerMessage.
      return isObject(msg.payload) && typeof msg.payload.kind === 'string'
        ? { type: 'relay', payload: msg.payload as unknown as PeerMessage }
        : null;
    default:
      return null;
  }
}
