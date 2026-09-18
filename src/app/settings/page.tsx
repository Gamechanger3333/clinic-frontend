"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, KeyRound, Copy, Check, Info } from "lucide-react";

// Mirrors src/lib/demo.ts DEMO_USER_EMAIL on the backend — same default,
// overridable if a deployment changes it. Used only to show a friendly
// "this is shared" notice; the actual enforcement lives server-side.
const DEMO_USER_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@clinicflow.com";

function PasswordStrengthHint({ password }: { password: string }) {
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);
  useEffect(() => {
    if (!password) { setResult(null); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-password-strength", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (res.ok) setResult(await res.json());
      } catch { /* non-critical */ }
    }, 300);
    return () => clearTimeout(t);
  }, [password]);
  if (!password || !result) return null;
  const colors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-info", "bg-success"];
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= result.score ? colors[result.score] : "bg-muted"}`} />
        ))}
      </div>
      {result.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground list-disc list-inside">
          {result.feedback.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      )}
    </div>
  );
}

function ChangePasswordCard({ disabled }: { disabled?: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("New passwords don't match"); return; }
    setSaving(true);
    const res = await apiFetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { toast.error(data.error || "Failed to change password"); return; }
    toast.success(data.message || "Password changed. All other sessions were signed out.");
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  return (
    <div className="glass-card rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-accent-foreground" />
        <h2 className="font-display font-semibold">Change Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label>Current Password</Label>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <div className="space-y-2">
          <Label>New Password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" minLength={8} />
          <PasswordStrengthHint password={newPassword} />
        </div>
        <div className="space-y-2">
          <Label>Confirm New Password</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        <Button type="submit" disabled={saving || disabled}>{saving ? "Updating..." : "Update Password"}</Button>
        <p className="text-xs text-muted-foreground">Changing your password signs you out of every other device.</p>
      </form>
    </div>
  );
}

function MfaCard({ disabled }: { disabled?: boolean }) {
  const { user, refreshUser } = useAuth();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [otpauth, setOtpauth] = useState("");
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    const res = await apiFetch("/api/auth/mfa/setup", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Could not start MFA setup"); return; }
    setOtpauth(data.otpauth); setSecret(data.secret); setSetupOpen(true);
  };

  const verifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiFetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totpCode }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Invalid code"); return; }
    setBackupCodes(data.backupCodes || []);
    await refreshUser();
    toast.success("Two-factor authentication enabled");
  };

  const closeSetup = () => {
    setSetupOpen(false); setOtpauth(""); setSecret(""); setTotpCode(""); setBackupCodes(null);
  };

  const disableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiFetch("/api/auth/mfa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: disablePassword }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Could not disable MFA"); return; }
    toast.success("Two-factor authentication disabled");
    setDisableOpen(false); setDisablePassword(""); await refreshUser();
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {user?.mfaEnabled ? <ShieldCheck className="w-5 h-5 text-success" /> : <ShieldOff className="w-5 h-5 text-muted-foreground" />}
          <div>
            <h2 className="font-display font-semibold">Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground">
              {user?.mfaEnabled ? "Enabled — an authenticator code is required at login." : "Add an extra layer of security with an authenticator app."}
            </p>
          </div>
        </div>
        {user?.mfaEnabled ? (
          <Button variant="outline" onClick={() => setDisableOpen(true)}>Disable</Button>
        ) : (
          <Button onClick={startSetup} disabled={loading || disabled}>{loading ? "Starting..." : "Enable 2FA"}</Button>
        )}
      </div>

      {/* Setup dialog */}
      <Dialog open={setupOpen} onOpenChange={(o) => !o && closeSetup()}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Set up Two-Factor Authentication</DialogTitle></DialogHeader>
          {!backupCodes ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this with your authenticator app (Google Authenticator, Authy, 1Password) or enter the key manually, then enter the 6-digit code it generates.
              </p>
              <div className="bg-muted/40 rounded-lg p-3 break-all text-xs font-mono">{otpauth}</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted/40 rounded-lg p-2 break-all">{secret}</code>
                <Button type="button" variant="ghost" size="sm" onClick={copySecret}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
              </div>
              <form onSubmit={verifySetup} className="space-y-3">
                <div className="space-y-2">
                  <Label>6-digit code</Label>
                  <Input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="000000" className="text-center text-lg tracking-widest" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading || totpCode.length !== 6}>{loading ? "Verifying..." : "Verify & Enable"}</Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-warning font-medium">Save these backup codes now — they won't be shown again. Each can be used once if you lose access to your authenticator app.</p>
              <div className="grid grid-cols-2 gap-2 bg-muted/40 rounded-lg p-4 font-mono text-sm">
                {backupCodes.map((c) => <span key={c}>{c}</span>)}
              </div>
              <Button className="w-full" onClick={closeSetup}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Disable Two-Factor Authentication</DialogTitle></DialogHeader>
          <form onSubmit={disableMfa} className="space-y-4">
            <p className="text-sm text-muted-foreground">Confirm your password to turn off 2FA. This makes your account less secure.</p>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" variant="destructive" className="w-full" disabled={loading}>{loading ? "Disabling..." : "Disable 2FA"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const isDemo = user?.email?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase();

  const handleSave = async () => {
    setSaving(true);
    const res = await apiFetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, phone }) });
    if (!res.ok) { toast.error("Failed to update profile"); setSaving(false); return; }
    await refreshUser();
    toast.success("Profile updated");
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and account security</p>
      </div>

      {isDemo && (
        <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info/10 p-4 text-sm">
          <Info className="w-4 h-4 mt-0.5 text-info shrink-0" />
          <p className="text-muted-foreground">
            You're signed in as the shared demo account. Profile edits, password changes, and two-factor setup are disabled here so the demo stays usable for the next visitor too — everything else in ClinicFlow is fully explorable.
          </p>
        </div>
      )}

      <div className="glass-card rounded-xl p-6 space-y-5">
        <h2 className="font-display font-semibold">Profile</h2>
        <div className="space-y-2 max-w-md"><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isDemo} /></div>
        <div className="space-y-2 max-w-md"><Label>Email</Label><Input value={user?.email || ""} disabled className="opacity-60" /></div>
        <div className="space-y-2 max-w-md"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isDemo} /></div>
        <Button onClick={handleSave} disabled={saving || isDemo}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>

      <ChangePasswordCard disabled={isDemo} />
      <MfaCard disabled={isDemo} />
    </div>
  );
}
