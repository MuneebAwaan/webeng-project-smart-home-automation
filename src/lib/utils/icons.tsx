import {
  ArrowDown,
  Bath,
  Bed,
  Briefcase,
  Camera,
  Car,
  ChefHat,
  Fan,
  Flame,
  Home,
  Lightbulb,
  Lock,
  Plug,
  Snowflake,
  Sofa,
  Speaker,
  Thermometer,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { DeviceType, RoomType } from "@/types";

export const ROOM_TYPE_ICON_MAP: Record<RoomType, LucideIcon> = {
  bedroom: Bed,
  kitchen: ChefHat,
  living_room: Sofa,
  office: Briefcase,
  bathroom: Bath,
  garage: Car,
  basement: ArrowDown,
  other: Home,
};

export const DEVICE_TYPE_ICON_MAP: Record<DeviceType, LucideIcon> = {
  light: Lightbulb,
  fan: Fan,
  ac: Snowflake,
  heater: Flame,
  chiller: Snowflake,
  tv: Tv,
  camera: Camera,
  lock: Lock,
  thermostat: Thermometer,
  speaker: Speaker,
  other: Plug,
};

export function RoomIcon({ type, className = "w-5 h-5" }: { type: RoomType; className?: string }) {
  const Icon = ROOM_TYPE_ICON_MAP[type] ?? Home;
  return <Icon className={className} aria-hidden />;
}

export function DeviceIcon({ type, className = "w-5 h-5" }: { type: DeviceType; className?: string }) {
  const Icon = DEVICE_TYPE_ICON_MAP[type] ?? Plug;
  return <Icon className={className} aria-hidden />;
}
