import assert from 'node:assert/strict';
import test from 'node:test';
import { parseEnvironment } from '../src/config/env.js';

const productionEnvironment = {
  NODE_ENV: 'production',
  HOST: '0.0.0.0',
  PORT: '3000',
  CORS_ORIGINS: 'https://careermate.example.com/',
  TRUST_PROXY: 'true',
  AI_PROVIDER: 'gemini',
  GEMINI_API_KEY: 'test-key',
  GEMINI_MODEL: 'gemini-test',
  DATABASE_MODE: 'postgres',
  DATABASE_URL: 'postgresql://user:password@db.example.com:5432/careermate',
  AUTH_MODE: 'jwks',
  AUTH_JWKS_URL: 'https://project.supabase.co/auth/v1/.well-known/jwks.json',
  AUTH_JWT_ISSUER: 'https://project.supabase.co/auth/v1',
  AUTH_JWT_AUDIENCE: 'authenticated',
  AUTH_SUPABASE_URL: 'https://project.supabase.co',
  AUTH_SUPABASE_ANON_KEY: 'public-anon-key',
} satisfies NodeJS.ProcessEnv;

test('production environment accepts deployable host, CORS, database, auth, and AI settings', () => {
  const parsed = parseEnvironment(productionEnvironment);
  assert.equal(parsed.HOST, '0.0.0.0');
  assert.equal(parsed.TRUST_PROXY, true);
  assert.deepEqual(parsed.corsOrigins, ['https://careermate.example.com']);
  assert.equal(parsed.AI_PROVIDER, 'gemini');
  assert.equal(parsed.AUTH_MODE, 'jwks');
  assert.equal(parsed.DATABASE_MODE, 'postgres');
});

test('production environment rejects loopback binding and localhost CORS', () => {
  assert.throws(
    () => parseEnvironment({
      ...productionEnvironment,
      HOST: '127.0.0.1',
      CORS_ORIGINS: 'http://localhost:8080',
    }),
    /Invalid backend environment/,
  );
});
