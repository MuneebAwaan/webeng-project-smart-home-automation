"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Power, PowerOff, Save, CalendarClock } from "lucide-react";
import { createScheduleSchema, CreateScheduleInput } from "@/lib/validations/schemas";
import { Schedule, Device } from "@/types";
import { DEVICE_TYPE_LABELS, DAY_LABELS } from "@/lib/utils/helpers";
import { devicesApi } from "@/lib/utils/apiClient";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateScheduleInput) => Promise<void>;
  schedule?: Schedule | null;
  preselectedDeviceId?: string;
  isLoading?: boolean;
}

const FREQ_LABELS = { once: "Once", daily: "Daily", weekly: "Weekly" };

export default function ScheduleModal({ isOpen, onClose, onSubmit, schedule, preselectedDeviceId, isLoading }: ScheduleModalProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly">("daily");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CreateScheduleInput>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: { frequency: "daily", isActive: true, daysOfWeek: [] },
  });

  const watchFrequency = watch("frequency");

  const fetchDevices = useCallback(async () => {
    try {
      const res = await devicesApi.getAll();
      setDevices(res.data.data);
    } catch {
      console.error("Failed to fetch devices");
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchDevices();
  }, [isOpen, fetchDevices]);

  useEffect(() => {
    if (schedule) {
      const devId = typeof schedule.deviceId === "string"
        ? schedule.deviceId
        : (schedule.deviceId as unknown as { _id: string })?._id ?? "";
      reset({
        deviceId: devId,
        action: schedule.action,
        startTime: schedule.startTime,
        endTime: schedule.endTime ?? "",
        frequency: schedule.frequency,
        daysOfWeek: schedule.daysOfWeek ?? [],
        isActive: schedule.isActive,
      });
      setFrequency(schedule.frequency);
      setSelectedDays(schedule.daysOfWeek ?? []);
    } else {
      reset({
        deviceId: preselectedDeviceId ?? "",
        action: "on",
        startTime: "07:00",
        endTime: "",
        frequency: "daily",
        daysOfWeek: [],
        isActive: true,
      });
      setFrequency("daily");
      setSelectedDays([]);
    }
  }, [schedule, preselectedDeviceId, reset]);

  useEffect(() => {
    setFrequency(watchFrequency as "once" | "daily" | "weekly");
  }, [watchFrequency]);

  const toggleDay = (day: number) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
    setValue("daysOfWeek", updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md surface-card glow-ring p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">{schedule ? "Edit Schedule" : "Create Schedule"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Automate your smart devices</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Device</label>
            <select
              {...register("deviceId")}
              className={`input-field ${errors.deviceId ? "input-field-error" : ""}`}
            >
              <option value="" className="bg-[#12121c]">Select a device</option>
              {devices.map((device) => {
                const room = device.roomId as unknown as { name: string } | null;
                return (
                  <option key={device._id} value={device._id} className="bg-[#12121c]">
                    {device.name} ({DEVICE_TYPE_LABELS[device.type]}){room ? ` — ${room.name}` : ""}
                  </option>
                );
              })}
            </select>
            {errors.deviceId && <p className="text-red-400 text-xs">{errors.deviceId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Action</label>
            <div className="grid grid-cols-2 gap-2">
              {(["on", "off"] as const).map((action) => (
                <label key={action} className="cursor-pointer">
                  <input type="radio" value={action} {...register("action")} className="sr-only peer" />
                  <div className="option-card px-4 py-3 justify-center">
                    {action === "on" ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    Turn {action.toUpperCase()}
                  </div>
                </label>
              ))}
            </div>
            {errors.action && <p className="text-red-400 text-xs">{errors.action.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Start time</label>
              <input
                type="time"
                {...register("startTime")}
                className={`input-field ${errors.startTime ? "input-field-error" : ""}`}
              />
              {errors.startTime && <p className="text-red-400 text-xs">{errors.startTime.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                End time <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input type="time" {...register("endTime")} className="input-field" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Repeat</label>
            <div className="grid grid-cols-3 gap-2">
              {(["once", "daily", "weekly"] as const).map((freq) => (
                <label key={freq} className="cursor-pointer">
                  <input type="radio" value={freq} {...register("frequency")} className="sr-only peer" />
                  <div className="option-card px-3 py-2.5 justify-center capitalize">
                    {FREQ_LABELS[freq]}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {frequency === "weekly" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Days</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAY_LABELS.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`w-10 h-10 rounded-xl text-xs font-semibold transition-all duration-150
                      ${selectedDays.includes(i)
                        ? "bg-violet-600 text-white border border-violet-500"
                        : "bg-white/[0.04] text-muted-foreground border border-white/10 hover:border-white/20"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.daysOfWeek && <p className="text-red-400 text-xs">{errors.daysOfWeek.message}</p>}
            </div>
          )}

          <div className="flex items-center justify-between py-3 px-4 bg-white/[0.03] border border-white/10 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-muted-foreground">Enable this schedule immediately</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register("isActive")} defaultChecked className="sr-only peer" />
              <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-violet-600
                peer-checked:after:translate-x-full
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
                  {schedule ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  {schedule ? <Save className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                  {schedule ? "Save changes" : "Create schedule"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
