export function loadFromSession<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToSession<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to sessionStorage key "${key}":`, e);
  }
}

export function removeFromSession(key: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key);
}

export function checkSeedVersion(currentVersion: number, versionKey: string): boolean {
  if (typeof window === 'undefined') return false;
  const stored = sessionStorage.getItem(versionKey);
  const storedVersion = stored ? parseInt(stored, 10) : 0;
  return storedVersion < currentVersion;
}

export function saveSeedVersion(currentVersion: number, versionKey: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(versionKey, String(currentVersion));
}
