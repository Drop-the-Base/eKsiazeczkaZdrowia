// `/demo/lekarz`: the doctor app with a guide and a simulated patient's phone. The server serves the
// same build there; nothing is stored either way (the doctor app never persists data).

export const isDemo = window.location.pathname.startsWith('/demo/lekarz');

/** Same-browser handover of the QR payload to the patient demo tab (it has no camera to scan with). */
export const DEMO_QR_CHANNEL = 'pkz-demo-qr';
export const PATIENT_DEMO_PATH = '/demo';
export const DOCTOR_DEMO_PATH = '/demo/lekarz/';
