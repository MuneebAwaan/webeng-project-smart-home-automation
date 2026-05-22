"use client";
// src/app/(dashboard)/rooms/page.tsx
import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Cpu } from "lucide-react";
import toast from "react-hot-toast";
import { roomsApi } from "@/lib/utils/apiClient";
import { Room } from "@/types";
import { CreateRoomInput } from "@/lib/validations/schemas";
import { ROOM_TYPE_LABELS, ROOM_TYPE_ICONS, formatDate } from "@/lib/utils/helpers";
import RoomModal from "@/components/rooms/RoomModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await roomsApi.getAll();
      setRooms(res.data.data);
    } catch {
      toast.error("Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleCreate = async (data: CreateRoomInput) => {
    setIsSaving(true);
    try {
      const res = await roomsApi.create(data);
      setRooms((prev) => [res.data.data, ...prev]);
      toast.success("Room added successfully 🏠");
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create room";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (data: CreateRoomInput) => {
    if (!editingRoom) return;
    setIsSaving(true);
    try {
      const res = await roomsApi.update(editingRoom._id, data);
      setRooms((prev) => prev.map((r) => (r._id === editingRoom._id ? { ...r, ...res.data.data } : r)));
      toast.success("Room updated successfully ✅");
      setEditingRoom(null);
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update room";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRoom) return;
    setIsDeleting(true);
    try {
      await roomsApi.delete(deletingRoom._id);
      setRooms((prev) => prev.filter((r) => r._id !== deletingRoom._id));
      toast.success("Room deleted 🗑️");
      setDeletingRoom(null);
    } catch {
      toast.error("Failed to delete room");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ROOM_TYPE_LABELS[r.type].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Rooms 🚪</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{rooms.length} room{rooms.length !== 1 ? "s" : ""} in your home</p>
        </div>
        <button
          onClick={() => { setEditingRoom(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-violet-900/30"
        >
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search rooms..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="glass-card p-14 text-center">
          <p className="text-5xl mb-4">{searchQuery ? "🔍" : "🏠"}</p>
          <h3 className="font-semibold text-white text-lg mb-2">{searchQuery ? "No rooms found" : "No rooms yet"}</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {searchQuery ? `No rooms match "${searchQuery}"` : "Add your first room to start managing your smart home."}
          </p>
          {!searchQuery && (
            <button onClick={() => setModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all">
              + Add your first room
            </button>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, i) => (
            <div
              key={room._id}
              className="stagger-item glass-card p-5 hover:border-violet-500/30 transition-all duration-200 hover:-translate-y-0.5 group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center text-xl">
                    {ROOM_TYPE_ICONS[room.type]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base leading-tight">{room.name}</h3>
                    <p className="text-xs text-muted-foreground">{ROOM_TYPE_LABELS[room.type]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingRoom(room); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeletingRoom(room)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{room.deviceCount ?? 0} device{room.deviceCount !== 1 ? "s" : ""}</span>
                </div>
                {(room.activeDeviceCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{room.activeDeviceCount} active</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground">Added {formatDate(room.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <RoomModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRoom(null); }}
        onSubmit={editingRoom ? handleUpdate : handleCreate}
        room={editingRoom}
        isLoading={isSaving}
      />
      <ConfirmDialog
        isOpen={!!deletingRoom}
        onClose={() => setDeletingRoom(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        description={`Are you sure you want to delete "${deletingRoom?.name}"? All devices and schedules in this room will also be deleted.`}
        confirmLabel="Delete Room"
        isLoading={isDeleting}
      />
    </div>
  );
}
