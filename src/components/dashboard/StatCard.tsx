// src/components/dashboard/StatCard.tsx
"use client";
interface StatCardProps {
  title: string;
  value: number | string;
  emoji: string;
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

const VALUE_COLORS = {
  violet: "text-violet-300",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};

export default function StatCard({ title, value, emoji, subtitle, accent = "violet", delay = 0 }: StatCardProps) {
  return (
    <div
      className={`stagger-item rounded-2xl bg-gradient-to-br ${ACCENT_STYLES[accent]} border p-5 transition-transform duration-200 hover:-translate-y-0.5`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className="text-2xl">{emoji}</span>
      </div>
      <p className={`text-3xl font-bold ${VALUE_COLORS[accent]} tabular-nums`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
