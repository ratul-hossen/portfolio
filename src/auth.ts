// Admin login. Only the addresses in ADMIN_EMAILS can sign in; everyone
// else is turned away at the provider callback. Sessions are signed
// cookies (JWT), so no database table is needed for them.

import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}

const providers: Provider[] = [];
if (process.env.AUTH_GOOGLE_ID) providers.push(Google);
// Optional: a Microsoft / Office 365 account (e.g. a university address) — enabled once its keys are set.
if (process.env.AUTH_MICROSOFT_ENTRA_ID_ID) providers.push(MicrosoftEntraID);

export const loginProviders = providers.map((provider) => {
  const id = typeof provider === "function" ? provider().id : provider.id;
  return { id, name: id === "google" ? "Google" : "Microsoft" };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ user, profile }) {
      // Google marks unverified addresses; don't trust those.
      if (profile && "email_verified" in profile && profile.email_verified === false) return false;
      return isAdminEmail(profile?.email ?? user.email);
    },
  },
});
