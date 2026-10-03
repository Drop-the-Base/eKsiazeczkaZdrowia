import { createServer } from 'node:http';

// Szkielet z A01. Właściwy serwer (statyki, WebSocket, nagłówki, LLM): B05.
const port = Number(process.env.PORT ?? 8787);

createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
}).listen(port, () => {
  console.log(`server: http://localhost:${port}`);
});
