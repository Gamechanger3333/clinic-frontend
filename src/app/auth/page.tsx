"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("receptionist");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { refreshUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, fullName, role, phone: phone || undefined };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (mode === "signup") {
        toast.success("Account created! Welcome to ClinicFlow.");
      } else {
        toast.success("Welcome back!");
      }

      // BUG FIX 3: Wait for refreshUser to complete and confirm user is set
      // before navigating — prevents ProtectedRoute from bouncing back to /auth
      const updatedUser = await refreshUser();
      if (updatedUser) {
        router.push("/dashboard");
      } else {
        toast.error("Session could not be established. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        <img
          src="/auth-clinic.jpg"
          alt="Modern hospital corridor"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-primary-foreground">ClinicFlow</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-sidebar-primary-foreground leading-tight">
            Streamline your<br />clinic operations
          </h1>
          <p className="text-sidebar-foreground/80 text-lg max-w-md">
            Manage appointments, patients, prescriptions, and billing — all in one place.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Admin", "Doctor", "Receptionist", "Patient"].map((r) => (
              <span
                key={r}
                className="px-3 py-1 rounded-full text-xs font-medium bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sidebar-foreground/50 text-sm">
          © {new Date().getFullYear()} ClinicFlow — Alif Dev Studio
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ClinicFlow</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your clinic dashboard"
                : "Get started with your clinic management"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92-300-1234567"
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient — Self-service portal</SelectItem>
                      <SelectItem value="doctor">Doctor — Clinical tools</SelectItem>
                      <SelectItem value="receptionist">Receptionist — Front desk</SelectItem>
                      <SelectItem value="admin">Admin — Full system access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          {/* Demo credentials — BUG FIX 4: passwords match seeded data */}
          {mode === "login" && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setEmail("admin@clinicflow.com"); setPassword("Admin@123"); }}
                  className="text-left p-2 rounded border border-border hover:bg-background transition-colors"
                >
                  <span className="font-medium block">Admin</span>
                  <span className="text-muted-foreground">admin@clinicflow.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("doctor@clinicflow.com"); setPassword("Doctor@123"); }}
                  className="text-left p-2 rounded border border-border hover:bg-background transition-colors"
                >
                  <span className="font-medium block">Doctor</span>
                  <span className="text-muted-foreground">doctor@clinicflow.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("receptionist@clinicflow.com"); setPassword("Recept@123"); }}
                  className="text-left p-2 rounded border border-border hover:bg-background transition-colors"
                >
                  <span className="font-medium block">Receptionist</span>
                  <span className="text-muted-foreground">receptionist@clinicflow.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("doctor2@clinicflow.com"); setPassword("Doctor@123"); }}
                  className="text-left p-2 rounded border border-border hover:bg-background transition-colors"
                >
                  <span className="font-medium block">Doctor 2</span>
                  <span className="text-muted-foreground">doctor2@clinicflow.com</span>
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
