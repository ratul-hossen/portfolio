import { auth, isAdminEmail } from "@/auth";

/**
 * Who is using the admin panel, or null if nobody allowed is.
 * On a local dev server the panel is open (it's your own computer);
 * everywhere else it needs a signed-in admin.
 */
export async function getAdmin(): Promise<{ email: string } | null> {
  if (process.env.NODE_ENV === "development" && process.env.ADMIN_REQUIRE_LOGIN !== "true") {
    return { email: "local" };
  }
  const session = await auth();
  const email = session?.user?.email;
  return email && isAdminEmail(email) ? { email } : null;
}
