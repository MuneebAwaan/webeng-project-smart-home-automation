// src/lib/validations/schemas.ts
import { z } from "zod";

// ── Auth Schemas ──────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// ── Room Schemas ──────────────────────────────────────────────────────────────
export const createRoomSchema = z.object({
  name: z
    .string()
    .min(2, "Room name must be at least 2 characters")
    .max(50, "Room name cannot exceed 50 characters"),
  type: z.enum(
    ["bedroom", "kitchen", "living_room", "office", "bathroom", "garage", "basement", "other"],
    { errorMap: () => ({ message: "Please select a valid room type" }) }
  ),
});

export const updateRoomSchema = createRoomSchema.partial();

// ── Device Schemas ────────────────────────────────────────────────────────────
export const createDeviceSchema = z.object({
  name: z
    .string()
    .min(2, "Device name must be at least 2 characters")
    .max(50, "Device name cannot exceed 50 characters"),
  type: z.enum(
    ["light", "fan", "ac", "heater", "chiller", "tv", "camera", "lock", "thermostat", "speaker", "other"],
    { errorMap: () => ({ message: "Please select a valid device type" }) }
  ),
  roomId: z.string().min(1, "Room is required"),
  isOn: z.boolean().optional().default(false),
});

export const updateDeviceSchema = createDeviceSchema.partial();

export const toggleDeviceSchema = z.object({
  isOn: z.boolean(),
});

// ── Schedule Schemas ──────────────────────────────────────────────────────────
const scheduleBaseSchema = z.object({
  deviceId: z.string().min(1, "Device is required"),
  action: z.enum(["on", "off"], {
    errorMap: () => ({ message: "Action must be either on or off" }),
  }),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format")
    .optional(),
  frequency: z.enum(["once", "daily", "weekly"], {
    errorMap: () => ({ message: "Please select a valid frequency" }),
  }),
  daysOfWeek: z
    .array(z.number().min(0).max(6))
    .optional()
    .default([]),
  isActive: z.boolean().optional().default(true),
});

const weeklyDaysRefine = (data: { frequency?: string; daysOfWeek?: number[] }) => {
  if (data.frequency === "weekly") {
    return data.daysOfWeek && data.daysOfWeek.length > 0;
  }
  return true;
};

export const createScheduleSchema = scheduleBaseSchema.refine(weeklyDaysRefine, {
  message: "At least one day must be selected for weekly schedules",
  path: ["daysOfWeek"],
});

export const updateScheduleSchema = scheduleBaseSchema.partial().refine(weeklyDaysRefine, {
  message: "At least one day must be selected for weekly schedules",
  path: ["daysOfWeek"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
