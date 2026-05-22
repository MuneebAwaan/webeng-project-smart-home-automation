"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Plus, AlertCircle } from "lucide-react";
import { createDeviceSchema, CreateDeviceInput } from "@/lib/validations/schemas";
import { Device, Room, DeviceType } from "@/types";
import { DEVICE_TYPE_LABELS, ROOM_TYPE_LABELS } from "@/lib/utils/helpers";
import { DeviceIcon } from "@/lib/utils/icons";
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
      <div className="relative w-full max-w-md surface-card glow-ring p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">{device ? "Edit Device" : "Add New Device"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{device ? "Update device details" : "Connect a new smart device"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Device name</label>
            <input
              {...register("name")}
              className={`input-field ${errors.name ? "input-field-error" : ""}`}
              placeholder="e.g. Bedroom Light"
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Device type</label>
            <div className="grid grid-cols-2 gap-2">
              {DEVICE_TYPES.map(([value, label]) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" value={value} {...register("type")} className="sr-only peer" />
                  <div className="option-card px-3 py-2.5">
                    <DeviceIcon type={value} className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium truncate">{label}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Room</label>
            <select
              {...register("roomId")}
              className={`input-field ${errors.roomId ? "input-field-error" : ""}`}
            >
              <option value="" className="bg-[#12121c]">Select a room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id} className="bg-[#12121c]">
                  {room.name} ({ROOM_TYPE_LABELS[room.type]})
                </option>
              ))}
            </select>
            {errors.roomId && <p className="text-red-400 text-xs">{errors.roomId.message}</p>}
            {rooms.length === 0 && (
              <p className="text-amber-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Add a room first before adding devices.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-white/[0.03] border border-white/10 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Initial state</p>
              <p className="text-xs text-muted-foreground">Turn device on when added</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("isOn")} className="sr-only peer" />
              <div className="w-10 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-violet-500/50 rounded-full peer
                peer-checked:after:translate-x-full peer-checked:bg-violet-600
                after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full
                after:h-5 after:w-5 after:transition-all transition-colors" />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {device ? "Saving..." : "Adding..."}
                </>
              ) : (
                <>
                  {device ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {device ? "Save changes" : "Add device"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
