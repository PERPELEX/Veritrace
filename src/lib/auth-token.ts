import { JWTPayload, SignJWT, jwtVerify } from "jose";

export type SessionTokenPayload = JWTPayload & {
  userId: number;
  username: string;
  role: string;
  fullName: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error("Missing or empty JWT_SECRET environment variable. Please set JWT_SECRET in your .env.local file.");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionTokenPayload;
  } catch {
    return null;
  }
}
