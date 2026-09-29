import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authConfigured, googleAuthUrl, STATE_COOKIE } from "@/lib/auth";

/** Sends the visitor to Google's sign-in page. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  if (!authConfigured) return NextResponse.redirect(`${origin}/login?error=not-configured`);

  const state = randomBytes(16).toString("base64url");
  const response = NextResponse.redirect(googleAuthUrl(`${origin}/api/auth/callback/google`, state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
