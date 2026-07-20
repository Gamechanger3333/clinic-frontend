"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart, LayoutDashboard, Users, CalendarDays,
  FileText, Settings, LogOut, Shield, ChevronLeft, ChevronRight,
  Stethoscope, Building2, FlaskConical, Pill, Store, CreditCard, Bell, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

interface AppSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function AppSidebar({ mobileOpen = false, onClose }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnreadCount((d.notifications || []).filter((n: any) => !n.isRead).length))
      .catch(() => {});
  }, [pathname]);

  // Auto-close the mobile drawer whenever the route changes
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const allLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin","doctor","receptionist","patient"] },
    { to: "/patients", icon: Users, label: "Patients", roles: ["admin","doctor","receptionist"] },
    { to: "/appointments", icon: CalendarDays, label: "Appointments", roles: ["admin","doctor","receptionist","patient"] },
    { to: "/doctors", icon: Stethoscope, label: "Doctors", roles: ["admin","receptionist","patient"] },
    { to: "/departments", icon: Building2, label: "Departments", roles: ["admin"] },
    { to: "/prescriptions", icon: Pill, label: "Prescriptions", roles: ["admin","doctor","receptionist","patient"] },
    { to: "/lab-reports", icon: FlaskConical, label: "Lab Reports", roles: ["admin","doctor","receptionist","patient"] },
    { to: "/medical-records", icon: FileText, label: "Medical Records", roles: ["admin","doctor","patient"] },
    { to: "/pharmacy", icon: Store, label: "Pharmacy", roles: ["admin","receptionist"] },
    { to: "/billing", icon: CreditCard, label: "Billing", roles: ["admin","receptionist","patient"] },
    { to: "/admin", icon: Shield, label: "Admin Panel", roles: ["admin"] },
    { to: "/settings", icon: Settings, label: "Settings", roles: ["admin","doctor","receptionist","patient"] },
  ];

  const links = allLinks.filter((l) => l.roles.includes(user?.role || ""));

  return (
    <>
      {/* Mobile overlay — click to close the drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 flex-shrink-0",
          // Desktop: static, width driven by collapsed state
          "lg:static lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
          // Mobile: fixed drawer, slides in/out
          "fixed inset-y-0 left-0 z-50 w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-sidebar-primary-foreground whitespace-nowrap flex-1">ClinicFlow</span>}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => {
            const isActive = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link key={to} href={to} title={label} className={isActive ? "sidebar-link-active" : "sidebar-link"}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{label}</span>}
              </Link>
            );
          })}
          <Link href="/notifications" title="Notifications" className={pathname.startsWith("/notifications") ? "sidebar-link-active" : "sidebar-link"}>
            <div className="relative flex-shrink-0">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </div>
            {!collapsed && <span className="text-sm">Notifications</span>}
            {!collapsed && unreadCount > 0 && <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">{unreadCount}</span>}
          </Link>
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          {!collapsed && user && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-sidebar-primary-foreground truncate">{user.fullName}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
            </div>
          )}
          <ThemeToggle
            className={cn(
              "static w-full rounded-lg bg-transparent border-0 shadow-none justify-start px-3 py-2.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent gap-3",
              collapsed && "justify-center px-0"
            )}
            showLabel={!collapsed}
          />
          <button onClick={signOut} className="sidebar-link w-full" title="Sign Out">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="sidebar-link w-full justify-center hidden lg:flex">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
