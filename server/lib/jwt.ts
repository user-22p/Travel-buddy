import jwt from "jsonwebtoken";

const DEFAULT_ACCESS_TOKEN_TTL = 60 * 15; // 15 minutes
const DEFAULT_REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days

export interface JwtClaims {
  sub: string; // user id
  typ: "access" | "refresh";
}

export function signAccessToken(userId: string, expiresInSeconds = DEFAULT_ACCESS_TOKEN_TTL) {
  const secret = getSecret();
  const token = jwt.sign({ sub: userId, typ: "access" } as JwtClaims, secret, {
    algorithm: "HS256",
    expiresIn: expiresInSeconds,
  });
  return token;
}

export function signRefreshToken(userId: string, expiresInSeconds = DEFAULT_REFRESH_TOKEN_TTL) {
  const secret = getSecret();
  const token = jwt.sign({ sub: userId, typ: "refresh" } as JwtClaims, secret, {
    algorithm: "HS256",
    expiresIn: expiresInSeconds,
  });
  return token;
}

export function verifyToken(token: string): JwtClaims | null {
  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret) as JwtClaims;
    return decoded;
  } catch (e) {
    return null;
  }
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Please set JWT_SECRET to a strong secret.");
  }
  return secret;
}
