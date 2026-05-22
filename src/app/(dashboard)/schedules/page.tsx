"use client";
// src/app/(dashboard)/schedules/page.tsx
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, CalendarClock, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import toast from "react-hot-toast";
import { schedulesApi } from "@/lib/utils/apiClient";
import { Schedule } from "@/types";
import { CreateScheduleInput } from "@/lib/validations/schemas";
import { DEVICE_TYPE_ICONS, DEVICE_TYPE_LABELS, DAY_LABELS, FREQUENCY_LABELS, formatTime } from "@/lib/utils/helpers";
import ScheduleModal from "@/components/schedules/ScheduleModal";
import DeleteConfirm from "@/components/ui/DeleteConfirm";

function SchedulesContent() {
  const searchParams = useSearchParams();
  const deviceIdParam = searchParams.get("deviceId");

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await schedulesApi.getAll(deviceIdParam ?? undefined);
      setSchedules(res.data.data);
    } catch {
      toast.error("Failed to load schedules");
    } finally {
      setIsLoading(false);
    }
  }, [deviceIdParam]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const handleCreate = async (data: CreateScheduleInput) => {
    setSubmitting(true);
    try {
      const res = await schedulesApi.create(data);
      setSchedules((prev) => [res.data.data, ...prev]);
      toast.success("⏰ Schedule created!");
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to create schedule";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: CreateScheduleInput) => {
    if (!editingSchedule) return;
    setSubmitting(true);
    try {
      const res = await schedulesApi.update(editingSchedule._id, data);
      setSchedules((prev) => prev.map((s) => (s._id === editingSchedule._id ? res.data.data : s)));
      toast.success("✅ Schedule updated!");
      setEditingSchedule(null);
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update schedule";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSchedule) return;
    try {
      await schedulesApi.delete(deletingSchedule._id);
      setSchedules((prev) => prev.filter((s) => s._id !== deletingSchedule._id));
      toast.success("🗑️ Schedule deleted");
      setDeletingSchedule(null);
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  const handleToggleActive = async (schedule: Schedule) => {
    try {
      const res = await schedulesApi.update(schedule._id, { isActive: !schedule.isActive });
      setSchedules((prev) => prev.map((s) => (s._id === schedule._id ? res.data.data : s)));
      toast.success(schedule.isActive ? "⏸️ Schedule paused" : "▶️ Schedule activated");
    } catch {
      toast.error("Failed to update schedule");
    }
  };

  const activeCount = schedules.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>⏰</span> Schedules
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} · {activeCount} active
          </p>
        </div>
        <button
          onClick={() => { setEditingSchedule(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-900/30"
        >
          <Plus className="w-4 h-4" /> New Schedule
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && schedules.length === 0 && (
        <div className="glass-card p-16 text-center">
          <CalendarClock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">No schedules yet</p>
          <p className="text-muted-foreground text-sm mb-6">
            {deviceIdParam ? "No schedules for this device" : "Automate your home by scheduling devices to turn on or off"}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Create your first schedule
          </button>
        </div>
      )}

      {/* Schedule list */}
      {!isLoading && schedules.length > 0 && (
        <div className="space-y-3">
          {schedules.map((schedule, i) => {
            const device = schedule.deviceId as unknown as { name: string; type: string; roomId?: { name: string } } | null;
            return (
              <div
                key={schedule._id}
                className={`stagger-item glass-card p-5 flex items-center gap-4 group transition-all duration-200
                  ${schedule.isActive ? "hover:border-violet-500/30" : "opacity-60 hover:opacity-80"}`}
                style={{ animationDelay: `${i * 55}ms` }}
              >
                {/* Device icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                  ${schedule.action === "on" ? "bg-emerald-500/15 border border-emerald-500/20" : "bg-slate-500/15 border border-slate-500/20"}`}>
                  {device ? DEVICE_TYPE_ICONS[(device.type as keyof typeof DEVICE_TYPE_ICONS) ?? "other"] : "🔌"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{device?.name ?? "Unknown device"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${schedule.action === "on" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-400"}`}>
                      {schedule.action === "on" ? "⚡ Turn ON" : "💤 Turn OFF"}
                    </span>
                    {!schedule.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">⏸ Paused</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-sm text-violet-300 font-mono font-semibold">{formatTime(schedule.startTime)}</span>
                    {schedule.endTime && (
                      <span className="text-xs text-muted-foreground">→ {formatTime(schedule.endTime)}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{FREQUENCY_LABELS[schedule.frequency]}</span>
                    {schedule.frequency === "weekly" && schedule.daysOfWeek?.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {schedule.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ")}
                      </span>
                    )}
                    {device?.roomId && (
                      <span className="text-xs text-muted-foreground">· {device.roomId.name}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(schedule)}
                    className={`p-2 rounded-lg transition-all text-muted-foreground
                      ${schedule.isActive ? "hover:bg-amber-500/10 hover:text-amber-400" : "hover:bg-emerald-500/10 hover:text-emerald-400"}`}
                    title={schedule.isActive ? "Pause" : "Activate"}
                  >
                    {schedule.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingSchedule(schedule); setModalOpen(true); }}
                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSchedule(schedule)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ScheduleModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSchedule(null); }}
        onSubmit={editingSchedule ? handleUpdate : handleCreate}
        schedule={editingSchedule}
        preselectedDeviceId={deviceIdParam ?? undefined}
        isLoading={submitting}
      />
      <DeleteConfirm
        isOpen={!!deletingSchedule}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={handleDelete}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </div>
  );
}

export default function SchedulesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" /></div>}>
      <SchedulesContent />
    </Suspense>
  );
}
