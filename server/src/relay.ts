import type { WebSocket } from 'ws';
import type { ServerMessage } from '@ez/shared';

// Placeholder until B08: the relay endpoint exists, sessions do not yet.
export function handleRelayConnection(ws: WebSocket): void {
  const msg: ServerMessage = {
    type: 'error',
    code: 'no-session',
    message: 'Przekaźnik jeszcze niegotowy',
  };
  ws.send(JSON.stringify(msg));
  ws.close(1013);
}
