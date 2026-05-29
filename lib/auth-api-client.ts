/**
 * Client-side helpers for authenticated API calls.
 * Prevents redirect/retry storms when the database or auth APIs are down.
 */

export function isTransientApiFailure(status: number): boolean {
  return status === 0 || status >= 500;
}

export function isUnauthorized(status: number): boolean {
  return status === 401;
}

export async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

