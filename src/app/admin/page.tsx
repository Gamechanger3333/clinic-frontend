"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Plus, Loader2, Eye, EyeOff, Mail, User, Phone, Lock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  doctor: "bg-info/10 text-info border-info/20",
  receptionist: "bg-warning/10 text-warning border-warning/20",
  patient: "bg-success/10 text-success border-success/20",
};

const EMPTY_FORM = { fullName: "", email: "", phone: "", role: "doctor", password: "" };

export default function AdminPanelPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchUsers = () => {
    setLoadingUsers(true);
    apiFetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/auth/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      toast.success(data.message || `${form.role} account created`);
      setForm(EMPTY_FORM);
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);
  const counts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Create doctor, receptionist, and admin accounts. Public sign-up always creates patient accounts — this is the only place privileged roles can be granted.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => { setDialogOpen(o); if (!o) setForm(EMPTY_FORM); }}
        >
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Account</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Staff Account</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="staff@clinicflow.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+92-300-1234567"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor — Clinical tools</SelectItem>
                    <SelectItem value="receptionist">Receptionist — Front desk</SelectItem>
                    <SelectItem value="admin">Admin — Full system access</SelectItem>
                    <SelectItem value="patient">Patient — Self-service portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Temporary Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Share this with the staff member securely — they can change it after signing in.</p>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["admin", "doctor", "receptionist", "patient"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
            className={`stat-card text-left transition-all ${roleFilter === r ? "border-primary/40 ring-1 ring-primary/20" : ""}`}
          >
            <p className="text-sm font-medium text-muted-foreground capitalize">{r}s</p>
            <p className="text-2xl font-display font-bold mt-1">{counts[r] || 0}</p>
          </button>
        ))}
      </div>

      {/* Users table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-sm font-semibold">Name</th>
                <th className="p-4 text-sm font-semibold">Email</th>
                <th className="p-4 text-sm font-semibold">Role</th>
                <th className="p-4 text-sm font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-4 text-sm font-medium">{u.fullName}</td>
                  <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${ROLE_STYLES[u.role] || ""}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
