"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { fullName: "", email: "", phone: "", dateOfBirth: "", gender: "", address: "", medicalHistory: "" };

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchPatients = () =>
    fetch("/api/patients").then((r) => r.json()).then((d) => setPatients(d.patients || []));

  useEffect(() => { fetchPatients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    const url = editId ? `/api/patients/${editId}` : "/api/patients";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success(editId ? "Patient updated" : "Patient added");
    setForm(EMPTY_FORM); setEditId(null); setDialogOpen(false); fetchPatients();
  };

  const openEdit = (p: any) => {
    setForm({ fullName: p.fullName || "", email: p.email || "", phone: p.phone || "", dateOfBirth: p.dateOfBirth || "", gender: p.gender || "", address: p.address || "", medicalHistory: p.medicalHistory || "" });
    setEditId(p.id); setDialogOpen(true);
  };

  const filtered = patients.filter((p) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage patient records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(EMPTY_FORM); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Patient</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Edit Patient" : "Add New Patient"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                </div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
                <div className="space-y-2"><Label>Gender</Label><Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} placeholder="Male / Female / Other" /></div>
                <div className="col-span-2 space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="col-span-2 space-y-2"><Label>Medical History</Label><Textarea value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} rows={3} /></div>
              </div>
              <Button type="submit" className="w-full">{editId ? "Update Patient" : "Add Patient"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Patient","Contact","DOB","Gender","Actions"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                  <img src="/patients-care.jpg" alt="Patients" className="w-24 h-24 rounded-xl object-cover mx-auto mb-4 opacity-60" loading="lazy" />
                  <p>No patients found</p>
                </td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-sm font-medium text-accent-foreground">{p.fullName?.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium">{p.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4"><p className="text-sm">{p.email || "—"}</p><p className="text-xs text-muted-foreground">{p.phone || "—"}</p></td>
                  <td className="p-4 text-sm">{p.dateOfBirth || "—"}</td>
                  <td className="p-4 text-sm">{p.gender || "—"}</td>
                  <td className="p-4"><Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
