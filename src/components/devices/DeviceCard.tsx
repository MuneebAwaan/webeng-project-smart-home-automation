"use client";
// src/components/devices/DeviceCard.tsx
import { Pencil, Trash2, Calendar } from "lucide-react";
import { Device } from "@/types";
import { DEVICE_TYPE_ICONS, DEVICE_TYPE_LABELS, ROOM_TYPE_ICONS } from "@/lib/utils/helpers";

interface DeviceCardProps {
  device: Device;
  onToggle: (device: Device) => void;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
  onSchedule: (device: Device) => void;
  index?: number;
}

export default function DeviceCard({ device, onToggle, onEdit, onDelete, onSchedule, index = 0 }: DeviceCardProps) {
  const room = device.roomId as unknown as { name: string; type: string } | null;

  return (
    <div
      className={`stagger-item glass-card p-5 group transition-all duration-200 hover:-translate-y-0.5
        ${device.isOn ? "border-violet-500/30 hover:border-violet-400/40" : "hover:border-white/20"}`}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-300
            ${device.isOn
              ? "bg-violet-600/20 border border-violet-500/30 shadow-lg shadow-violet-900/30"
              : "bg-white/5 border border-white/10"}`}
          >
            {DEVICE_TYPE_ICONS[device.type]}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">{device.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{DEVICE_TYPE_LABELS[device.type]}</p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
          ${device.isOn
            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
            : "bg-white/5 text-muted-foreground border border-white/10"}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${device.isOn ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
          {device.isOn ? "ON" : "OFF"}
        </span>
      </div>

      {/* Room info */}
      {room && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <span>{ROOM_TYPE_ICONS[(room.type ?? "other") as keyof typeof ROOM_TYPE_ICONS]}</span>
          {room.name}
          {device.scheduleCount != null && device.scheduleCount > 0 && (
            <span className="ml-auto flex items-center gap-1 text-violet-400">
              <Calendar className="w-3 h-3" />
              {device.scheduleCount} schedule{device.scheduleCount !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      )}

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggle(device)}
          className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50
            ${device.isOn ? "bg-violet-600 shadow-md shadow-violet-900/40" : "bg-white/10"}`}
          aria-label={`Turn ${device.name} ${device.isOn ? "off" : "on"}`}
        >
          <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300
            ${device.isOn ? "left-8" : "left-1"}`}
          />
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSchedule(device)}
            className="p-2 rounded-lg hover:bg-violet-500/10 text-muted-foreground hover:text-violet-400 transition-all"
            title="Schedule"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(device)}
            className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(device)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
