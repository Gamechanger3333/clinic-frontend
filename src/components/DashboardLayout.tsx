"use client";

import AppSidebar from "./AppSidebar";
import AiAssistant from "./AiAssistant";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
      <AiAssistant mode="app" role={user?.role || "patient"} />
    </div>
  );
}
