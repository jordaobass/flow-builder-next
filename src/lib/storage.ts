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
