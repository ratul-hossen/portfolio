// Admin sign-in with Google.
// Only the email addresses in ADMIN_EMAILS can open /admin. The session is a
// signed cookie (HMAC-SHA256 with AUTH_SECRET) — no database needed.

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
export const STATE_COOKIE = "admin_oauth_state";
const SESSION_DAYS = 7;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const secret = process.env.AUTH_SECRET;
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/** True once Google sign-in has everything it needs. */
export const authConfigured = Boolean(clientId && clientSecret && secret && adminEmails.length);

/** On your own computer the admin panel opens without signing in until Google is set up. */
const openLocally = process.env.NODE_ENV === "development" && !authConfigured;

export type Admin = { email: string };

export function isAdminEmail(email: string) {
  return adminEmails.includes(email.toLowerCase());
}

/** The signed-in admin, or null. */
export async function getAdmin(): Promise<Admin | null> {
  if (openLocally) return { email: "local" };
  if (!authConfigured) return null;
  const session = verify((await cookies()).get(SESSION_COOKIE)?.value);
  return session && isAdminEmail(session.email) ? { email: session.email } : null;
}

export function createSession(email: string) {
  return sign({ email, exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 });
}

export const sessionMaxAge = SESSION_DAYS * 24 * 60 * 60;

// --- Google OAuth ----------------------------------------------------------

export function googleAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: clientId ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Trades the code from Google's redirect for the user's verified email. */
export async function exchangeCode(code: string, redirectUri: string): Promise<string | null> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId ?? "",
      client_secret: clientSecret ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) return null;
  const { id_token: idToken } = (await response.json()) as { id_token?: string };
  if (!idToken) return null;

  // The token came straight from Google over TLS, so its claims can be trusted
  // without checking the signature (OpenID Connect Core §3.1.3.7).
  const claims = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8")) as {
    iss?: string;
    aud?: string;
    exp?: number;
    email?: string;
    email_verified?: boolean;
  };
  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  const fresh = typeof claims.exp === "number" && claims.exp * 1000 > Date.now();
  if (!issuerOk || claims.aud !== clientId || !fresh || !claims.email || !claims.email_verified) return null;
  return claims.email.toLowerCase();
}

// --- Signed cookies --------------------------------------------------------

type Session = { email: string; exp: number };

function hmac(data: string) {
  return createHmac("sha256", secret ?? "").update(data).digest("base64url");
}

function sign(session: Session) {
  const data = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${data}.${hmac(data)}`;
}

function verify(token: string | undefined): Session | null {
  if (!token || !secret) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  const expected = Buffer.from(hmac(data));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const session = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as Session;
    return session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}
