"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, DoorOpen, Cpu, CalendarClock, LogOut, Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/schedules", label: "Schedules", icon: CalendarClock },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <Zap className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <span className="font-bold text-base gradient-text">NestIQ</span>
          <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Smart Home Control</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-violet-600/20 text-violet-200 border border-violet-500/25"
                  : "text-muted-foreground hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-violet-400" : ""}`} />
              <span>{label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-violet-600/25 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-200">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-muted-foreground hover:text-red-300 hover:bg-red-500/10 border border-transparent
            hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-[#0c0c14] border-r border-white/[0.06] sidebar-glow h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="surface-card p-2.5 text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0c0c14] border-r border-white/[0.06] z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
