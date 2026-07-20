"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import AiAssistant from "@/components/AiAssistant";
import ThemeToggle from "@/components/ThemeToggle";
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
  Menu,
  X,
} from "lucide-react";

export default function IndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [
    {
      src: "/hero-medical.jpg",
      eyebrow: "AI Powered Healthcare Management Platform",
      title: <>Clinical efficiency meets <span className="text-primary">modern precision.</span></>,
      desc: "ClinicFlow unifies patient management, appointments, prescriptions, and billing into one fast, role-aware system built for real healthcare teams.",
    },
    {
      src: "/patients-care.jpg",
      eyebrow: "Complete Patient Care",
      title: <>Every patient record, <span className="text-primary">always in reach.</span></>,
      desc: "Full medical histories, allergies, and care plans — accessible instantly by the right role, every single time.",
    },
    {
      src: "/dashboard-medical.jpg",
      eyebrow: "Real-Time Operations",
      title: <>See your clinic <span className="text-primary">the moment it happens.</span></>,
      desc: "Live dashboards for admins, doctors, and staff — appointments, revenue, and stock levels, updated in real time.",
    },
    {
      src: "/appointments-calendar.jpg",
      eyebrow: "Smart Scheduling",
      title: <>Never double-book <span className="text-primary">another appointment.</span></>,
      desc: "Conflict-free scheduling across every doctor and department, with automated reminders for patients and staff.",
    },
    {
      src: "/prescriptions-medicine.jpg",
      eyebrow: "Pharmacy & Prescriptions",
      title: <>From prescription to pharmacy, <span className="text-primary">fully tracked.</span></>,
      desc: "Digital prescriptions, live medicine stock, and expiry tracking — connected end to end.",
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setHeroSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

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
      desc: "Granular permissions for admins, doctors, receptionists, and patients, with secure, encrypted sessions.",
    },
  ];

  const roles = [
    {
      role: "Admin",
      color: "bg-primary/10 text-primary border-primary/20",
      dot: "bg-primary",
      image: "/dashboard-medical.jpg",
      desc: "Full system access — manage users, departments, billing, and view complete analytics.",
      perms: ["Manage all users & roles", "View revenue reports", "Configure departments", "Access all records"],
    },
    {
      role: "Doctor",
      color: "bg-info/10 text-info border-info/20",
      dot: "bg-info",
      image: "/patients-care.jpg",
      desc: "Clinical tools — appointments, prescriptions, lab reports, and patient medical records.",
      perms: ["View assigned patients", "Create prescriptions", "Order lab tests", "Write medical records"],
    },
    {
      role: "Receptionist",
      color: "bg-warning/10 text-warning border-warning/20",
      dot: "bg-warning",
      image: "/appointments-calendar.jpg",
      desc: "Front-desk operations — schedule appointments, register patients, and handle billing.",
      perms: ["Book appointments", "Register new patients", "Generate invoices", "Send notifications"],
    },
    {
      role: "Patient",
      color: "bg-success/10 text-success border-success/20",
      dot: "bg-success",
      image: "/prescriptions-medicine.jpg",
      desc: "Self-service portal — view appointments, prescriptions, lab results, and medical history.",
      perms: ["View appointments", "Access prescriptions", "Check lab reports", "View medical records"],
    },
  ];

  const stats = [
    { value: "4", label: "Care Team Roles" },
    { value: "12+", label: "Clinical Modules" },
    { value: "24/7", label: "Real-Time Access" },
    { value: "Bank-Level", label: "Data Security" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
              <Heart className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight truncate">ClinicFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="hover:text-foreground transition-colors">Roles</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle className="w-9 h-9 static shadow-none border border-border" />
            <Link
              href="/auth"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground/80 hover:text-foreground flex-shrink-0"
            >
              {menuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        {menuOpen && (
          <nav className="md:hidden border-t border-border/40 bg-background px-4 py-3 flex flex-col gap-1 text-sm font-medium text-muted-foreground">
            <a href="#features" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-foreground transition-colors">Features</a>
            <a href="#roles" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-foreground transition-colors">Roles</a>
            <a href="#about" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-foreground transition-colors">About</a>
            <Link href="/auth" onClick={() => setMenuOpen(false)} className="py-2.5 hover:text-foreground transition-colors sm:hidden">Sign In</Link>
          </nav>
        )}
      </header>

      <main>
        {/* Hero — full-bleed rotating photo carousel, like the reference layout */}
        <section className="relative overflow-hidden">
          <div className="relative min-h-[640px] md:min-h-[740px] flex items-center">
            {/* Stacked slides, crossfading */}
            {heroSlides.map((slide, i) => (
              <img
                key={slide.src}
                src={slide.src}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  i === heroSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {/* Overlay — light and smooth, relies mostly on text-shadow for readability so the photo stays fully visible on both sides */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.05)_25%,rgba(0,0,0,0.05)_65%,rgba(0,0,0,0.4)_100%)] md:bg-[linear-gradient(to_right,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.38)_28%,rgba(0,0,0,0.15)_50%,transparent_68%)]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
              <div key={heroSlide} className="max-w-2xl animate-hero-fade">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur px-3 py-1 text-sm font-medium text-white mb-8">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  {heroSlides[heroSlide].eyebrow}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8),0_4px_30px_rgba(0,0,0,0.6)]">
                  {heroSlides[heroSlide].title}
                </h1>

                <p className="text-lg md:text-xl text-white/95 mb-10 max-w-xl [text-shadow:0_1px_6px_rgba(0,0,0,0.85),0_2px_16px_rgba(0,0,0,0.6)]">
                  {heroSlides[heroSlide].desc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/auth"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Managing Your Clinic
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-white/10 backdrop-blur transition-colors"
                >
                  Sign In to Portal
                </Link>
              </div>

              {/* Slide indicators */}
              <div className="flex items-center gap-2 mt-12">
                {heroSlides.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => setHeroSlide(i)}
                    aria-label={`Show slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === heroSlide ? "w-8 bg-primary" : "w-4 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stats bar — overlaid on the bottom edge of the photo */}
            <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/50 backdrop-blur">
              <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((s) => (
                  <div key={s.label} className="text-center md:text-left">
                    <div className="text-3xl font-bold text-primary">{s.value}</div>
                    <div className="text-sm text-white/70 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
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

            <div className="grid lg:grid-cols-5 gap-10 items-start mb-16">
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-border shadow-xl">
                <img
                  src="/prescriptions-medicine.jpg"
                  alt="ClinicFlow modules in action"
                  className="w-full object-cover h-[280px] lg:h-[420px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <p className="text-sm font-medium text-white/80 mb-1">12+ connected modules</p>
                  <p className="text-lg font-semibold">One system, zero silos</p>
                </div>
              </div>

              <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
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
              {roles.map(({ role, color, dot, image, desc, perms }) => (
                <div key={role} className="bg-background rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={image}
                      alt={`${role} role`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                  </div>
                  <div className="p-6 pt-0">
                    <div className={`relative -mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-4 bg-background ${color}`}>
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
                  Spend less time navigating software and more time with patients. ClinicFlow's real-time system presents the right data at the right moment — every time.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Secure, encrypted patient records",
                    "Every login protected — no shared passwords",
                    "Role-based access across your whole team",
                    "Live dashboards, always up to date",
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
              Healthcare management platform for modern clinical environments — built for real doctors, staff, and patients.
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
            <h4 className="font-semibold mb-4">Security & Trust</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Encrypted patient data</li>
              <li>Secure, private sessions</li>
              <li>Role-based access control</li>
              <li>Full activity audit trail</li>
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