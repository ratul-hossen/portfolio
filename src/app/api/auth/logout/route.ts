import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login?signed-out=1", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
