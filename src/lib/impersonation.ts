import { createHmac, timingSafeEqual } from 'node:crypto';

export const IMPERSONATION_STATE_COOKIE_NAME = 'impersonation_state';
export const IMPERSONATION_STATE_MAX_AGE_SECONDS = 60 * 60;

interface ImpersonationStatePayload {
  adminUserId: string;
  impersonatedUserId: string;
  issuedAt: number;
  expiresAt: number;
}

interface CreateImpersonationStateInput {
  adminUserId: string;
  impersonatedUserId: string;
  maxAgeSeconds?: number;
}

function getImpersonationSecret(): string {
  const configuredSecret = process.env.IMPERSONATION_COOKIE_SECRET;
  if (configuredSecret?.length) return configuredSecret;

  const fallbackSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (fallbackSecret?.length) return fallbackSecret;

  throw new Error('Missing impersonation cookie secret');
}

function signPayload(payload: string): string {
  return createHmac('sha256', getImpersonationSecret())
    .update(payload)
    .digest('base64url');
}

function hasValidSignature(payload: string, signature: string): boolean {
  const expectedSignature = signPayload(payload);
  const expected = Buffer.from(expectedSignature, 'utf8');
  const actual = Buffer.from(signature, 'utf8');

  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}

export function createImpersonationStateCookieValue({
  adminUserId,
  impersonatedUserId,
  maxAgeSeconds = IMPERSONATION_STATE_MAX_AGE_SECONDS,
}: CreateImpersonationStateInput): string {
  const now = Date.now();
  const payload: ImpersonationStatePayload = {
    adminUserId,
    impersonatedUserId,
    issuedAt: now,
    expiresAt: now + maxAgeSeconds * 1000,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadJson, 'utf8').toString('base64url');
  const signature = signPayload(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

export function parseImpersonationStateCookieValue(
  cookieValue?: string | null
): ImpersonationStatePayload | null {
  if (!cookieValue) return null;

  const [payloadBase64, signature, ...extraParts] = cookieValue.split('.');
  if (!payloadBase64 || !signature || extraParts.length > 0) return null;

  try {
    if (!hasValidSignature(payloadBase64, signature)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8')) as ImpersonationStatePayload;

    if (!payload?.adminUserId || !payload?.impersonatedUserId) return null;
    if (typeof payload.issuedAt !== 'number' || typeof payload.expiresAt !== 'number') return null;
    if (payload.expiresAt <= Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}
