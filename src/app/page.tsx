"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Heart, CalendarDays, Users, FileText, Shield } from "lucide-react";
import heroImage from "../../public/hero-medical.jpg";

export default function IndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (user) return null;

  const features = [
    { icon: CalendarDays, title: "Appointment Management", desc: "Schedule and track appointments with a smart calendar interface." },
    { icon: Users, title: "Patient Records", desc: "Maintain comprehensive patient profiles and medical history." },
    { icon: FileText, title: "Digital Prescriptions", desc: "Create, manage and email prescriptions with PDF export." },
    { icon: Shield, title: "Role-Based Access", desc: "Secure access control for admins, doctors, and receptionists." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-display font-bold">ClinicFlow</span>
          </div>
          <Link href="/auth" className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-display font-bold leading-tight mb-6">
          Streamline your<br /><span className="text-primary">clinic operations</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Manage appointments, patients, and prescriptions all in one place. Built for modern healthcare teams.
        </p>
        <Link href="/auth" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-base font-semibold hover:bg-primary/90 transition-colors inline-block">
          Get Started Free
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="stat-card text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 ClinicFlow. All rights reserved.
      </footer>
    </div>
  );
}
