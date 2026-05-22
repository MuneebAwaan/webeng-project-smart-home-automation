// src/lib/middleware/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "@/lib/utils/jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context?: unknown) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest, context?: unknown): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization");
      const cookieToken = req.cookies.get("token")?.value;

      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : cookieToken;

      if (!token) {
        return NextResponse.json(
          { success: false, error: "Authentication required. Please log in." },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      req.user = decoded;

      return handler(req, context);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          return NextResponse.json(
            { success: false, error: "Session expired. Please log in again." },
            { status: 401 }
          );
        }
        if (error.name === "JsonWebTokenError") {
          return NextResponse.json(
            { success: false, error: "Invalid authentication token." },
            { status: 401 }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: "Authentication failed." },
        { status: 401 }
      );
    }
  };
}

export function getUserFromRequest(req: NextRequest): JwtPayload | null {
  try {
    const authHeader = req.headers.get("authorization");
    const cookieToken = req.cookies.get("token")?.value;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : cookieToken;

    if (!token) return null;

    return verifyToken(token);
  } catch {
    return null;
  }
}
