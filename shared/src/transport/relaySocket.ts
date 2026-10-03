import { RELAY_PATH, type ClientMessage, type ServerMessage } from '../contracts.js';
import { parseServerMessage } from './messages.js';

/** The subset of the browser `WebSocket` the transport uses (the `ws` package matches it too). */
export interface SocketLike {
  readonly readyState: number;
  send(data: string): void;
  close(code?: number): void;
  addEventListener(type: 'open' | 'close' | 'error', cb: () => void): void;
  addEventListener(type: 'message', cb: (ev: { data: unknown }) => void): void;
}

export interface TransportOptions {
  /** Defaults to the global `WebSocket`. */
  createSocket?: (url: string) => SocketLike;
}

const OPEN = 1;
const RETRY_DELAYS_MS = [500, 1000, 2000, 4000, 8000];

/** `wss://host/relay` for a page served from `https://host`. */
export function relayUrl(origin: string): string {
  return origin.replace(/^http/, 'ws') + RELAY_PATH;
}

function defaultSocket(url: string): SocketLike {
  const Ctor = (globalThis as { WebSocket?: new (url: string) => SocketLike }).WebSocket;
  if (!Ctor) throw new Error('Brak WebSocket w tym środowisku');
  return new Ctor(url);
}

interface Handlers {
  /** `reconnect` = opened again after a drop; send `resume-session`. */
  onOpen(reconnect: boolean): void;
  onMessage(msg: ServerMessage): void;
  onReconnecting(): void;
  /** Could not connect, or gave up reconnecting. */
  onFailed(): void;
}

/** WebSocket to the relay that reconnects with backoff once `enableResume()` was called. */
export function openRelaySocket(url: string, opts: TransportOptions, h: Handlers) {
  const create = opts.createSocket ?? defaultSocket;
  let socket: SocketLike;
  let closed = false;
  let canResume = false;
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const connect = (reconnect: boolean) => {
    const s = create(url);
    socket = s;
    s.addEventListener('open', () => {
      attempt = 0;
      h.onOpen(reconnect);
    });
    s.addEventListener('message', (ev) => {
      if (closed || typeof ev.data !== 'string') return;
      const msg = parseServerMessage(ev.data);
      if (msg) h.onMessage(msg);
    });
    // Always followed by 'close', which handles it; without a listener Node's `ws` would throw.
    s.addEventListener('error', () => undefined);
    s.addEventListener('close', () => {
      if (closed || s !== socket) return;
      const delay = RETRY_DELAYS_MS[attempt];
      if (!canResume || delay === undefined) {
        closed = true;
        h.onFailed();
        return;
      }
      attempt++;
      h.onReconnecting();
      timer = setTimeout(() => connect(true), delay);
    });
  };
  connect(false);

  return {
    /** Returns false when the socket is not open (the message is dropped). */
    send(msg: ClientMessage): boolean {
      if (socket.readyState !== OPEN) return false;
      socket.send(JSON.stringify(msg));
      return true;
    },
    enableResume() {
      canResume = true;
    },
    close() {
      closed = true;
      clearTimeout(timer);
      socket.close(1000);
    },
  };
}
