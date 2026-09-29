import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, exchangeCode, isAdminEmail, SESSION_COOKIE, sessionMaxAge, STATE_COOKIE } from "@/lib/auth";

/** Google sends the visitor back here; allow-listed emails get a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const fail = (error: string) => NextResponse.redirect(`${origin}/login?error=${error}`);

  const state = (await cookies()).get(STATE_COOKIE)?.value;
  const code = url.searchParams.get("code");
  if (!code || !state || state !== url.searchParams.get("state")) return fail("expired");

  const email = await exchangeCode(code, `${origin}/api/auth/callback/google`);
  if (!email) return fail("google");
  if (!isAdminEmail(email)) return fail("not-allowed");

  const response = NextResponse.redirect(`${origin}/admin`);
  response.cookies.delete(STATE_COOKIE);
  response.cookies.set(SESSION_COOKIE, createSession(email), {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
  return response;
}
