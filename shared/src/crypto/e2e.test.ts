import { describe, expect, it } from 'vitest';
import { fromBase64Url, toBase64Url } from './base64url';
import {
  decryptChunk,
  deriveSessionKey,
  encryptChunk,
  generateKeyPair,
  verificationCode,
} from './e2e';

const text = (s: string) => new TextEncoder().encode(s);

async function session() {
  const doctor = await generateKeyPair();
  const patient = await generateKeyPair();
  return {
    doctor,
    patient,
    doctorKey: await deriveSessionKey(doctor, patient.publicKey),
    patientKey: await deriveSessionKey(patient, doctor.publicKey),
  };
}

describe('base64url', () => {
  it('round-trips bytes', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);
    expect(fromBase64Url(toBase64Url(bytes))).toEqual(bytes);
    expect(toBase64Url(bytes)).not.toMatch(/[+/=]/);
    expect(() => fromBase64Url('a+b')).toThrow();
  });
});

describe('e2e crypto', () => {
  it('decrypts on the other side with the derived key', async () => {
    const { doctorKey, patientKey } = await session();
    const chunk = await encryptChunk(patientKey, text('morfologia: HGB 8,9'), 's1:0:1');
    expect(new TextDecoder().decode(await decryptChunk(doctorKey, chunk, 's1:0:1'))).toBe(
      'morfologia: HGB 8,9',
    );
  });

  it('uses a fresh nonce per chunk', async () => {
    const { patientKey } = await session();
    const a = await encryptChunk(patientKey, text('x'), 'a');
    const b = await encryptChunk(patientKey, text('x'), 'a');
    expect(a.iv).not.toBe(b.iv);
    expect(a.data).not.toBe(b.data);
  });

  it('rejects tampered data, wrong aad and a wrong key', async () => {
    const { doctorKey, patientKey } = await session();
    const other = await session();
    const chunk = await encryptChunk(patientKey, text('dane'), 's1:0:2');
    const bytes = fromBase64Url(chunk.data);
    bytes[0] = bytes[0]! ^ 1;
    await expect(
      decryptChunk(doctorKey, { ...chunk, data: toBase64Url(bytes) }, 's1:0:2'),
    ).rejects.toThrow();
    await expect(decryptChunk(doctorKey, chunk, 's1:1:2')).rejects.toThrow();
    await expect(decryptChunk(other.doctorKey, chunk, 's1:0:2')).rejects.toThrow();
  });

  it('shows the same verification code on both sides, different for a swapped key', async () => {
    const { doctor, patient } = await session();
    const attacker = await generateKeyPair();
    const onPhone = await verificationCode(doctor.publicKey, patient.publicKey);
    expect(onPhone).toMatch(/^\d{4}$/);
    expect(await verificationCode(patient.publicKey, doctor.publicKey)).toBe(onPhone);
    expect(await verificationCode(attacker.publicKey, patient.publicKey)).not.toBe(onPhone);
  });

  it('rejects malformed public keys', async () => {
    const own = await generateKeyPair();
    await expect(deriveSessionKey(own, toBase64Url(new Uint8Array(65)))).rejects.toThrow();
    await expect(deriveSessionKey(own, 'abc')).rejects.toThrow();
  });

  it('keeps the private key non-extractable', async () => {
    const { privateKey } = await generateKeyPair();
    expect(privateKey.extractable).toBe(false);
  });
});
