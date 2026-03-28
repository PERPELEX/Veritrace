import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth-token";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("veritrace_session")?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
