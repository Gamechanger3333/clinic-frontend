"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Users, Clock, CheckCircle2, Stethoscope, Building2, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Stats {
  todayAppointments: number;
  totalPatients: number;
  pendingApprovals: number;
  completedToday: number;
  totalDoctors: number;
  totalDepartments: number;
  totalRevenue: number;
  recentAppointments: any[];
}

const DEFAULT_STATS: Stats = {
  todayAppointments: 0,
  totalPatients: 0,
  pendingApprovals: 0,
  completedToday: 0,
  totalDoctors: 0,
  totalDepartments: 0,
  totalRevenue: 0,
  recentAppointments: [],
};

const StatCard = ({ icon, label, value, subtitle, color }: { icon: React.ReactNode; label: string; value: string | number; subtitle?: string; color: string }) => (
  <div className="stat-card animate-fade-in">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-display font-bold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    </div>
  </div>
);

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(async (r) => {
        if (!r.ok) {
          // Backend returned an error status — don't pass it to setStats
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || `Server error: ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        // Guard: ensure recentAppointments is always an array even if the
        // backend omits the field or returns null
        setStats({
          ...DEFAULT_STATS,
          ...data,
          recentAppointments: Array.isArray(data.recentAppointments)
            ? data.recentAppointments
            : [],
        });
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold">Welcome back, {user?.fullName?.split(" ")[0] || "there"}</h1>
        <p className="text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")} — here's what's happening today</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CalendarDays className="w-5 h-5 text-primary-foreground" />} label="Today's Appointments" value={stats.todayAppointments} subtitle={format(new Date(), "MMM d")} color="bg-primary" />
        <StatCard icon={<Users className="w-5 h-5 text-info-foreground" />} label="Total Patients" value={stats.totalPatients} subtitle="All registered" color="bg-info" />
        <StatCard icon={<Clock className="w-5 h-5 text-warning-foreground" />} label="Pending Approvals" value={stats.pendingApprovals} subtitle="Awaiting confirmation" color="bg-warning" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5 text-success-foreground" />} label="Completed Today" value={stats.completedToday} subtitle="Finished appointments" color="bg-success" />
      </div>

      {user?.role === "admin" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Stethoscope className="w-5 h-5 text-primary-foreground" />} label="Total Doctors" value={stats.totalDoctors} subtitle="Active staff" color="bg-primary" />
          <StatCard icon={<Building2 className="w-5 h-5 text-info-foreground" />} label="Departments" value={stats.totalDepartments} subtitle="Medical divisions" color="bg-info" />
          <StatCard icon={<DollarSign className="w-5 h-5 text-success-foreground" />} label="Total Revenue" value={`$${(stats.totalRevenue || 0).toFixed(2)}`} subtitle="Paid invoices" color="bg-success" />
        </div>
      )}

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-display font-semibold">Recent Appointments</h2>
        </div>
        <div className="divide-y divide-border">
          {stats.recentAppointments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No appointments yet</p>
              <p className="text-sm mt-1">Schedule your first appointment to get started</p>
            </div>
          ) : (
            stats.recentAppointments.map((apt: any) => (
              <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-sm font-medium text-accent-foreground">{apt.patient?.fullName?.charAt(0) || "?"}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{apt.patient?.fullName || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(apt.appointmentDate), "MMM d, yyyy")} at {apt.appointmentTime?.slice(0, 5)} · Dr. {apt.doctor?.fullName || "—"}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[apt.status] || ""}`}>
                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}