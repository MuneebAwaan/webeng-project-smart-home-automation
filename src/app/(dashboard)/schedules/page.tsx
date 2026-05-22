"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, CalendarClock, Pencil, Trash2, Power, PowerOff, Plug, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { schedulesApi } from "@/lib/utils/apiClient";
import { Schedule, DeviceType } from "@/types";
import { CreateScheduleInput } from "@/lib/validations/schemas";
import { DAY_LABELS, FREQUENCY_LABELS, formatTime } from "@/lib/utils/helpers";
import { DeviceIcon } from "@/lib/utils/icons";
import ScheduleModal from "@/components/schedules/ScheduleModal";
import DeleteConfirm from "@/components/ui/DeleteConfirm";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import IconBadge from "@/components/ui/IconBadge";

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
      toast.success("Schedule created");
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
      toast.success("Schedule updated");
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
      toast.success("Schedule deleted");
      setDeletingSchedule(null);
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  const handleToggleActive = async (schedule: Schedule) => {
    try {
      const res = await schedulesApi.update(schedule._id, { isActive: !schedule.isActive });
      setSchedules((prev) => prev.map((s) => (s._id === schedule._id ? res.data.data : s)));
      toast.success(schedule.isActive ? "Schedule paused" : "Schedule activated");
    } catch {
      toast.error("Failed to update schedule");
    }
  };

  const activeCount = schedules.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6 page-fade-in">
      <PageHeader
        title="Schedules"
        description={`${schedules.length} schedule${schedules.length !== 1 ? "s" : ""} · ${activeCount} active`}
        icon={CalendarClock}
        action={
          <button onClick={() => { setEditingSchedule(null); setModalOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> New Schedule
          </button>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
      )}

      {!isLoading && schedules.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="No schedules yet"
          description={
            deviceIdParam
              ? "No schedules for this device"
              : "Automate your home by scheduling devices to turn on or off"
          }
          action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Create your first schedule
            </button>
          }
        />
      )}

      {!isLoading && schedules.length > 0 && (
        <div className="space-y-3">
          {schedules.map((schedule, i) => {
            const device = schedule.deviceId as unknown as { name: string; type: DeviceType; roomId?: { name: string } } | null;
            return (
              <div
                key={schedule._id}
                className={`stagger-item surface-card p-5 flex items-center gap-4 group transition-all duration-200
                  ${schedule.isActive ? "hover:border-violet-500/25" : "opacity-70 hover:opacity-90"}`}
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <IconBadge variant={schedule.action === "on" ? "success" : "muted"}>
                  {device ? (
                    <DeviceIcon type={device.type ?? "other"} className="w-5 h-5" />
                  ) : (
                    <Plug className="w-5 h-5" />
                  )}
                </IconBadge>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{device?.name ?? "Unknown device"}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${schedule.action === "on"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                        : "bg-slate-500/15 text-slate-400 border border-slate-500/20"}`}
                    >
                      Turn {schedule.action.toUpperCase()}
                    </span>
                    {!schedule.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        Paused
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-sm text-violet-300 font-mono font-semibold">{formatTime(schedule.startTime)}</span>
                    {schedule.endTime && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        {formatTime(schedule.endTime)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{FREQUENCY_LABELS[schedule.frequency]}</span>
                    {schedule.frequency === "weekly" && schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {schedule.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ")}
                      </span>
                    )}
                    {device?.roomId && (
                      <span className="text-xs text-muted-foreground">· {device.roomId.name}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(schedule)}
                    className={`p-2 rounded-lg transition-all text-muted-foreground
                      ${schedule.isActive ? "hover:bg-amber-500/10 hover:text-amber-400" : "hover:bg-emerald-500/10 hover:text-emerald-400"}`}
                    title={schedule.isActive ? "Pause" : "Activate"}
                    aria-label={schedule.isActive ? "Pause schedule" : "Activate schedule"}
                  >
                    {schedule.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingSchedule(schedule); setModalOpen(true); }}
                    className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                    aria-label="Edit schedule"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSchedule(schedule)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                    aria-label="Delete schedule"
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
