"use client";
// src/app/(dashboard)/layout.tsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    const hasStoredSession =
      typeof window !== "undefined" &&
      localStorage.getItem("token") &&
      localStorage.getItem("user");

    if (!hasStoredSession) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const hasStoredSession =
    typeof window !== "undefined" &&
    localStorage.getItem("token") &&
    localStorage.getItem("user");

  if (isLoading || (!isAuthenticated && hasStoredSession)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading NestIQ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#09090f] mesh-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
