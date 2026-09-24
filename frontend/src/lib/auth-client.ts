import { clearAuthSession, getRefreshToken, setAuthSession } from '@/lib/auth-session';
import {
  DEMO_ACCESS_TOKEN,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_REFRESH_TOKEN,
  DEMO_USER_ID,
  isDemoMode,
} from '@/lib/demo-mode';

const runtimeEnv: Partial<ImportMetaEnv> = (import.meta as ImportMeta & { env?: ImportMetaEnv }).env ?? {};
const apiUrl = (runtimeEnv.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

export type AuthResult = {
  status: 'authenticated' | 'verification_required';
  user: { id: string; email: string; provider?: 'development' | 'supabase'; fullName?: string | null };
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
};

type AuthErrorPayload = {
  error?: { message?: string };
};

async function authRequest(path: string, body: Record<string, string>): Promise<AuthResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/auth/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Layanan akun terlalu lama merespons. Silakan coba lagi.');
    }
    throw new Error('Backend CareerMate tidak dapat dijangkau. Periksa koneksi lalu coba lagi.');
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  let payload: (AuthResult & AuthErrorPayload) | undefined;
  try {
    payload = text ? JSON.parse(text) as AuthResult & AuthErrorPayload : undefined;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Permintaan akun tidak dapat diproses. Silakan coba lagi.');
  }

  if (!payload) throw new Error('Backend mengembalikan respons autentikasi yang tidak valid.');
  if (payload.accessToken) setAuthSession(payload.accessToken, payload.refreshToken);
  return payload;
}

let refreshPromise: Promise<string | null> | null = null;

export function refreshSession(): Promise<string | null> {
  if (isDemoMode) return Promise.resolve(DEMO_ACCESS_TOKEN);
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);

  refreshPromise = authRequest('refresh', { refreshToken })
    .then((result) => result.accessToken)
    .catch((error) => {
      clearAuthSession();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (isDemoMode) {
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return Promise.reject(new Error('Email atau kata sandi demo salah. Gunakan akun yang tertera pada halaman ini.'));
    }
    setAuthSession(DEMO_ACCESS_TOKEN, DEMO_REFRESH_TOKEN);
    return Promise.resolve({
      status: 'authenticated',
      user: { id: DEMO_USER_ID, email: DEMO_EMAIL, provider: 'development', fullName: 'CareerMate Demo' },
      accessToken: DEMO_ACCESS_TOKEN,
      refreshToken: DEMO_REFRESH_TOKEN,
      expiresIn: null,
    });
  }
  return authRequest('login', { email, password });
}

export function registerWithPassword(fullName: string, email: string, password: string): Promise<AuthResult> {
  if (isDemoMode) {
    return Promise.reject(new Error('Registrasi dinonaktifkan pada versi demo frontend. Gunakan akun demo yang tersedia.'));
  }
  return authRequest('register', { fullName, email, password });
}

export function signOut(): void {
  clearAuthSession();
}
