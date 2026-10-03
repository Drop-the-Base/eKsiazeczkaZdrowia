/** Always at least one chunk, so an empty payload is still delivered. */
export function splitBytes(bytes: Uint8Array, size: number): Uint8Array[] {
  const parts: Uint8Array[] = [];
  for (let i = 0; i < bytes.length; i += size) parts.push(bytes.subarray(i, i + size));
  return parts.length > 0 ? parts : [new Uint8Array(0)];
}

export function joinBytes(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

/** Authenticated with each chunk, so chunks cannot be reordered or moved between snapshots. */
export const chunkAad = (snapshotId: string, index: number, total: number): string =>
  `${snapshotId}:${index}:${total}`;
