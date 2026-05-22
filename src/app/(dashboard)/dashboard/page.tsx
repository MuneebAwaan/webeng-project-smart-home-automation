"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  DoorOpen,
  Cpu,
  CalendarClock,
  Zap,
  Home,
  Lightbulb,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/utils/apiClient";
import { DashboardStats } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import StatCard from "@/components/dashboard/StatCard";
import { formatRelativeTime } from "@/lib/utils/helpers";
import { DeviceIcon } from "@/lib/utils/icons";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data.data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="space-y-8 page-fade-in">
        <div className="h-10 w-72 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 page-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          {greeting()}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Here&apos;s what&apos;s happening with your smart home today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Rooms" value={stats?.totalRooms ?? 0} icon={Home} subtitle="Managed spaces" accent="violet" delay={50} />
        <StatCard title="Total Devices" value={stats?.totalDevices ?? 0} icon={Lightbulb} subtitle="Connected devices" accent="emerald" delay={100} />
        <StatCard title="Active Now" value={stats?.activeDevices ?? 0} icon={Zap} subtitle={`of ${stats?.totalDevices ?? 0} devices`} accent="amber" delay={150} />
        <StatCard title="Schedules" value={stats?.activeSchedules ?? 0} icon={CalendarClock} subtitle={`${stats?.totalSchedules ?? 0} total`} accent="rose" delay={200} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-item" style={{ animationDelay: "250ms" }}>
        {[
          { href: "/rooms", label: "Manage Rooms", icon: DoorOpen, desc: "Add or edit your rooms" },
          { href: "/devices", label: "Control Devices", icon: Cpu, desc: "Toggle and manage appliances" },
          { href: "/schedules", label: "Set Schedules", icon: CalendarClock, desc: "Automate your devices" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="surface-card p-5 flex items-center justify-between group hover:border-violet-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      <div className="stagger-item" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-violet-400" />
          <h2 className="font-semibold text-white">Recent Activity</h2>
        </div>

        {!stats?.recentActivity?.length ? (
          <div className="surface-card p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Radio className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">No activity yet. Add some devices to get started.</p>
            <Link href="/devices" className="btn-primary text-sm">
              Add a device <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="surface-card divide-y divide-white/[0.06]">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border
                  ${activity.type === "on"
                    ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                    : "bg-slate-500/15 border-slate-500/25 text-slate-400"}`}
                >
                  <DeviceIcon type={activity.deviceType ?? "light"} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{activity.deviceName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {activity.roomName} · {activity.action}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
