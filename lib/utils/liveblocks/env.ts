/** Client-safe Liveblocks env checks */

export function getLiveblocksPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY?.trim();
  if (!key || key.length < 8) return null;
  return key;
}

export function isLiveblocksConfigured(): boolean {
  return Boolean(getLiveblocksPublicKey());
}
