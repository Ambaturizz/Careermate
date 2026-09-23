import assert from 'node:assert/strict';
import test from 'node:test';
import { refreshSession, registerWithPassword, signInWithPassword } from '../src/lib/auth-client.js';
import { getAccessToken, getRefreshToken } from '../src/lib/auth-session.js';

test('auth client uses the CareerMate backend for login and registration', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const requests: Request[] = [];
  const values = new Map<string, string>();
  const sessionStorage = {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => { values.delete(key); },
    setItem: (key: string, value: string) => { values.set(key, value); },
  } satisfies Storage;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { sessionStorage },
  });
  globalThis.fetch = async (input, init) => {
    const requestInput = typeof input === 'string' && input.startsWith('/')
      ? `http://frontend.test${input}`
      : input;
    const request = new Request(requestInput, init);
    requests.push(request);
    return new Response(JSON.stringify({
      status: request.url.endsWith('/register') ? 'verification_required' : 'authenticated',
      user: { id: 'auth-user', email: 'nadia@example.com' },
      accessToken: request.url.endsWith('/login')
        ? 'access-token'
        : request.url.endsWith('/refresh') ? 'refreshed-access-token' : null,
      refreshToken: request.url.endsWith('/login')
        ? 'refresh-token'
        : request.url.endsWith('/refresh') ? 'rotated-refresh-token' : null,
      expiresIn: 3600,
    }), { status: request.url.endsWith('/register') ? 201 : 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    const login = await signInWithPassword('nadia@example.com', 'password-secure');
    const registration = await registerWithPassword('Nadia Putri', 'nadia@example.com', 'password-secure');
    const refreshedToken = await refreshSession();

    assert.equal(login.status, 'authenticated');
    assert.equal(registration.status, 'verification_required');
    assert.equal(refreshedToken, 'refreshed-access-token');
    assert.equal(getAccessToken(), 'refreshed-access-token');
    assert.equal(getRefreshToken(), 'rotated-refresh-token');
    assert.match(requests[0]?.url ?? '', /\/api\/v1\/auth\/login$/);
    assert.match(requests[1]?.url ?? '', /\/api\/v1\/auth\/register$/);
    assert.match(requests[2]?.url ?? '', /\/api\/v1\/auth\/refresh$/);
    assert.deepEqual(await requests[1]?.json(), {
      fullName: 'Nadia Putri',
      email: 'nadia@example.com',
      password: 'password-secure',
    });
  } finally {
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});
