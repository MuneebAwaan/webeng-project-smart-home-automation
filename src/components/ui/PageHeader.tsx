import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export default function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-violet-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
