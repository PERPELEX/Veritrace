import { JWTPayload, SignJWT, jwtVerify } from "jose";

export type SessionTokenPayload = JWTPayload & {
  userId: number;
  username: string;
  role: string;
  fullName: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing required environment variable: JWT_SECRET");
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
