"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Download, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";

const EMPTY_FORM = { appointmentId: "", diagnosis: "", medications: "", notes: "" };

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAll = () => {
    fetch("/api/prescriptions").then((r) => r.json()).then((d) => setPrescriptions(d.prescriptions || []));
    fetch("/api/appointments").then((r) => r.json()).then((d) =>
      setAppointments((d.appointments || []).filter((a: any) => ["approved", "completed"].includes(a.status)))
    );
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apt = appointments.find((a) => a.id === form.appointmentId);
    if (!apt) return;
    const medsArray = form.medications.split("\n").filter(Boolean).map((m) => ({ name: m.trim() }));
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: form.appointmentId, patientId: apt.patient?.id, diagnosis: form.diagnosis, medications: medsArray, notes: form.notes }),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success("Prescription created");
    setDialogOpen(false); setForm(EMPTY_FORM); fetchAll();
  };

  const downloadPDF = (rx: any) => {
    const doc = new jsPDF();
    const patientName = rx.patient?.fullName || "Unknown";
    const date = format(new Date(rx.createdAt), "MMMM d, yyyy");
    const meds = (rx.medications as any[]) || [];
    const pageW = doc.internal.pageSize.getWidth();
    const doctorName = rx.doctor?.fullName || "Attending Physician";

    doc.setFillColor(15, 82, 120); doc.rect(0, 0, pageW, 38, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont(undefined!, "bold"); doc.text("ClinicFlow", 20, 18);
    doc.setFontSize(9); doc.setFont(undefined!, "normal"); doc.text("Healthcare Management System", 20, 25);
    doc.setFontSize(8); doc.text("123 Medical Center Drive  |  Tel: (555) 123-4567  |  clinic@clinicflow.com", 20, 32);
    doc.setFillColor(45, 160, 200); doc.rect(0, 38, pageW, 2, "F");
    doc.setTextColor(15, 82, 120); doc.setFontSize(16); doc.setFont(undefined!, "bold"); doc.text("MEDICAL PRESCRIPTION", 20, 52);
    doc.setFontSize(28); doc.setTextColor(45, 160, 200); doc.text("℞", pageW - 30, 54);
    doc.setDrawColor(200, 210, 220); doc.setLineWidth(0.5); doc.line(20, 56, pageW - 20, 56);
    doc.setTextColor(100); doc.setFontSize(9); doc.setFont(undefined!, "normal"); doc.text("PATIENT NAME", 20, 65); doc.text("DATE ISSUED", 120, 65);
    doc.setTextColor(30); doc.setFontSize(12); doc.setFont(undefined!, "bold"); doc.text(patientName, 20, 72);
    doc.setFont(undefined!, "normal"); doc.text(date, 120, 72);

    let y = 94;
    if (rx.diagnosis) {
      doc.setFillColor(240, 245, 250); doc.roundedRect(20, y - 5, pageW - 40, 18, 3, 3, "F");
      doc.setTextColor(100); doc.setFontSize(9); doc.text("DIAGNOSIS", 26, y + 1);
      doc.setTextColor(30); doc.setFontSize(11); doc.setFont(undefined!, "bold"); doc.text(rx.diagnosis, 26, y + 9);
      doc.setFont(undefined!, "normal"); y += 24;
    }

    doc.setTextColor(15, 82, 120); doc.setFontSize(12); doc.setFont(undefined!, "bold"); doc.text("Prescribed Medications", 20, y); y += 3;
    doc.setDrawColor(45, 160, 200); doc.setLineWidth(0.8); doc.line(20, y, 80, y); y += 8;
    doc.setTextColor(30); doc.setFontSize(11); doc.setFont(undefined!, "normal");
    meds.forEach((m: any, i: number) => {
      if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(20, y - 4, pageW - 40, 9, "F"); }
      doc.setTextColor(45, 160, 200); doc.setFont(undefined!, "bold"); doc.text(`${i + 1}.`, 24, y + 2);
      doc.setTextColor(30); doc.setFont(undefined!, "normal"); doc.text(m.name, 34, y + 2); y += 9;
    });

    if (rx.notes) {
      y += 8; doc.setTextColor(15, 82, 120); doc.setFontSize(12); doc.setFont(undefined!, "bold"); doc.text("Additional Notes", 20, y); y += 8;
      doc.setTextColor(60); doc.setFontSize(10); doc.setFont(undefined!, "normal");
      const lines = doc.splitTextToSize(rx.notes, pageW - 40); doc.text(lines, 20, y); y += lines.length * 5 + 4;
    }

    const sigY = Math.max(y + 20, 230);
    doc.setDrawColor(180); doc.setLineWidth(0.3); doc.line(pageW - 90, sigY, pageW - 20, sigY);
    doc.setTextColor(30); doc.setFontSize(11); doc.setFont(undefined!, "bold"); doc.text(`Dr. ${doctorName}`, pageW - 90, sigY + 7);
    doc.setFont(undefined!, "normal"); doc.setFontSize(9); doc.setTextColor(100); doc.text("Attending Physician", pageW - 90, sigY + 13);

    const footerY = doc.internal.pageSize.getHeight() - 12;
    doc.setDrawColor(200, 210, 220); doc.setLineWidth(0.3); doc.line(20, footerY - 4, pageW - 20, footerY - 4);
    doc.setTextColor(150); doc.setFontSize(7);
    doc.text("This prescription is valid for 30 days from the date of issue.", 20, footerY);
    doc.text(`Generated by ClinicFlow  •  ${format(new Date(), "MMM d, yyyy HH:mm")}`, 20, footerY + 4);
    doc.save(`prescription-${patientName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">Manage patient prescriptions</p>
        </div>
        {user?.role === "doctor" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Prescription</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Prescription</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Appointment *</Label>
                  <Select value={form.appointmentId} onValueChange={(v) => setForm({ ...form, appointmentId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select appointment" /></SelectTrigger>
                    <SelectContent>
                      {appointments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.patient?.fullName} — {format(new Date(a.appointmentDate), "MMM d, yyyy")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Medications (one per line)</Label>
                  <Textarea value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} rows={4} placeholder={"Amoxicillin 500mg - 3x daily\nIbuprofen 400mg - as needed"} />
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
                <Button type="submit" className="w-full">Create Prescription</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Patient","Date","Diagnosis","Medications","Actions"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {prescriptions.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                  <img src="/prescriptions-medicine.jpg" alt="Prescriptions" className="w-24 h-24 rounded-xl object-cover mx-auto mb-4 opacity-60" loading="lazy" />
                  <p>No prescriptions yet</p>
                </td></tr>
              ) : prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{rx.patient?.fullName || "Unknown"}</td>
                  <td className="p-4 text-sm">{format(new Date(rx.createdAt), "MMM d, yyyy")}</td>
                  <td className="p-4 text-sm">{rx.diagnosis || "—"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(rx.medications as any[])?.map((m: any, i: number) => (
                        <span key={i} className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">{m.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => downloadPDF(rx)} title="Download PDF"><Download className="w-4 h-4" /></Button>
                    </div>
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
