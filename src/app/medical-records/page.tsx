"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const EMPTY_FORM = { patientId: "", doctorId: "", visitDate: "", chiefComplaint: "", diagnosis: "", treatment: "", notes: "", followUpDate: "" };

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAll = () => {
    fetch("/api/medical-records").then((r) => r.json()).then((d) => setRecords(d.records || []));
    fetch("/api/patients").then((r) => r.json()).then((d) => setPatients(d.patients || []));
    fetch("/api/doctors").then((r) => r.json()).then((d) => setDoctors(d.doctors || []));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/medical-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success("Medical record created");
    setDialogOpen(false); setForm(EMPTY_FORM); fetchAll();
  };

  const filtered = records.filter((r) =>
    r.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.chiefComplaint?.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Medical Records</h1>
          <p className="text-muted-foreground mt-1">Patient visit history and clinical notes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Record</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Medical Record</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select value={form.doctorId} onValueChange={(v) => setForm({ ...form, doctorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                  <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.user?.fullName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2"><Label>Visit Date *</Label><Input type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} required /></div>
                <div className="col-span-2 space-y-2"><Label>Chief Complaint *</Label><Input value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} required placeholder="Primary reason for visit" /></div>
                <div className="col-span-2 space-y-2"><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
                <div className="col-span-2 space-y-2"><Label>Treatment</Label><Textarea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} rows={2} /></div>
                <div className="col-span-2 space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
                <div className="col-span-2 space-y-2"><Label>Follow-up Date</Label><Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full">Save Record</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No medical records found</p>
          </div>
        ) : filtered.map((r) => (
          <div key={r.id} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold">{r.patient?.fullName}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">Dr. {r.doctor?.user?.fullName}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.visitDate ? format(new Date(r.visitDate), "MMM d, yyyy") : "—"}</span>
                </div>
                <p className="text-sm font-medium text-foreground/80">{r.chiefComplaint}</p>
                {r.diagnosis && <p className="text-sm text-muted-foreground"><span className="font-medium">Dx:</span> {r.diagnosis}</p>}
                {r.treatment && <p className="text-sm text-muted-foreground"><span className="font-medium">Rx:</span> {r.treatment}</p>}
                {r.followUpDate && (
                  <p className="text-xs text-info font-medium">Follow-up: {format(new Date(r.followUpDate), "MMM d, yyyy")}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
