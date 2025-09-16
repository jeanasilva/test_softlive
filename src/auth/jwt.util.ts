import crypto from 'crypto';

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export interface JwtSignOptions {
  expiresInSeconds?: number; // default 86400 (1 day)
}

export function signJwtHS256(
  payload: Record<string, unknown>,
  secret: string,
  options: JwtSignOptions = {},
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (options.expiresInSeconds ?? 60 * 60 * 24);

  const fullPayload = { ...payload, iat, exp };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));

  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest();
  const encodedSignature = base64url(signature);

  return `${data}.${encodedSignature}`;
}

export function verifyJwtHS256(token: string, secret: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;
  const expected = base64url(crypto.createHmac('sha256', secret).update(data).digest());
  if (expected !== signature) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as any;
    if (decoded && typeof decoded.exp === 'number' && Math.floor(Date.now() / 1000) > decoded.exp) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

