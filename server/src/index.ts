import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { handleQueryStub } from './queryStub.js';

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '0.0.0.0';

const server = createApp({
  patientDist: fileURLToPath(new URL('../../patient-pwa/dist', import.meta.url)),
  doctorDist: fileURLToPath(new URL('../../doctor-app/dist', import.meta.url)),
  llmQuery: handleQueryStub,
});

server.listen(port, host, () => {
  console.log(`server: http://localhost:${port}  (lekarz: /lekarz/)`);
});
