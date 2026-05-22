// src/lib/utils/helpers.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DeviceType, RoomType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedroom: "Bedroom",
  kitchen: "Kitchen",
  living_room: "Living Room",
  office: "Office",
  bathroom: "Bathroom",
  garage: "Garage",
  basement: "Basement",
  other: "Other",
};

export const ROOM_TYPE_ICONS: Record<RoomType, string> = {
  bedroom: "🛏️",
  kitchen: "🍳",
  living_room: "🛋️",
  office: "💼",
  bathroom: "🚿",
  garage: "🏠",
  basement: "⬇️",
  other: "🏡",
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  light: "Light",
  fan: "Fan",
  ac: "Air Conditioner",
  heater: "Heater",
  chiller: "Chiller",
  tv: "Television",
  camera: "Camera",
  lock: "Smart Lock",
  thermostat: "Thermostat",
  speaker: "Speaker",
  other: "Other",
};

export const DEVICE_TYPE_ICONS: Record<DeviceType, string> = {
  light: "💡",
  fan: "🌀",
  ac: "❄️",
  heater: "🔥",
  chiller: "🧊",
  tv: "📺",
  camera: "📷",
  lock: "🔐",
  thermostat: "🌡️",
  speaker: "🔊",
  other: "🔌",
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const FREQUENCY_LABELS = {
  once: "Once",
  daily: "Daily",
  weekly: "Weekly",
};

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}
