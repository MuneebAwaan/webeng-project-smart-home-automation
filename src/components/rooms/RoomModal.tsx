"use client";
// src/components/rooms/RoomModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { createRoomSchema, CreateRoomInput } from "@/lib/validations/schemas";
import { Room, RoomType } from "@/types";
import { ROOM_TYPE_LABELS, ROOM_TYPE_ICONS } from "@/lib/utils/helpers";

const ROOM_TYPES = Object.entries(ROOM_TYPE_LABELS) as [RoomType, string][];

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomInput) => Promise<void>;
  room?: Room | null;
  isLoading?: boolean;
}

export default function RoomModal({ isOpen, onClose, onSubmit, room, isLoading }: RoomModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoomInput>({ resolver: zodResolver(createRoomSchema) });

  useEffect(() => {
    if (room) {
      reset({ name: room.name, type: room.type });
    } else {
      reset({ name: "", type: "bedroom" });
    }
  }, [room, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card glow-ring p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">{room ? "Edit Room" : "Add New Room"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{room ? "Update room details" : "Add a room to your home"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Room Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Room name</label>
            <input
              {...register("name")}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-500 text-sm
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all
                ${errors.name ? "border-red-500/60" : "border-white/10 hover:border-white/20"}`}
              placeholder="e.g. Master Bedroom"
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          {/* Room Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Room type</label>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_TYPES.map(([value, label]) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" value={value} {...register("type")} className="sr-only peer" />
                  <div className="peer-checked:bg-violet-600/20 peer-checked:border-violet-500/40 peer-checked:text-violet-300
                    bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5
                    flex items-center gap-2 text-sm text-muted-foreground transition-all duration-150">
                    <span>{ROOM_TYPE_ICONS[value]}</span>
                    <span className="font-medium">{label}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
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
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{room ? "Saving..." : "Adding..."}</>
              ) : (
                <>{room ? "💾 Save changes" : "🏠 Add room"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
