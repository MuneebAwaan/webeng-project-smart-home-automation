// src/app/layout.tsx
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "NestIQ – Smart Home Control",
  description: "Take full control of your home with NestIQ — manage rooms, devices, and automation schedules.",
  keywords: ["smart home", "automation", "IoT", "devices", "NestIQ"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#0a0a0f] text-white min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a2e",
                color: "#e2e8f0",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#0a0a0f" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#0a0a0f" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
