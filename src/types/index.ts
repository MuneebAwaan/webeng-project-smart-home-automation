// src/types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

export type RoomType =
  | "bedroom"
  | "kitchen"
  | "living_room"
  | "office"
  | "bathroom"
  | "garage"
  | "basement"
  | "other";

export interface Room {
  _id: string;
  name: string;
  type: RoomType;
  userId: string;
  deviceCount?: number;
  activeDeviceCount?: number;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeviceType =
  | "light"
  | "fan"
  | "ac"
  | "heater"
  | "chiller"
  | "tv"
  | "camera"
  | "lock"
  | "thermostat"
  | "speaker"
  | "other";

export interface Device {
  _id: string;
  name: string;
  type: DeviceType;
  roomId: string;
  userId: string;
  isOn: boolean;
  room?: Room;
  scheduleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleFrequency = "once" | "daily" | "weekly";

export interface Schedule {
  _id: string;
  deviceId: string;
  userId: string;
  action: "on" | "off";
  startTime: string;
  endTime?: string;
  frequency: ScheduleFrequency;
  daysOfWeek?: number[];
  isActive: boolean;
  device?: Device;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  totalDevices: number;
  activeDevices: number;
  totalSchedules: number;
  activeSchedules: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  deviceName: string;
  deviceType?: DeviceType;
  roomName: string;
  timestamp: string;
  type: "on" | "off" | "schedule" | "add" | "delete";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
