import { createHmac, timingSafeEqual, scryptSync } from 'node:crypto';
import { cookies } from 'next/headers';
import { query } from './db.js';

const SESSION_COOKIE_NAME = 'hackolantern_judge_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const SECRET = process.env.SESSION_SECRET || 'hackolantern_finals_judge_secret_key_2026_supersecure';
const SALT = 'hackolantern_finals_salt_2026';

export function hashPassword(password) {
  return scryptSync(password, SALT, 64).toString('hex');
}

export function verifyPassword(password, storedHash) {
  try {
    const candidateHash = hashPassword(password);
    return timingSafeEqual(Buffer.from(candidateHash), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

function sign(payload) {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
      exp: Date.now() + SESSION_DURATION_MS,
    })
  ).toString('base64url');

  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expectedSignature = sign(payload);

  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp <= Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function loginUser(identifier, secret) {
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanSecret = String(secret || '').trim();

  if (!cleanId) {
    return { ok: false, error: 'Please enter a username or PIN.' };
  }

  // Lookup by username or PIN
  const res = await query(
    'SELECT id, username, password_hash, display_name, pin, role FROM judge_accounts WHERE LOWER(username) = $1 OR pin = $1 LIMIT 1',
    [cleanId]
  );

  if (res.rows.length === 0) {
    return { ok: false, error: 'User not found. Check your credentials.' };
  }

  const user = res.rows[0];

  // If secret is provided, verify against password or PIN
  if (cleanSecret) {
    const isPwMatch = verifyPassword(cleanSecret, user.password_hash);
    const isPinMatch = user.pin && user.pin === cleanSecret;
    if (!isPwMatch && !isPinMatch) {
      return { ok: false, error: 'Incorrect password or PIN.' };
    }
  } else {
    // If logging in via PIN only (when identifier itself is the PIN or username without separate secret)
    if (user.pin !== cleanId) {
      return { ok: false, error: 'Password or PIN required.' };
    }
  }

  const token = createSessionToken(user);
  return {
    ok: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requireJudge() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return session;
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  };
}
