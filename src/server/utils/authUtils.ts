import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Generate Access Token
export function generateAccessToken(userId: string, role: string) {
  return jwt.sign(
    { userId, role },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" }
  );
}

// Generate Refresh Token
export function generateRefreshToken(userId: string, role: string) {
  return jwt.sign(
    { userId, role },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" }
  );
}

// Set Access Token Cookie on NextResponse
export function setAccessTokenCookie(response: NextResponse, token: string) {
  response.cookies.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });
}

// Set Refresh Token Cookie on NextResponse
export function setRefreshTokenCookie(response: NextResponse, token: string) {
  response.cookies.set("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// Clear Auth Cookies on NextResponse
export function clearAuthCookies(response: NextResponse) {
  response.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
  response.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
}

// Verify Access Token
export function verifyAccessToken(token: string | undefined) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as {
      userId: string;
      role: string;
    };
  } catch {
    return null;
  }
}

// Verify Refresh Token
export function verifyRefreshToken(token: string | undefined) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as {
      userId: string;
      role: string;
    };
  } catch {
    return null;
  }
}

// Read tokens from request cookies
export function getTokensFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMap: Record<string, string> = {};
  cookieHeader.split(";").forEach((c) => {
    const [key, ...rest] = c.trim().split("=");
    if (key) cookieMap[key] = rest.join("=");
  });
  return {
    accessToken: cookieMap["accessToken"],
    refreshToken: cookieMap["refreshToken"],
  };
}
