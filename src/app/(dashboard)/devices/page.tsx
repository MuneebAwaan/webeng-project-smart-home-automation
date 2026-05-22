"use client";
// src/app/(dashboard)/devices/page.tsx
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, Cpu, Filter, Lightbulb } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import { devicesApi, roomsApi } from "@/lib/utils/apiClient";
import { Device, Room } from "@/types";
import { CreateDeviceInput } from "@/lib/validations/schemas";
import { ROOM_TYPE_LABELS } from "@/lib/utils/helpers";
import DeviceCard from "@/components/devices/DeviceCard";
import DeviceModal from "@/components/devices/DeviceModal";
import DeleteConfirm from "@/components/ui/DeleteConfirm";
import { Suspense } from "react";

function DevicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomIdParam = searchParams.get("roomId");

  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filtered, setFiltered] = useState<Device[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(roomIdParam ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [devRes, roomRes] = await Promise.all([
        devicesApi.getAll(selectedRoom || undefined),
        roomsApi.getAll(),
      ]);
      setDevices(devRes.data.data);
      setFiltered(devRes.data.data);
      setRooms(roomRes.data.data);
    } catch {
      toast.error("Failed to load devices");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoom]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(devices.filter((d) => d.name.toLowerCase().includes(q)));
  }, [search, devices]);

  const handleRoomFilter = (roomId: string) => {
    setSelectedRoom(roomId);
    if (roomId) router.push(`/devices?roomId=${roomId}`);
    else router.push("/devices");
    setIsLoading(true);
  };

  const handleCreate = async (data: CreateDeviceInput) => {
    setSubmitting(true);
    try {
      const res = await devicesApi.create(data);
      setDevices((prev) => [res.data.data, ...prev]);
      toast.success(`"${data.name}" added`);
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to add device";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: CreateDeviceInput) => {
    if (!editingDevice) return;
    setSubmitting(true);
    try {
      const res = await devicesApi.update(editingDevice._id, data);
      setDevices((prev) => prev.map((d) => (d._id === editingDevice._id ? res.data.data : d)));
      toast.success("Device updated");
      setEditingDevice(null);
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update device";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (device: Device) => {
    // Optimistic update
    setDevices((prev) =>
      prev.map((d) => (d._id === device._id ? { ...d, isOn: !d.isOn } : d))
    );
    try {
      await devicesApi.toggle(device._id);
      toast.success(device.isOn ? `${device.name} turned off` : `${device.name} turned on`);
    } catch {
      // Revert on failure
      setDevices((prev) =>
        prev.map((d) => (d._id === device._id ? { ...d, isOn: device.isOn } : d))
      );
      toast.error("Failed to toggle device");
    }
  };

  const handleDelete = async () => {
    if (!deletingDevice) return;
    try {
      await devicesApi.delete(deletingDevice._id);
      setDevices((prev) => prev.filter((d) => d._id !== deletingDevice._id));
      toast.success("Device deleted");
      setDeletingDevice(null);
    } catch {
      toast.error("Failed to delete device");
    }
  };

  const activeCount = filtered.filter((d) => d.isOn).length;

  return (
    <div className="space-y-6 page-fade-in">
      <PageHeader
        title="Devices"
        description={`${filtered.length} device${filtered.length !== 1 ? "s" : ""} · ${activeCount} active`}
        icon={Lightbulb}
        action={
          <button onClick={() => { setEditingDevice(null); setModalOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Device
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search devices..."
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={selectedRoom}
            onChange={(e) => handleRoomFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20
              focus:border-violet-500/50 focus:outline-none text-white text-sm appearance-none transition-all min-w-[160px]"
          >
            <option value="" className="bg-[#1a1a2e]">All rooms</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id} className="bg-[#1a1a2e]">
                {ROOM_TYPE_LABELS[room.type]}: {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={search ? Search : Cpu}
          title={search ? "No devices found" : "No devices yet"}
          description={search ? "Try a different search term" : "Add your first smart device to begin controlling your home"}
          action={
            !search ? (
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Add your first device
              </button>
            ) : undefined
          }
        />
      )}

      {/* Device grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((device, i) => (
            <DeviceCard
              key={device._id}
              device={device}
              index={i}
              onToggle={handleToggle}
              onEdit={(d) => { setEditingDevice(d); setModalOpen(true); }}
              onDelete={(d) => setDeletingDevice(d)}
              onSchedule={(d) => router.push(`/schedules?deviceId=${d._id}`)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DeviceModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingDevice(null); }}
        onSubmit={editingDevice ? handleUpdate : handleCreate}
        device={editingDevice}
        preselectedRoomId={selectedRoom}
        isLoading={submitting}
      />
      <DeleteConfirm
        isOpen={!!deletingDevice}
        onClose={() => setDeletingDevice(null)}
        onConfirm={handleDelete}
        title="Delete Device"
        message={`Delete "${deletingDevice?.name}"? All schedules for this device will also be removed.`}
      />
    </div>
  );
}

export default function DevicesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" /></div>}>
      <DevicesContent />
    </Suspense>
  );
}
