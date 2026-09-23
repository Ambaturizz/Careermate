import type { Environment } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export type AuthUser = {
  id: string;
  email: string;
  provider: 'development' | 'supabase';
  fullName?: string | null;
};

export type AuthResult = {
  status: 'authenticated' | 'verification_required';
  user: AuthUser;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
};

export interface AuthService {
  readonly registrationEnabled: boolean;
  register(input: { fullName: string; email: string; password: string }): Promise<AuthResult>;
  login(input: { email: string; password: string }): Promise<AuthResult>;
  refresh(refreshToken: string): Promise<AuthResult>;
}

type SupabaseAuthPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      full_name?: unknown;
    };
  };
  id?: string;
  email?: string;
  code?: string;
  msg?: string;
  message?: string;
  error_description?: string;
};

class DevelopmentAuthService implements AuthService {
  readonly registrationEnabled = false;

  constructor(private readonly environment: Environment) {}

  async register(): Promise<AuthResult> {
    throw new AppError(
      503,
      'REGISTRATION_DISABLED',
      'Registrasi tidak tersedia pada mode development.',
    );
  }

  private result(): AuthResult {
    return {
      status: 'authenticated',
      user: {
        id: this.environment.AUTH_DEV_USER_ID,
        email: this.environment.AUTH_DEV_EMAIL.toLowerCase(),
        provider: 'development',
        fullName: 'CareerMate Demo',
      },
      accessToken: 'development-session',
      refreshToken: null,
      expiresIn: null,
    };
  }

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const validEmail = input.email.toLowerCase() === this.environment.AUTH_DEV_EMAIL.toLowerCase();
    const validPassword = input.password === this.environment.AUTH_DEV_PASSWORD;
    if (!validEmail || !validPassword) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email atau kata sandi tidak valid.');
    }

    return this.result();
  }

  async refresh(): Promise<AuthResult> {
    return this.result();
  }
}

class SupabaseAuthService implements AuthService {
  readonly registrationEnabled = true;

  constructor(private readonly environment: Environment) {}

  private async request(path: string, body: Record<string, unknown>): Promise<SupabaseAuthPayload> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(`${this.environment.AUTH_SUPABASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          apikey: this.environment.AUTH_SUPABASE_ANON_KEY!,
          authorization: `Bearer ${this.environment.AUTH_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const payload = await response.json() as SupabaseAuthPayload;

      if (!response.ok) {
        const message = payload.error_description ?? payload.msg ?? payload.message;
        throw new AppError(
          response.status === 429 ? 429 : 400,
          payload.code ?? 'AUTH_PROVIDER_REJECTED',
          message ?? 'Permintaan autentikasi tidak dapat diproses.',
        );
      }

      return payload;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError(504, 'AUTH_PROVIDER_TIMEOUT', 'Layanan autentikasi tidak merespons tepat waktu.');
      }
      throw new AppError(502, 'AUTH_PROVIDER_UNAVAILABLE', 'Layanan autentikasi sedang tidak dapat dijangkau.');
    } finally {
      clearTimeout(timeout);
    }
  }

  private toResult(payload: SupabaseAuthPayload): AuthResult {
    const id = payload.user?.id ?? payload.id;
    const email = payload.user?.email ?? payload.email;
    if (!id || !email) {
      throw new AppError(502, 'INVALID_AUTH_RESPONSE', 'Layanan autentikasi mengembalikan respons yang tidak lengkap.');
    }

    return {
      status: payload.access_token ? 'authenticated' : 'verification_required',
      user: {
        id,
        email: email.toLowerCase(),
        provider: 'supabase',
        fullName: typeof payload.user?.user_metadata?.full_name === 'string'
          ? payload.user.user_metadata.full_name
          : null,
      },
      accessToken: payload.access_token ?? null,
      refreshToken: payload.refresh_token ?? null,
      expiresIn: payload.expires_in ?? null,
    };
  }

  async register(input: { fullName: string; email: string; password: string }): Promise<AuthResult> {
    const payload = await this.request('/auth/v1/signup', {
      email: input.email,
      password: input.password,
      data: { full_name: input.fullName },
    });
    return this.toResult(payload);
  }

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const payload = await this.request('/auth/v1/token?grant_type=password', input);
    return this.toResult(payload);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = await this.request('/auth/v1/token?grant_type=refresh_token', {
      refresh_token: refreshToken,
    });
    return this.toResult(payload);
  }
}

export function createAuthService(environment: Environment): AuthService {
  return environment.AUTH_MODE === 'jwks'
    ? new SupabaseAuthService(environment)
    : new DevelopmentAuthService(environment);
}
