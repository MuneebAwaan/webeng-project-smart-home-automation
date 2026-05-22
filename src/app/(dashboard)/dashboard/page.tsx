"use client";
// src/app/(dashboard)/dashboard/page.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { dashboardApi } from "@/lib/utils/apiClient";
import { DashboardStats } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import StatCard from "@/components/dashboard/StatCard";
import { formatRelativeTime, DEVICE_TYPE_ICONS } from "@/lib/utils/helpers";

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
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {greeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening with your smart home today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rooms"
          value={stats?.totalRooms ?? 0}
          emoji="🏠"
          subtitle="Managed spaces"
          accent="violet"
          delay={50}
        />
        <StatCard
          title="Total Devices"
          value={stats?.totalDevices ?? 0}
          emoji="💡"
          subtitle="Connected devices"
          accent="emerald"
          delay={100}
        />
        <StatCard
          title="Active Now"
          value={stats?.activeDevices ?? 0}
          emoji="⚡"
          subtitle={`of ${stats?.totalDevices ?? 0} devices`}
          accent="amber"
          delay={150}
        />
        <StatCard
          title="Schedules"
          value={stats?.activeSchedules ?? 0}
          emoji="⏰"
          subtitle={`${stats?.totalSchedules ?? 0} total`}
          accent="rose"
          delay={200}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-item" style={{ animationDelay: "250ms" }}>
        {[
          { href: "/rooms", label: "Manage Rooms", emoji: "🚪", desc: "Add or edit your rooms" },
          { href: "/devices", label: "Control Devices", emoji: "🔌", desc: "Toggle and manage appliances" },
          { href: "/schedules", label: "Set Schedules", emoji: "📅", desc: "Automate your devices" },
        ].map(({ href, label, emoji, desc }) => (
          <Link
            key={href}
            href={href}
            className="glass-card p-5 flex items-center justify-between group hover:border-violet-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="stagger-item" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-violet-400" />
          <h2 className="font-semibold text-white">Recent Activity</h2>
        </div>

        {!stats?.recentActivity?.length ? (
          <div className="glass-card p-10 text-center">
            <p className="text-4xl mb-3">📡</p>
            <p className="text-muted-foreground text-sm">No activity yet. Add some devices to get started!</p>
            <Link href="/devices" className="mt-4 inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
              Add a device <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="glass-card divide-y divide-white/5">
            {stats.recentActivity.map((activity, i) => (
              <div key={activity.id} className="flex items-center gap-4 p-4" style={{ animationDelay: `${300 + i * 50}ms` }}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                  ${activity.type === "on" ? "bg-emerald-500/15 border border-emerald-500/20" : "bg-slate-500/15 border border-slate-500/20"}`}>
                  {DEVICE_TYPE_ICONS["light"]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{activity.deviceName}</p>
                  <p className="text-xs text-muted-foreground">{activity.roomName} · {activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatRelativeTime(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
