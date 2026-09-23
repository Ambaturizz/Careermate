const ACCESS_TOKEN_KEY = 'careermate.access-token';
const REFRESH_TOKEN_KEY = 'careermate.refresh-token';

function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.sessionStorage;
}

export function getAccessToken(): string | null {
  return storage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return storage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function setAccessToken(token: string | null): void {
  const session = storage();
  if (!session) return;
  if (token) session.setItem(ACCESS_TOKEN_KEY, token);
  else session.removeItem(ACCESS_TOKEN_KEY);
}

export function setAuthSession(accessToken: string, refreshToken: string | null): void {
  const session = storage();
  if (!session) return;
  session.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) session.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else session.removeItem(REFRESH_TOKEN_KEY);
}

export function clearAuthSession(): void {
  const session = storage();
  if (!session) return;
  session.removeItem(ACCESS_TOKEN_KEY);
  session.removeItem(REFRESH_TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}
