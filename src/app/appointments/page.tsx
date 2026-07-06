"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CalendarDays, List, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const EMPTY_FORM = { patientId: "", doctorId: "", appointmentDate: "", appointmentTime: "", durationMinutes: "30", reason: "", notes: "" };

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "week" | "month">("list");
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAll = () => {
    fetch("/api/appointments").then((r) => r.json()).then((d) => setAppointments(d.appointments || []));
    // Patients can't list every patient (PHI) or the full user directory —
    // /api/doctors is readable by any authenticated role and has what we need.
    if (!isPatient) {
      fetch("/api/patients").then((r) => r.json()).then((d) => setPatients(d.patients || []));
    }
    fetch("/api/doctors").then((r) => r.json()).then((d) => setDoctors((d.doctors || []).map((doc: any) => ({ id: doc.user.id, fullName: doc.user.fullName }))));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, durationMinutes: parseInt(form.durationMinutes) }),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success("Appointment scheduled");
    setDialogOpen(false); setForm(EMPTY_FORM); fetchAll();
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await apiFetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) { toast.error("Update failed"); return; }
    toast.success(`Appointment ${status}`);
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Appointments</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["list","week","month"] as const).map((v, i) => (
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

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Patient","Date & Time","Reason","Status","Actions"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                  <img src="/appointments-calendar.jpg" alt="Appointments" className="w-24 h-24 rounded-xl object-cover mx-auto mb-4 opacity-60" loading="lazy" />
                  <p>No appointments yet</p>
                </td></tr>
              ) : appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
