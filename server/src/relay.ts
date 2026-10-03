import { randomBytes } from 'node:crypto';
import { WebSocket } from 'ws';
import {
  SESSION_TTL_MS,
  type RelayRole,
  type ServerMessage,
  type SessionEndReason,
} from '@ez/shared';
import { parseClientMessage } from './relayMessages.js';

// Sessions live only in memory; nothing is written to disk or logged (TASKS.md T1.7).

interface Peer {
  ws?: WebSocket;
  resumeToken: string;
}

interface Session {
  id: string;
  expiresAt: string;
  timer: NodeJS.Timeout;
  doctor: Peer;
  patient?: Peer;
}

export interface RelayOptions {
  ttlMs?: number;
  maxSessions?: number;
}

const token = (bytes: number) => randomBytes(bytes).toString('base64url');

function send(ws: WebSocket | undefined, msg: ServerMessage): void {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

export function createRelay({ ttlMs = SESSION_TTL_MS, maxSessions = 1000 }: RelayOptions = {}) {
  const sessions = new Map<string, Session>();
  const membership = new Map<WebSocket, { session: Session; role: RelayRole }>();

  const peerOf = (s: Session, role: RelayRole) => (role === 'doctor' ? s.doctor : s.patient);
  const other = (role: RelayRole): RelayRole => (role === 'doctor' ? 'patient' : 'doctor');

  function attach(ws: WebSocket, session: Session, role: RelayRole) {
    membership.set(ws, { session, role });
  }

  function endSession(session: Session, reason: SessionEndReason) {
    clearTimeout(session.timer);
    sessions.delete(session.id);
    for (const peer of [session.doctor, session.patient]) {
      if (!peer?.ws) continue;
      membership.delete(peer.ws);
      send(peer.ws, { type: 'session-ended', reason });
      peer.ws.close(1000);
    }
  }

  function handleMessage(ws: WebSocket, raw: string) {
    const msg = parseClientMessage(raw);
    const error = (code: Extract<ServerMessage, { type: 'error' }>['code'], message: string) =>
      send(ws, { type: 'error', code, message });
    if (!msg) return error('bad-message', 'Niepoprawna wiadomość');
    const member = membership.get(ws);

    switch (msg.type) {
      case 'create-session': {
        if (member) return error('bad-message', 'Połączenie ma już sesję');
        if (sessions.size >= maxSessions) return error('session-full', 'Za dużo aktywnych sesji');
        const id = token(16);
        const session: Session = {
          id,
          expiresAt: new Date(Date.now() + ttlMs).toISOString(),
          timer: setTimeout(() => endSession(session, 'expired'), ttlMs),
          doctor: { ws, resumeToken: token(24) },
        };
        sessions.set(id, session);
        attach(ws, session, 'doctor');
        return send(ws, {
          type: 'session-created',
          sessionId: id,
          resumeToken: session.doctor.resumeToken,
          expiresAt: session.expiresAt,
        });
      }
      case 'join-session': {
        if (member) return error('bad-message', 'Połączenie ma już sesję');
        const session = sessions.get(msg.sessionId);
        if (!session) return error('no-session', 'Sesja nie istnieje albo wygasła');
        // A disconnected patient (e.g. the page was reloaded) may be replaced; the doctor re-checks the code.
        if (session.patient?.ws) return error('session-full', 'Do sesji dołączył już pacjent');
        session.patient = { ws, resumeToken: token(24) };
        attach(ws, session, 'patient');
        send(ws, {
          type: 'joined',
          resumeToken: session.patient.resumeToken,
          expiresAt: session.expiresAt,
        });
        return send(session.doctor.ws, { type: 'peer-joined' });
      }
      case 'resume-session': {
        if (member) return error('bad-message', 'Połączenie ma już sesję');
        const session = sessions.get(msg.sessionId);
        const role = !session
          ? undefined
          : session.doctor.resumeToken === msg.resumeToken
            ? 'doctor'
            : session.patient?.resumeToken === msg.resumeToken
              ? 'patient'
              : undefined;
        if (!session || !role) return error('no-session', 'Sesja nie istnieje albo wygasła');
        const peer = peerOf(session, role)!;
        if (peer.ws && peer.ws !== ws) {
          membership.delete(peer.ws);
          peer.ws.close(4000);
        }
        peer.ws = ws;
        attach(ws, session, role);
        send(ws, { type: 'joined', resumeToken: peer.resumeToken, expiresAt: session.expiresAt });
        const otherPeer = peerOf(session, other(role));
        if (otherPeer?.ws) {
          send(ws, { type: 'peer-joined' });
          send(otherPeer.ws, { type: 'peer-joined' });
        }
        return;
      }
      case 'relay': {
        if (!member) return error('no-session', 'Brak sesji');
        const target = peerOf(member.session, other(member.role))?.ws;
        if (target?.readyState !== WebSocket.OPEN)
          return error('no-peer', 'Druga strona nie jest połączona');
        return send(target, { type: 'relay', payload: msg.payload });
      }
      case 'end-session': {
        if (!member) return error('no-session', 'Brak sesji');
        return endSession(member.session, 'ended');
      }
    }
  }

  function handleClose(ws: WebSocket) {
    const member = membership.get(ws);
    if (!member) return;
    membership.delete(ws);
    const peer = peerOf(member.session, member.role);
    if (peer?.ws === ws) peer.ws = undefined;
    // The session stays until it expires, so a dropped phone can resume it.
    send(peerOf(member.session, other(member.role))?.ws, { type: 'peer-disconnected' });
  }

  return {
    handleConnection(ws: WebSocket) {
      ws.on('message', (data, isBinary) => {
        if (isBinary)
          return send(ws, { type: 'error', code: 'bad-message', message: 'Tylko tekst' });
        handleMessage(ws, data.toString());
      });
      ws.on('close', () => handleClose(ws));
      ws.on('error', () => ws.terminate());
    },
    sessionCount: () => sessions.size,
    close() {
      for (const s of [...sessions.values()]) endSession(s, 'ended');
    },
  };
}
