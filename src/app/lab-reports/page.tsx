"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const EMPTY_FORM = { patientId: "", doctorId: "", testName: "", testDate: "", results: "", normalRange: "", notes: "" };

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

export default function LabReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAll = () => {
    fetch("/api/lab-reports").then((r) => r.json()).then((d) => setReports(d.reports || []));
    fetch("/api/patients").then((r) => r.json()).then((d) => setPatients(d.patients || []));
    fetch("/api/doctors").then((r) => r.json()).then((d) => setDoctors(d.doctors || []));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/lab-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success("Lab report created");
    setDialogOpen(false); setForm(EMPTY_FORM); fetchAll();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/lab-reports/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    toast.success(`Report marked ${status}`);
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Lab Reports</h1>
          <p className="text-muted-foreground mt-1">Manage laboratory tests and results</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Lab Report</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Order Lab Report</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ordering Doctor *</Label>
                <Select value={form.doctorId} onValueChange={(v) => setForm({ ...form, doctorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                  <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.user?.fullName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2"><Label>Test Name *</Label><Input value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} required /></div>
                <div className="col-span-2 space-y-2"><Label>Test Date *</Label><Input type="date" value={form.testDate} onChange={(e) => setForm({ ...form, testDate: e.target.value })} required /></div>
                <div className="col-span-2 space-y-2"><Label>Results</Label><Textarea value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} rows={2} /></div>
                <div className="col-span-2 space-y-2"><Label>Normal Range</Label><Input value={form.normalRange} onChange={(e) => setForm({ ...form, normalRange: e.target.value })} /></div>
                <div className="col-span-2 space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
              </div>
              <Button type="submit" className="w-full">Create Lab Report</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Patient", "Test", "Date", "Doctor", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No lab reports yet</p>
                </td></tr>
              ) : reports.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{r.patient?.fullName || "—"}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{r.testName}</p>
                    {r.results && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.results}</p>}
                  </td>
                  <td className="p-4 text-sm">{r.testDate ? format(new Date(r.testDate), "MMM d, yyyy") : "—"}</td>
                  <td className="p-4 text-sm">{r.doctor?.user?.fullName || "—"}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || ""}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {r.status === "pending" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, "completed")}>Mark Complete</Button>
                    )}
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
