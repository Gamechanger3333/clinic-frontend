"use client";

import { useState } from "react";
import AppSidebar from "./AppSidebar";
import AiAssistant from "./AiAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Heart } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar — only shown below lg, where the sidebar becomes a drawer */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground/80 hover:text-foreground flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Heart className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm truncate">ClinicFlow</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <AiAssistant mode="app" role={user?.role || "patient"} />
    </div>
  );
}
