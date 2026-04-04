import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectMongo } from "@/server/mongoose";
import User from "@/server/models/User";

export type SessionData = {
  userId: string;
  fullName: string;
  email: string;
  role: string;
};

/**
 * Get the current session from cookies.
 * Reads accessToken / refreshToken, verifies JWT, and looks up the user
 * from MongoDB to return a dashboard-compatible session object.
 */
export async function getCurrentSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  // Try access token first
  let decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET!);

  // If access token failed, try refresh token
  if (!decoded && refreshToken) {
    decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
  }

  if (!decoded) {
    return null;
  }

  try {
    await connectMongo();
    const user = await User.findById(decoded.userId).select(
      "-password -otp -otpExpiry"
    );

    if (!user) {
      return null;
    }

    return {
      userId: user._id.toString(),
      fullName: user.name, // Map MongoDB 'name' → 'fullName' for dashboard compatibility
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

function verifyToken(
  token: string | undefined,
  secret: string
): { userId: string; role: string } | null {
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as { userId: string; role: string };
  } catch {
    return null;
  }
}
