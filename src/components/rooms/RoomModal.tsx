"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Plus } from "lucide-react";
import { createRoomSchema, CreateRoomInput } from "@/lib/validations/schemas";
import { Room, RoomType } from "@/types";
import { ROOM_TYPE_LABELS } from "@/lib/utils/helpers";
import { RoomIcon } from "@/lib/utils/icons";

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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md surface-card glow-ring p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">{room ? "Edit Room" : "Add New Room"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{room ? "Update room details" : "Add a room to your home"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Room name</label>
            <input
              {...register("name")}
              className={`input-field ${errors.name ? "input-field-error" : ""}`}
              placeholder="e.g. Master Bedroom"
            />
            {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Room type</label>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_TYPES.map(([value, label]) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" value={value} {...register("type")} className="sr-only peer" />
                  <div className="option-card px-3 py-2.5">
                    <RoomIcon type={value} className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{label}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.type && <p className="text-red-400 text-xs">{errors.type.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {room ? "Saving..." : "Adding..."}
                </>
              ) : (
                <>
                  {room ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {room ? "Save changes" : "Add room"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
