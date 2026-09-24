const runtimeEnv: Partial<ImportMetaEnv> & { PROD?: boolean } =
  (import.meta as ImportMeta & { env?: ImportMetaEnv }).env ?? {};

export const DEMO_EMAIL = 'careermate@gmail.com';
export const DEMO_PASSWORD = '12345';
export const DEMO_ACCESS_TOKEN = 'careermate-frontend-demo-session';
export const DEMO_REFRESH_TOKEN = 'careermate-frontend-demo-refresh';
export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';

function parseFlag(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  return undefined;
}

// Vite dev and production builds are frontend-only unless explicitly disabled.
// Non-Vite unit tests have neither flag, so the network client remains testable.
export const isDemoMode = parseFlag(runtimeEnv.VITE_DEMO_MODE) ?? (runtimeEnv.DEV === true || runtimeEnv.PROD === true);
