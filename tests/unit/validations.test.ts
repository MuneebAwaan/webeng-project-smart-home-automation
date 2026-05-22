// tests/unit/validations.test.ts
import {
  registerSchema,
  loginSchema,
  createRoomSchema,
  createDeviceSchema,
  createScheduleSchema,
} from "@/lib/validations/schemas";

// ── Auth Validation Tests ─────────────────────────────────────────────────────

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "SecurePass1",
      confirmPassword: "SecurePass1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "SecurePass1",
      confirmPassword: "DifferentPass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Passwords do not match");
    }
  });

  it("rejects a name that is too short", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "alice@example.com",
      password: "SecurePass1",
      confirmPassword: "SecurePass1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email address", () => {
    const result = registerSchema.safeParse({
      name: "Alice Johnson",
      email: "not-an-email",
      password: "SecurePass1",
      confirmPassword: "SecurePass1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password without uppercase letter", () => {
    const result = registerSchema.safeParse({
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "nouppercase1",
      confirmPassword: "nouppercase1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "Abc1",
      confirmPassword: "Abc1",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "alice@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({
      email: "alice@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("normalises email to lowercase", () => {
    const result = loginSchema.safeParse({
      email: "Alice@Example.COM",
      password: "somepassword",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("alice@example.com");
    }
  });
});

// ── Room Validation Tests ─────────────────────────────────────────────────────

describe("createRoomSchema", () => {
  it("accepts a valid room", () => {
    const result = createRoomSchema.safeParse({ name: "Master Bedroom", type: "bedroom" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid room type", () => {
    const result = createRoomSchema.safeParse({ name: "My Room", type: "spaceship" });
    expect(result.success).toBe(false);
  });

  it("rejects a room name that is too short", () => {
    const result = createRoomSchema.safeParse({ name: "A", type: "bedroom" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing room name", () => {
    const result = createRoomSchema.safeParse({ type: "kitchen" });
    expect(result.success).toBe(false);
  });
});

// ── Device Validation Tests ───────────────────────────────────────────────────

describe("createDeviceSchema", () => {
  const validRoomId = "507f1f77bcf86cd799439011";

  it("accepts valid device data", () => {
    const result = createDeviceSchema.safeParse({
      name: "Ceiling Fan",
      type: "fan",
      roomId: validRoomId,
      isOn: false,
    });
    expect(result.success).toBe(true);
  });

  it("defaults isOn to false when omitted", () => {
    const result = createDeviceSchema.safeParse({
      name: "Bedroom Light",
      type: "light",
      roomId: validRoomId,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isOn).toBe(false);
    }
  });

  it("rejects an invalid device type", () => {
    const result = createDeviceSchema.safeParse({
      name: "Ceiling Fan",
      type: "dishwasher",
      roomId: validRoomId,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing roomId", () => {
    const result = createDeviceSchema.safeParse({ name: "Ceiling Fan", type: "fan" });
    expect(result.success).toBe(false);
  });
});

// ── Schedule Validation Tests ─────────────────────────────────────────────────

describe("createScheduleSchema", () => {
  const validDeviceId = "507f1f77bcf86cd799439022";

  it("accepts a valid daily schedule", () => {
    const result = createScheduleSchema.safeParse({
      deviceId: validDeviceId,
      action: "on",
      startTime: "07:00",
      frequency: "daily",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid weekly schedule with days", () => {
    const result = createScheduleSchema.safeParse({
      deviceId: validDeviceId,
      action: "off",
      startTime: "23:00",
      frequency: "weekly",
      daysOfWeek: [1, 3, 5],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a weekly schedule without days selected", () => {
    const result = createScheduleSchema.safeParse({
      deviceId: validDeviceId,
      action: "on",
      startTime: "07:00",
      frequency: "weekly",
      daysOfWeek: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        "At least one day must be selected for weekly schedules"
      );
    }
  });

  it("rejects an invalid time format", () => {
    const result = createScheduleSchema.safeParse({
      deviceId: validDeviceId,
      action: "on",
      startTime: "25:99",
      frequency: "daily",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid action value", () => {
    const result = createScheduleSchema.safeParse({
      deviceId: validDeviceId,
      action: "toggle",
      startTime: "07:00",
      frequency: "daily",
    });
    expect(result.success).toBe(false);
  });
});
