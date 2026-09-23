import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { FastifyRequest } from 'fastify';
import type { Environment } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export type VerifiedIdentity = {
  provider: string;
  subject: string;
  email: string;
};

export interface AuthVerifier {
  verify(request: FastifyRequest): Promise<VerifiedIdentity>;
}

class DevelopmentAuthVerifier implements AuthVerifier {
  constructor(private readonly environment: Environment) {}

  async verify(request: FastifyRequest): Promise<VerifiedIdentity> {
    const requestedUserId = request.headers['x-careermate-user-id'];
    const subject = typeof requestedUserId === 'string'
      ? requestedUserId
      : this.environment.AUTH_DEV_USER_ID;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(subject)) {
      throw new AppError(401, 'INVALID_DEVELOPMENT_IDENTITY', 'Development user ID must be a UUID.');
    }

    return {
      provider: 'development',
      subject,
      email: subject === this.environment.AUTH_DEV_USER_ID
        ? this.environment.AUTH_DEV_EMAIL
        : `${subject}@example.test`,
    };
  }
}

class JwksAuthVerifier implements AuthVerifier {
  private readonly jwks;

  constructor(private readonly environment: Environment) {
    this.jwks = createRemoteJWKSet(new URL(environment.AUTH_JWKS_URL!));
  }

  async verify(request: FastifyRequest): Promise<VerifiedIdentity> {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'A Bearer access token is required.');
    }

    try {
      const options = {
        audience: this.environment.AUTH_JWT_AUDIENCE,
        ...(this.environment.AUTH_JWT_ISSUER
          ? { issuer: this.environment.AUTH_JWT_ISSUER }
          : {}),
      };
      const { payload } = await jwtVerify(
        authorization.slice('Bearer '.length),
        this.jwks,
        options,
      );

      if (!payload.sub || typeof payload.email !== 'string') {
        throw new Error('JWT must contain sub and email claims.');
      }

      return {
        provider: 'supabase',
        subject: payload.sub,
        email: payload.email.toLowerCase(),
      };
    } catch {
      throw new AppError(401, 'INVALID_ACCESS_TOKEN', 'The access token is invalid or expired.');
    }
  }
}

export function createAuthVerifier(environment: Environment): AuthVerifier {
  return environment.AUTH_MODE === 'jwks'
    ? new JwksAuthVerifier(environment)
    : new DevelopmentAuthVerifier(environment);
}
