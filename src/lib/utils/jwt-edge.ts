// Edge-compatible JWT verification for Next.js middleware
import { jwtVerify } from "jose";
import type { JwtPayload } from "@/lib/utils/jwt";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyTokenEdge(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return {
    userId: payload.userId as string,
    email: payload.email as string,
    role: payload.role as string,
    iat: payload.iat,
    exp: payload.exp,
  };
}
