"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Stethoscope, Badge } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { userId: "", departmentId: "", specialization: "", licenseNumber: "", experience: "0", consultationFee: "0", bio: "" };

export default function DoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAll = () => {
    fetch(`/api/doctors${search ? `?search=${search}` : ""}`).then((r) => r.json()).then((d) => setDoctors(d.doctors || []));
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers((d.users || []).filter((u: any) => u.role === "doctor")));
    fetch("/api/departments").then((r) => r.json()).then((d) => setDepartments(d.departments || []));
  };

  useEffect(() => { fetchAll(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, experience: parseInt(form.experience), consultationFee: parseFloat(form.consultationFee) }),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success("Doctor profile created");
    setDialogOpen(false); setForm(EMPTY_FORM); fetchAll();
  };

  const toggleAvailable = async (id: string, current: boolean) => {
    await fetch(`/api/doctors/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !current }) });
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Doctors</h1>
          <p className="text-muted-foreground mt-1">Manage medical staff and their profiles</p>
        </div>
        {user?.role === "admin" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Doctor Profile</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Doctor Profile</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select User (must have doctor role) *</Label>
                  <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName} — {u.email}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2"><Label>Specialization *</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>License Number</Label><Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div>
                  <div className="col-span-2 space-y-2"><Label>Consultation Fee ($)</Label><Input type="number" step="0.01" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} /></div>
                  <div className="col-span-2 space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
                </div>
                <Button type="submit" className="w-full">Create Doctor Profile</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Doctor", "Department", "Specialization", "Experience", "Fee", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctors.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No doctors found</p>
                </td></tr>
              ) : doctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{doc.user?.fullName?.charAt(0) || "D"}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doc.user?.fullName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{doc.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{doc.department?.name || "—"}</td>
                  <td className="p-4 text-sm">{doc.specialization}</td>
                  <td className="p-4 text-sm">{doc.experience} yr{doc.experience !== 1 ? "s" : ""}</td>
                  <td className="p-4 text-sm">${doc.consultationFee}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${doc.isAvailable ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {doc.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="p-4">
                    {user?.role === "admin" && (
                      <Button variant="ghost" size="sm" onClick={() => toggleAvailable(doc.id, doc.isAvailable)}>
                        {doc.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      </Button>
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
