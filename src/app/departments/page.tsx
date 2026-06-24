"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Users } from "lucide-react";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchDepts = () =>
    fetch("/api/departments").then((r) => r.json()).then((d) => setDepartments(d.departments || []));

  useEffect(() => { fetchDepts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const url = editId ? `/api/departments/${editId}` : "/api/departments";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success(editId ? "Department updated" : "Department created");
    setForm({ name: "", description: "" }); setEditId(null); setDialogOpen(false); fetchDepts();
  };

  const openEdit = (d: any) => {
    setForm({ name: d.name, description: d.description || "" });
    setEditId(d.id); setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Delete failed"); return; }
    toast.success("Department deleted"); fetchDepts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage hospital wings and specialties</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm({ name: "", description: "" }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Department</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editId ? "Edit Department" : "Add Department"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <Button type="submit" className="w-full">{editId ? "Update" : "Create"} Department</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.length === 0 ? (
          <div className="col-span-3 glass-card rounded-xl p-12 text-center text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No departments yet. Add your first department.</p>
          </div>
        ) : departments.map((dept) => (
          <div key={dept.id} className="glass-card rounded-xl p-5 space-y-3 hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEdit(dept)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)} className="text-destructive hover:text-destructive">Del</Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-base">{dept.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{dept.description || "No description"}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{dept.doctors?.length || 0} doctor{dept.doctors?.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
