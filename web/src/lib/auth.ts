import { initialOfficers } from '../data/initial-officers';
import { AuthSession, Officer } from './types';

const SESSION_STORAGE_KEY = 'tn_rto_officer_session_token';
const SESSION_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Browser-side Base64URL encoder (JWT format compatible)
 */
function base64UrlEncode(str: string): string {
  const base64 = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(str))) : Buffer.from(str).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return typeof window !== 'undefined' ? decodeURIComponent(escape(atob(base64))) : Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Creates a JWT-formatted demo session token: header.payload.signature
 * 
 * NOTE ON SECURITY LIMITATIONS (முக்கிய பாதுகாப்பு அறிவிப்பு):
 * This is a client-side demo authentication implementation for demonstration purposes.
 * In a real production government system, authentication MUST be handled on a secure
 * backend server with asymmetric signing keys (e.g. RS256/EdDSA), secure HttpOnly cookies,
 * and integration with Tamil Nadu state SSO / e-Sevai / Parivahan backend.
 */
export function createDemoJwtToken(officer: Officer): { token: string; expiresAt: number } {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Date.now();
  const expiresAt = now + SESSION_EXPIRY_MS;

  const payload = {
    sub: officer.id,
    username: officer.username,
    name: officer.name,
    role: officer.role,
    designation: officer.designation,
    rtoOffice: officer.rtoOffice,
    district: officer.district,
    iss: 'tn-transport-department-demo',
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt / 1000),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  // Client-side demo signature hash simulation
  const mockSignature = base64UrlEncode(`tn_gov_demo_signature_${officer.id}_${now}`);

  const token = `${encodedHeader}.${encodedPayload}.${mockSignature}`;
  return { token, expiresAt };
}

/**
 * Decodes and verifies expiry of a demo JWT token
 */
export function verifyDemoToken(token: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }

    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSeconds) {
      return { valid: false }; // Expired
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

/**
 * Authenticates officer against fictional demo dataset
 */
export function loginOfficer(username: string, password: string): { success: boolean; session?: AuthSession; error?: string } {
  if (!username.trim() || !password.trim()) {
    return {
      success: false,
      error: 'பயனர்பெயர் மற்றும் கடவுச்சொல் இரண்டையும் உள்ளிடவும்.',
    };
  }

  const officer = (initialOfficers as Officer[]).find(
    (o) => o.username.toLowerCase() === username.trim().toLowerCase()
  );

  if (!officer) {
    return {
      success: false,
      error: 'அலுவலர் பயனர்பெயர் தவறானது அல்லது கணினி பதிவேட்டில் இல்லை.',
    };
  }

  // Check demo password
  const rawOfficer = (initialOfficers as any[]).find((o) => o.id === officer.id);
  if (rawOfficer.password !== password) {
    return {
      success: false,
      error: 'கடவுச்சொல் தவறானது. தயவுசெய்து சரியான கடவுச்சொல்லை உள்ளிடவும்.',
    };
  }

  const { token, expiresAt } = createDemoJwtToken(officer);

  const session: AuthSession = {
    token,
    officer: {
      id: officer.id,
      username: officer.username,
      name: officer.name,
      designation: officer.designation,
      rtoOffice: officer.rtoOffice,
      district: officer.district,
    },
    expiresAt,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  return { success: true, session };
}

/**
 * Retrieves the currently active session from localStorage
 */
export function getCurrentSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const session: AuthSession = JSON.parse(stored);
    const verification = verifyDemoToken(session.token);

    if (!verification.valid) {
      logoutOfficer();
      return null;
    }

    return session;
  } catch {
    logoutOfficer();
    return null;
  }
}

/**
 * Clears current session
 */
export function logoutOfficer(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

