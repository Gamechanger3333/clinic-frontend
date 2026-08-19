"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CalendarDays, List, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek } from "date-fns";

const EMPTY_FORM = { patientId: "", doctorId: "", appointmentDate: "", appointmentTime: "", durationMinutes: "30", reason: "", notes: "" };
const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

function AppointmentRow({ apt, isPatient, updateStatus }: { apt: any; isPatient: boolean; updateStatus: (id: string, status: string) => void }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="p-4 text-sm font-medium">{apt.patient?.fullName || "Unknown"}</td>
      <td className="p-4">
        <p className="text-sm">{format(new Date(apt.appointmentDate), "MMM d, yyyy")}</p>
        <p className="text-xs text-muted-foreground">{apt.appointmentTime?.slice(0, 5)}</p>
      </td>
      <td className="p-4 text-sm">{apt.reason || "—"}</td>
      <td className="p-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[apt.status] || ""}`}>
          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
        </span>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          {!isPatient && apt.status === "pending" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => updateStatus(apt.id, "approved")} className="text-xs">Approve</Button>
              <Button variant="ghost" size="sm" onClick={() => updateStatus(apt.id, "rejected")} className="text-xs">Reject</Button>
            </>
          )}
          {!isPatient && apt.status === "approved" && (
            <Button variant="ghost" size="sm" onClick={() => updateStatus(apt.id, "completed")} className="text-xs">Complete</Button>
          )}
          {isPatient && ["pending", "approved"].includes(apt.status) && (
            <Button variant="ghost" size="sm" onClick={() => updateStatus(apt.id, "cancelled")} className="text-xs text-destructive">Cancel</Button>
          )}
        </div>
      </td>
    </tr>
  );
}

function AppointmentsTable({ rows, isPatient, updateStatus }: { rows: any[]; isPatient: boolean; updateStatus: (id: string, status: string) => void }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border bg-muted/30">
          {["Patient", "Date & Time", "Reason", "Status", "Actions"].map((h) => (
            <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.length === 0 ? (
          <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nothing in this range</td></tr>
        ) : rows.map((apt) => <AppointmentRow key={apt.id} apt={apt} isPatient={isPatient} updateStatus={updateStatus} />)}
      </tbody>
    </table>
  );
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "week" | "month">("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async (targetPage = page) => {
    setLoading(true);
    // Week/Month views need the full working set to group client-side;
    // the flat "list" view is the one that's actually paginated server-side.
    const params = new URLSearchParams(
      viewMode === "list" ? { page: String(targetPage), limit: String(PAGE_SIZE) } : { limit: "500" }
    );
    const res = await apiFetch(`/api/appointments?${params.toString()}`);
    const d = await res.json();
    setAppointments(d.appointments || []);
    setPages(d.pagination?.pages || 1);
    setTotal(d.pagination?.total ?? (d.appointments || []).length);
    setLoading(false);
  };

  const fetchLookups = () => {
    // Patients can't list every patient (PHI) or the full user directory —
    // /api/doctors is readable by any authenticated role and has what we need.
    if (!isPatient) {
      apiFetch("/api/patients?limit=500").then((r) => r.json()).then((d) => setPatients(d.patients || []));
    }
    apiFetch("/api/doctors").then((r) => r.json()).then((d) =>
      setDoctors((d.doctors || []).map((doc: any) => ({
        id: doc.user.id,
        fullName: doc.user.fullName,
        workingDays: doc.workingDays,
        startTime: doc.startTime,
        endTime: doc.endTime,
      })))
    );
  };

  useEffect(() => { fetchLookups(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { setPage(1); fetchAppointments(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [viewMode]);
  useEffect(() => { if (viewMode === "list") fetchAppointments(page); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, durationMinutes: parseInt(form.durationMinutes) }),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success("Appointment scheduled");
    setDialogOpen(false); setForm(EMPTY_FORM); fetchAppointments(page);
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await apiFetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || "Update failed"); return; }
    toast.success(`Appointment ${status}`);
    fetchAppointments(page);
  };

  // Group into week (Mon–Sun) or month buckets for the week/month views.
  const grouped = useMemo(() => {
    if (viewMode === "list") return null;
    const groups = new Map<string, { label: string; sortKey: string; rows: any[] }>();
    for (const apt of appointments) {
      const d = new Date(apt.appointmentDate);
      let key: string, label: string;
      if (viewMode === "week") {
        const start = startOfWeek(d, { weekStartsOn: 1 });
        const end = endOfWeek(d, { weekStartsOn: 1 });
        key = format(start, "yyyy-MM-dd");
        label = `Week of ${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
      } else {
        key = format(d, "yyyy-MM");
        label = format(d, "MMMM yyyy");
      }
      if (!groups.has(key)) groups.set(key, { label, sortKey: key, rows: [] });
      groups.get(key)!.rows.push(apt);
    }
    return Array.from(groups.values()).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [appointments, viewMode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Appointments</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["list", "week", "month"] as const).map((v, i) => (
              <Button key={v} variant={viewMode === v ? "default" : "ghost"} size="sm" onClick={() => setViewMode(v)} className={i === 1 ? "rounded-none border-x border-border" : "rounded-none"}>
                {v === "list" ? <List className="w-4 h-4 mr-1" /> : v === "week" ? <Calendar className="w-4 h-4 mr-1" /> : <CalendarDays className="w-4 h-4 mr-1" />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Appointment</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isPatient && (
                  <div className="space-y-2">
                    <Label>Patient *</Label>
                    <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                      <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Doctor *</Label>
                  <Select value={form.doctorId} onValueChange={(v) => setForm({ ...form, doctorId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.fullName}</SelectItem>)}</SelectContent>
                  </Select>
                  {(() => {
                    const selected = doctors.find((d) => d.id === form.doctorId);
                    if (!selected) return null;
                    return (
                      <p className="text-xs text-muted-foreground">
                        Available {selected.workingDays?.join(", ")} · {selected.startTime}–{selected.endTime}
                      </p>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Time *</Label><Input type="time" value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} required /></div>
                </div>
                <div className="space-y-2"><Label>Duration (minutes)</Label><Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} /></div>
                <div className="space-y-2"><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} /></div>
                <Button type="submit" className="w-full">Schedule Appointment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">Loading...</div>
      ) : viewMode === "list" ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <img src="/appointments-calendar.jpg" alt="Appointments" className="w-24 h-24 rounded-xl object-cover mx-auto mb-4 opacity-60" loading="lazy" />
                <p>No appointments yet</p>
              </div>
            ) : (
              <AppointmentsTable rows={appointments} isPatient={isPatient} updateStatus={updateStatus} />
            )}
          </div>
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>Page {page} of {pages} · {total} appointment{total === 1 ? "" : "s"}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {(grouped || []).length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">No appointments yet</div>
          ) : (
            grouped!.map((g) => (
              <div key={g.sortKey} className="glass-card rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30 font-medium text-sm">{g.label} <span className="text-muted-foreground font-normal">({g.rows.length})</span></div>
                <div className="overflow-x-auto">
                  <AppointmentsTable rows={g.rows} isPatient={isPatient} updateStatus={updateStatus} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
