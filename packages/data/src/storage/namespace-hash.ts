/**
 * Short hash of a namespace: 32-bit FNV-1a as 8 hex digits.
 *
 * It keeps apps apart and protects nothing, so it need not be cryptographic. Stored keys
 * depend on it: changing it leaves the stored data of every app behind.
 */
export function namespaceHash(namespace: string): string {
  let hash = 0x811c9dc5;

  for (let i = 0; i < namespace.length; i++) {
    hash ^= namespace.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return `0000000${(hash >>> 0).toString(16)}`.slice(-8);
}
