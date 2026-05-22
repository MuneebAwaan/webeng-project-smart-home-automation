"use client";
// src/components/devices/DeviceModal.tsx
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { createDeviceSchema, CreateDeviceInput } from "@/lib/validations/schemas";
import { Device, Room, DeviceType } from "@/types";
import { DEVICE_TYPE_LABELS, DEVICE_TYPE_ICONS, ROOM_TYPE_ICONS } from "@/lib/utils/helpers";
import { roomsApi } from "@/lib/utils/apiClient";

const DEVICE_TYPES = Object.entries(DEVICE_TYPE_LABELS) as [DeviceType, string][];

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeviceInput) => Promise<void>;
  device?: Device | null;
  preselectedRoomId?: string;
  isLoading?: boolean;
}

export default function DeviceModal({ isOpen, onClose, onSubmit, device, preselectedRoomId, isLoading }: DeviceModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDeviceInput>({
    resolver: zodResolver(createDeviceSchema),
  });

  const fetchRooms = useCallback(async () => {
    try {
      const res = await roomsApi.getAll();
      setRooms(res.data.data);
    } catch {
      console.error("Failed to fetch rooms");
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchRooms();
  }, [isOpen, fetchRooms]);

  useEffect(() => {
    if (device) {
      reset({
        name: device.name,
        type: device.type,
        roomId: typeof device.roomId === "string" ? device.roomId : (device.roomId as unknown as { _id: string })?._id ?? "",
        isOn: device.isOn,
      });
    } else {
      reset({ name: "", type: "light", roomId: preselectedRoomId ?? "", isOn: false });
    }
  }, [device, preselectedRoomId, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card glow-ring p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">{device ? "Edit Device" : "Add New Device"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{device ? "Update device details" : "Connect a new smart device"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Device Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Device name</label>
            <input
              {...register("name")}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-500 text-sm
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all
                ${errors.name ? "border-red-500/60" : "border-white/10 hover:border-white/20"}`}
              placeholder="e.g. Bedroom Light"
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          {/* Device Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Device type</label>
            <div className="grid grid-cols-2 gap-2">
              {DEVICE_TYPES.map(([value, label]) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" value={value} {...register("type")} className="sr-only peer" />
                  <div className="peer-checked:bg-violet-600/20 peer-checked:border-violet-500/40 peer-checked:text-violet-300
                    bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5
                    flex items-center gap-2 text-sm text-muted-foreground transition-all duration-150">
                    <span>{DEVICE_TYPE_ICONS[value]}</span>
                    <span className="font-medium truncate">{label}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
          </div>

          {/* Room Select */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Room</label>
            <select
              {...register("roomId")}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all
                ${errors.roomId ? "border-red-500/60" : "border-white/10 hover:border-white/20"}`}
            >
              <option value="" className="bg-[#1a1a2e]">Select a room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id} className="bg-[#1a1a2e]">
                  {ROOM_TYPE_ICONS[room.type]} {room.name}
                </option>
              ))}
            </select>
            {errors.roomId && <p className="text-red-400 text-xs">{errors.roomId.message}</p>}
            {rooms.length === 0 && (
              <p className="text-amber-400 text-xs">⚠️ Add a room first before adding devices.</p>
            )}
          </div>

          {/* Initial state */}
          <div className="flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Initial state</p>
              <p className="text-xs text-muted-foreground">Turn device on when added</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("isOn")} className="sr-only peer" />
              <div className="w-10 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-violet-500/50 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-violet-600
                after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full
                after:h-5 after:w-5 after:transition-all transition-colors" />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-muted-foreground hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{device ? "Saving..." : "Adding..."}</>
              ) : (
                <>{device ? "💾 Save changes" : "💡 Add device"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
