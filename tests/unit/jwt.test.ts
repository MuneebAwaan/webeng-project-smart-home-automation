// tests/unit/jwt.test.ts
// Set up environment variable before importing the module
process.env.JWT_SECRET = "test_super_secret_key_for_unit_tests_only_32chars";
process.env.JWT_EXPIRES_IN = "7d";

import { signToken, verifyToken, decodeToken } from "@/lib/utils/jwt";

describe("JWT utilities", () => {
  const payload = {
    userId: "507f1f77bcf86cd799439011",
    email: "testuser@example.com",
    role: "user",
  };

  describe("signToken", () => {
    it("returns a non-empty token string", () => {
      const token = signToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("returns a string with three JWT segments", () => {
      const token = signToken(payload);
      const parts = token.split(".");
      expect(parts).toHaveLength(3);
    });
  });

  describe("verifyToken", () => {
    it("decodes a token signed with the correct secret", () => {
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it("includes iat and exp fields", () => {
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(typeof decoded.iat).toBe("number");
      expect(typeof decoded.exp).toBe("number");
      expect(decoded.exp!).toBeGreaterThan(decoded.iat!);
    });

    it("throws on a tampered token", () => {
      const token = signToken(payload);
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(() => verifyToken(tampered)).toThrow();
    });

    it("throws on a completely invalid token string", () => {
      expect(() => verifyToken("not.a.token")).toThrow();
    });
  });

  describe("decodeToken", () => {
    it("decodes without verifying signature", () => {
      const token = signToken(payload);
      const decoded = decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
    });

    it("returns null for an invalid string", () => {
      const result = decodeToken("completely-invalid-garbage");
      expect(result).toBeNull();
    });
  });

  describe("round-trip sign → verify", () => {
    it("two different payloads produce different tokens", () => {
      const t1 = signToken({ userId: "aaa", email: "a@a.com", role: "user" });
      const t2 = signToken({ userId: "bbb", email: "b@b.com", role: "admin" });
      expect(t1).not.toBe(t2);
    });
  });
});
