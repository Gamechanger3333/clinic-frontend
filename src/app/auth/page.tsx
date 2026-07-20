"use client";

/**
 * src/app/auth/page.tsx — Enterprise Auth Page
 *
 * Flows:
 *  login         → email + password, then MFA if enabled
 *  signup        → full form + real-time password strength
 *  forgot        → email → sends reset link
 *  reset         → new password (from ?token= in URL)
 *  verify-email  → confirm email (from ?token= in URL)
 *  mfa           → 6-digit TOTP after successful credentials
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Heart, Eye, EyeOff, ShieldCheck, Mail, Lock, User,
  Phone, AlertCircle, CheckCircle2, Loader2, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthMode = "login" | "signup" | "forgot" | "reset" | "verify-email" | "mfa";

// ─── Password strength indicator ─────────────────────────────────────────────
function PasswordStrengthBar({ password }: { password: string }) {
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);

  useEffect(() => {
    if (!password) { setResult(null); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-password-strength", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ password }),
        });
        if (res.ok) setResult(await res.json());
      } catch { /* non-critical */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [password]);

  if (!result || !password) return null;

  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  return (
    <div className="space-y-1 mt-1">
      <div className="flex gap-1 h-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              i <= result.score ? colors[result.score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${colors[result.score].replace("bg-", "text-")}`}>
          {labels[result.score]}
        </p>
        {result.feedback.length > 0 && (
          <p className="text-xs text-muted-foreground">{result.feedback[0]}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────
function AuthPageInner() {
  const [mode,            setMode]            = useState<AuthMode>("login");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [fullName,        setFullName]        = useState("");
  const [phone,           setPhone]           = useState("");
  const [otpCode,         setOtpCode]         = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [resetToken,      setResetToken]      = useState("");
  const [verifyToken,     setVerifyToken]     = useState("");
  const [verifyState,     setVerifyState]     = useState<"idle" | "verifying" | "success" | "error">("idle");

  const { refreshUser, refreshCsrf } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── Auto-detect mode from URL params ─────────────────────────────────────
  useEffect(() => {
    const resetT  = searchParams.get("token");
    const verifyT = searchParams.get("token");
    const urlMode = searchParams.get("mode") as AuthMode | null;

    if (urlMode === "reset" && resetT) {
      setResetToken(resetT);
      setMode("reset");
    } else if (urlMode === "verify-email" && verifyT) {
      setVerifyToken(verifyT);
      setMode("verify-email");
      handleEmailVerify(verifyT);
    } else if (urlMode) {
      setMode(urlMode);
    }
  }, [searchParams]);

  // ── Email verification ────────────────────────────────────────────────────
  async function handleEmailVerify(token: string) {
    setVerifyState("verifying");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token }),
      });
      setVerifyState(res.ok ? "success" : "error");
      if (res.ok) refreshUser();
    } catch {
      setVerifyState("error");
    }
  }

  // ── Generic API call helper ───────────────────────────────────────────────
  async function apiCall(path: string, body: object) {
    // Read CSRF token from cookie (set as non-httpOnly by server)
    const csrfToken = document.cookie
      .split("; ")
      .find((r) => r.startsWith("cf_csrf="))
      ?.split("=")[1] || "";

    const res  = await fetch(path, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiCall("/api/auth/login", { email, password });

      if (data.mfaRequired) {
        // Server signalled MFA is required — switch to MFA flow
        setMode("mfa");
        toast.info("Enter your authenticator code to continue.");
        return;
      }

      await refreshCsrf();
      const updatedUser = await refreshUser();
      if (updatedUser) {
        toast.success(`Welcome back, ${updatedUser.fullName}!`);
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Login with MFA ────────────────────────────────────────────────────────
  async function handleMfaLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiCall("/api/auth/login", { email, password, otpCode });
      await refreshCsrf();
      const updatedUser = await refreshUser();
      if (updatedUser) {
        toast.success(`Welcome back, ${updatedUser.fullName}!`);
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid MFA code");
    } finally {
      setLoading(false);
    }
  }

  // ── Signup ────────────────────────────────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall("/api/auth/signup", { email, password, fullName, phone: phone || undefined });

      await refreshCsrf();
      const updatedUser = await refreshUser();
      if (updatedUser) {
        toast.success("Account created! Please check your email to verify your address.");
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiCall("/api/auth/forgot-password", { email });
      toast.success(data.message);
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Reset password ────────────────────────────────────────────────────────
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiCall("/api/auth/reset-password", { token: resetToken, password: newPassword });
      toast.success(data.message);
      setMode("login");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-background relative">
      <ThemeToggle className="absolute top-4 right-4 z-20" />
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        <img
          src="/auth-clinic.jpg"
          alt="Clinic"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-primary-foreground">ClinicFlow</span>
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-bold text-sidebar-primary-foreground leading-tight">
            Streamline your<br />clinic operations
          </h1>
          <p className="text-sidebar-foreground/80 text-lg max-w-md">
            Enterprise-grade healthcare management with bank-level security.
          </p>
          <div className="flex flex-col gap-2 mt-6">
            {[
              { icon: "🔐", text: "End-to-end encrypted sessions" },
              { icon: "🛡️", text: "Multi-factor authentication" },
              { icon: "📧", text: "Email-verified accounts" },
              { icon: "📊", text: "Complete audit trail" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sidebar-foreground/80 text-sm">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-sidebar-foreground/50 text-sm">
          © {new Date().getFullYear()} ClinicFlow
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ClinicFlow</span>
          </div>

          {/* ── Email verify screen ────────────────────────────────────────── */}
          {mode === "verify-email" && (
            <div className="text-center space-y-4 py-8">
              {verifyState === "verifying" && (
                <>
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Verifying your email…</p>
                </>
              )}
              {verifyState === "success" && (
                <>
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
                  <h2 className="text-xl font-bold">Email Verified!</h2>
                  <p className="text-muted-foreground">Your email has been confirmed. You now have full access.</p>
                  <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                </>
              )}
              {verifyState === "error" && (
                <>
                  <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
                  <h2 className="text-xl font-bold">Verification Failed</h2>
                  <p className="text-muted-foreground">This link may have expired or already been used.</p>
                  <Button onClick={() => setMode("login")}>Back to Sign In</Button>
                </>
              )}
            </div>
          )}

          {/* ── MFA screen ────────────────────────────────────────────────── */}
          {mode === "mfa" && (
            <>
              <div className="space-y-2">
                <button onClick={() => setMode("login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Two-Factor Auth</h2>
                    <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleMfaLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Authentication Code</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    autoFocus
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || otpCode.length !== 6}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify & Sign In
                </Button>
              </form>
            </>
          )}

          {/* ── Login form ─────────────────────────────────────────────────── */}
          {mode === "login" && (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Welcome back</h2>
                <p className="text-muted-foreground">Sign in to your clinic dashboard</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@clinic.com" className="pl-9" required autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Password</Label>
                    <button type="button" onClick={() => setMode("forgot")}
                      className="text-xs text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="pl-9 pr-10" required autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Admin",        email: "admin@clinicflow.com",        pw: "Admin@123" },
                    { label: "Doctor",       email: "doctor@clinicflow.com",       pw: "Doctor@123" },
                    { label: "Receptionist", email: "receptionist@clinicflow.com", pw: "Recept@123" },
                    { label: "Doctor 2",     email: "doctor2@clinicflow.com",      pw: "Doctor@123" },
                  ].map((d) => (
                    <button key={d.label} type="button"
                      onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                      className="text-left p-2 rounded border border-border hover:bg-background transition-colors">
                      <span className="font-medium block">{d.label}</span>
                      <span className="text-muted-foreground truncate block">{d.email}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
                  Sign up
                </button>
              </p>
            </>
          )}

          {/* ── Signup form ────────────────────────────────────────────────── */}
          {mode === "signup" && (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Create an account</h2>
                <p className="text-muted-foreground">Get started with ClinicFlow</p>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Jane Smith" className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@clinic.com" className="pl-9" required autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92-300-1234567" className="pl-9" />
                  </div>
                </div>
                <div className="rounded-lg border border-info/30 bg-info/5 p-3 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    New accounts here are always created as <span className="font-medium text-foreground">Patient</span>.
                    Doctor, receptionist, and admin accounts are created by an existing admin from the Admin Panel.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="pl-9 pr-10" required autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* ── Forgot password ────────────────────────────────────────────── */}
          {mode === "forgot" && (
            <>
              <div className="space-y-1">
                <button onClick={() => setMode("login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
                <h2 className="text-2xl font-bold">Reset your password</h2>
                <p className="text-muted-foreground">
                  Enter your email and we'll send you a secure reset link.
                </p>
              </div>
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@clinic.com" className="pl-9" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
              </form>
            </>
          )}

          {/* ── Reset password ─────────────────────────────────────────────── */}
          {mode === "reset" && (
            <>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Choose new password</h2>
                <p className="text-muted-foreground">Enter your new password below.</p>
              </div>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showNewPassword ? "text" : "password"} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••"
                      className="pl-9 pr-10" required autoComplete="new-password" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={newPassword} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}