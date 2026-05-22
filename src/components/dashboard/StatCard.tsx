"use client";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  accent?: "violet" | "emerald" | "amber" | "rose";
  delay?: number;
}

const ACCENT_STYLES = {
  violet: "from-violet-500/10 to-violet-600/5 border-violet-500/20",
  emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
  amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20",
  rose: "from-rose-500/10 to-rose-600/5 border-rose-500/20",
};

const ICON_STYLES = {
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  rose: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

const VALUE_COLORS = {
  violet: "text-violet-200",
  emerald: "text-emerald-200",
  amber: "text-amber-200",
  rose: "text-rose-200",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  accent = "violet",
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={`stagger-item rounded-2xl bg-gradient-to-br ${ACCENT_STYLES[accent]} border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${ICON_STYLES[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${VALUE_COLORS[accent]} tabular-nums`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
    </div>
  );
}
