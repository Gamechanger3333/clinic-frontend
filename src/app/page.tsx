"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import AiAssistant from "@/components/AiAssistant";
import {
  Heart,
  CalendarDays,
  Users,
  FileText,
  Shield,
  Stethoscope,
  FlaskConical,
  Pill,
  CreditCard,
  Building2,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react";

export default function IndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (user) return null;

  const features = [
    {
      icon: CalendarDays,
      title: "Smart Scheduling",
      desc: "Intelligent appointment routing with conflict detection and automated reminders for patients and doctors.",
    },
    {
      icon: Users,
      title: "Patient Records",
      desc: "Complete medical histories, allergies, blood groups, and emergency contacts in one unified profile.",
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      desc: "Create, manage, and share prescriptions with medication tracking and follow-up scheduling.",
    },
    {
      icon: FlaskConical,
      title: "Lab Reports",
      desc: "Seamless test ordering with result reporting, normal range tracking, and status monitoring.",
    },
    {
      icon: Pill,
      title: "Pharmacy & Inventory",
      desc: "Real-time medicine stock management with low-stock alerts and expiry date tracking.",
    },
    {
      icon: CreditCard,
      title: "Billing & Invoicing",
      desc: "Automated invoice generation, payment tracking, and revenue analytics for your clinic.",
    },
    {
      icon: Building2,
      title: "Department Management",
      desc: "Organize doctors by department, manage specializations, and track department performance.",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      desc: "Granular permissions for admins, doctors, receptionists, and patients with secure JWT auth.",
    },
  ];

  const roles = [
    {
      role: "Admin",
      color: "bg-primary/10 text-primary border-primary/20",
      dot: "bg-primary",
      desc: "Full system access — manage users, departments, billing, and view complete analytics.",
      perms: ["Manage all users & roles", "View revenue reports", "Configure departments", "Access all records"],
    },
    {
      role: "Doctor",
      color: "bg-info/10 text-info border-info/20",
      dot: "bg-info",
      desc: "Clinical tools — appointments, prescriptions, lab reports, and patient medical records.",
      perms: ["View assigned patients", "Create prescriptions", "Order lab tests", "Write medical records"],
    },
    {
      role: "Receptionist",
      color: "bg-warning/10 text-warning border-warning/20",
      dot: "bg-warning",
      desc: "Front-desk operations — schedule appointments, register patients, and handle billing.",
      perms: ["Book appointments", "Register new patients", "Generate invoices", "Send notifications"],
    },
    {
      role: "Patient",
      color: "bg-success/10 text-success border-success/20",
      dot: "bg-success",
      desc: "Self-service portal — view appointments, prescriptions, lab results, and medical history.",
      perms: ["View appointments", "Access prescriptions", "Check lab reports", "View medical records"],
    },
  ];

  const stats = [
    { value: "4", label: "User Roles" },
    { value: "12+", label: "Modules" },
    { value: "100%", label: "Real Data" },
    { value: "JWT", label: "Secure Auth" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Heart className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ClinicFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="hover:text-foreground transition-colors">Roles</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden">
          {/* Grid bg */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]" />

          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              AI Powered Healthcare Management Platform
            </div>

            <h1 className="max-w-4xl mx-auto text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Clinical efficiency meets{" "}
              <br className="hidden md:block" />
              <span className="text-primary">modern precision.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              ClinicFlow unifies patient management, appointments, prescriptions, and billing into one fast, role-aware system built for real healthcare teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                Start Managing Your Clinic
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-border px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-muted transition-colors"
              >
                Sign In to Portal
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-primary">{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hero image */}
        <section className="max-w-7xl mx-auto px-6 pb-24 -mt-8">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-sidebar">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
            <img
              src="/hero-medical.jpg"
              alt="ClinicFlow Dashboard"
              className="w-full object-cover h-[360px] md:h-[520px]"
            />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-white/70">Live System</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Built for the frontline</h3>
              <p className="text-white/75 max-w-md">Empowering medical staff with real-time tools to deliver exceptional patient care.</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-muted/50 py-24 md:py-32 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything a modern clinic needs
              </h2>
              <p className="text-muted-foreground text-lg">
                All modules connected, all data real — no dummy placeholders, no mock APIs.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-background rounded-xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles section */}
        <section id="roles" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Four roles, one platform
              </h2>
              <p className="text-muted-foreground text-lg">
                Every user sees exactly what they need — nothing more, nothing less.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {roles.map(({ role, color, dot, desc, perms }) => (
                <div key={role} className="bg-background rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    {role}
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{desc}</p>
                  <ul className="space-y-2">
                    {perms.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Split CTA */}
        <section id="about" className="border-t border-border py-24 md:py-32 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Patient care, uninterrupted.
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Spend less time navigating software and more time with patients. ClinicFlow's real-time system presents the right data at the right moment — with zero dummy content.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Real PostgreSQL database with Prisma ORM",
                    "JWT authentication with httpOnly cookie sessions",
                    "Role-based access control across all modules",
                    "Live dashboard stats from real patient data",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl">
                <img
                  src="/patients-care.jpg"
                  alt="Doctor with patient"
                  className="w-full object-cover h-[400px]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">ClinicFlow</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Healthcare management platform for modern clinical environments. Built with Next.js, Prisma & PostgreSQL.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#roles" className="hover:text-foreground transition-colors">User Roles</a></li>
              <li><Link href="/auth" className="hover:text-foreground transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Modules</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Appointments</li>
              <li>Patients</li>
              <li>Prescriptions</li>
              <li>Lab Reports</li>
              <li>Billing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Tech Stack</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Next.js 15</li>
              <li>TypeScript</li>
              <li>PostgreSQL</li>
              <li>Prisma ORM</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ClinicFlow — Alif Dev Studio. All rights reserved.
        </div>
      </footer>

      <AiAssistant mode="public" />
    </div>
  );
}