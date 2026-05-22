import { ReactNode } from "react";
import { cn } from "@/lib/utils/helpers";

interface IconBadgeProps {
  children: ReactNode;
  active?: boolean;
  variant?: "default" | "success" | "muted";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VARIANT_STYLES = {
  default: "bg-violet-600/15 border-violet-500/25 text-violet-400",
  success: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
  muted: "bg-white/5 border-white/10 text-muted-foreground",
};

const SIZE_STYLES = {
  sm: "w-9 h-9 rounded-lg",
  md: "w-11 h-11 rounded-xl",
  lg: "w-12 h-12 rounded-xl",
};

export default function IconBadge({
  children,
  active = false,
  variant = "default",
  size = "md",
  className,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border flex-shrink-0 transition-colors",
        SIZE_STYLES[size],
        active ? VARIANT_STYLES.success : VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
