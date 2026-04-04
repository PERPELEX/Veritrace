import jwt from "jsonwebtoken";

export type SessionTokenPayload = {
  userId: string;
  role: string;
  fullName: string;
  email: string;
};

/**
 * Verify an access token and return session data.
 * Maps MongoDB user fields to dashboard-compatible shape.
 */
export function verifySessionFromToken(
  token: string | undefined
): SessionTokenPayload | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { userId: string; role: string };

    // We only have userId and role in the JWT.
    // Return what we can — the full session lookup happens in session.ts
    return {
      userId: decoded.userId,
      role: decoded.role,
      fullName: "", // Will be populated from DB lookup in session.ts
      email: "",
    };
  } catch {
    return null;
  }
}
