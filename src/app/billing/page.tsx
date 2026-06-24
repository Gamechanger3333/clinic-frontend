"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CreditCard, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";

const statusColors: Record<string, string> = {
  unpaid: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  partial: "bg-info/10 text-info",
  cancelled: "bg-muted text-muted-foreground",
};

interface InvoiceItem { description: string; quantity: number; unitPrice: number; }

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchAll = () => {
    fetch("/api/billing/invoices").then((r) => r.json()).then((d) => setInvoices(d.invoices || []));
    fetch("/api/patients").then((r) => r.json()).then((d) => setPatients(d.patients || []));
    fetch("/api/appointments").then((r) => r.json()).then((d) => setAppointments(d.appointments || []));
  };

  useEffect(() => { fetchAll(); }, []);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: field === "description" ? value : parseFloat(value) || 0 };
    setItems(updated);
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotal - parseFloat(discount || "0") + parseFloat(tax || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) { toast.error("Select a patient"); return; }
    if (items.some((i) => !i.description)) { toast.error("All items need a description"); return; }
    const res = await fetch("/api/billing/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, appointmentId: appointmentId || undefined, items, discount: parseFloat(discount || "0"), tax: parseFloat(tax || "0"), notes, dueDate }),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success("Invoice created");
    setDialogOpen(false);
    setPatientId(""); setAppointmentId(""); setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setDiscount("0"); setTax("0"); setNotes(""); setDueDate("");
    fetchAll();
  };

  const markPaid = async (id: string) => {
    const res = await fetch(`/api/billing/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "paid" }) });
    if (!res.ok) { toast.error("Update failed"); return; }
    toast.success("Invoice marked as paid"); fetchAll();
  };

  const downloadPDF = (inv: any) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 82, 120); doc.rect(0, 0, pageW, 35, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.setFont(undefined!, "bold"); doc.text("ClinicFlow", 20, 15);
    doc.setFontSize(9); doc.setFont(undefined!, "normal"); doc.text("Healthcare Management", 20, 22);
    doc.setFontSize(8); doc.text("INVOICE", pageW - 30, 22);
    doc.setFontSize(14); doc.text(inv.invoiceNumber, pageW - 50, 15);
    doc.setTextColor(30); doc.setFontSize(10); doc.setFont(undefined!, "bold"); doc.text("Bill To:", 20, 48);
    doc.setFont(undefined!, "normal"); doc.setFontSize(10);
    doc.text(inv.patient?.fullName || "—", 20, 55);
    doc.text(inv.patient?.email || "", 20, 61);
    doc.text(inv.patient?.phone || "", 20, 67);
    doc.text(`Date: ${format(new Date(inv.createdAt), "MMM d, yyyy")}`, pageW - 70, 55);
    if (inv.dueDate) doc.text(`Due: ${format(new Date(inv.dueDate), "MMM d, yyyy")}`, pageW - 70, 62);
    doc.setFillColor(240, 245, 250); doc.rect(20, 75, pageW - 40, 8, "F");
    doc.setFont(undefined!, "bold"); doc.setFontSize(9);
    doc.text("Description", 24, 80.5); doc.text("Qty", pageW - 80, 80.5); doc.text("Price", pageW - 55, 80.5); doc.text("Total", pageW - 30, 80.5);
    let y = 90;
    doc.setFont(undefined!, "normal"); doc.setFontSize(9);
    (inv.items as any[]).forEach((item: any) => {
      doc.text(item.description, 24, y); doc.text(String(item.quantity), pageW - 80, y);
      doc.text(`$${item.unitPrice.toFixed(2)}`, pageW - 55, y); doc.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, pageW - 30, y);
      y += 8;
    });
    y += 4; doc.setDrawColor(200); doc.line(20, y, pageW - 20, y); y += 8;
    doc.text(`Subtotal: $${inv.subtotal?.toFixed(2)}`, pageW - 70, y); y += 6;
    if (inv.discount > 0) { doc.text(`Discount: -$${inv.discount?.toFixed(2)}`, pageW - 70, y); y += 6; }
    if (inv.tax > 0) { doc.text(`Tax: $${inv.tax?.toFixed(2)}`, pageW - 70, y); y += 6; }
    doc.setFont(undefined!, "bold"); doc.setFontSize(11); doc.text(`TOTAL: $${inv.total?.toFixed(2)}`, pageW - 70, y);
    doc.setFont(undefined!, "normal"); doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 20, y);
    doc.save(`invoice-${inv.invoiceNumber}.pdf`);
  };

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage patient billing and payments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Linked Appointment (optional)</Label>
                <Select value={appointmentId} onValueChange={setAppointmentId}>
                  <SelectTrigger><SelectValue placeholder="Select appointment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {appointments.filter((a) => a.patientId === patientId || !patientId).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.patient?.fullName} — {a.appointmentDate}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Items</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <Input className="col-span-5" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                    <Input className="col-span-2" type="number" placeholder="Qty" min="1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} />
                    <Input className="col-span-3" type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} />
                    <div className="col-span-1 pt-2 text-sm font-medium text-right">${(item.quantity * item.unitPrice).toFixed(0)}</div>
                    <Button type="button" variant="ghost" size="icon" className="col-span-1 h-9 w-9 text-muted-foreground" onClick={() => removeItem(i)} disabled={items.length === 1}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="space-y-2"><Label>Discount ($)</Label><Input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
                <div className="space-y-2"><Label>Tax ($)</Label><Input type="number" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} /></div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
                <div className="flex items-end pb-1">
                  <div className="text-right w-full">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">${total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
              <Button type="submit" className="w-full">Create Invoice</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Invoices", value: invoices.length, color: "bg-primary" },
          { label: "Total Collected", value: `$${totalPaid.toFixed(2)}`, color: "bg-success" },
          { label: "Outstanding", value: `$${totalPending.toFixed(2)}`, color: "bg-warning" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Invoice #", "Patient", "Date", "Total", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No invoices yet</p>
                </td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-mono font-medium">{inv.invoiceNumber}</td>
                  <td className="p-4 text-sm">{inv.patient?.fullName || "—"}</td>
                  <td className="p-4 text-sm">{format(new Date(inv.createdAt), "MMM d, yyyy")}</td>
                  <td className="p-4 text-sm font-semibold">${inv.total?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[inv.status] || ""}`}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {inv.status === "unpaid" && (
                        <Button variant="ghost" size="sm" onClick={() => markPaid(inv.id)}>Mark Paid</Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => downloadPDF(inv)} title="Download PDF">
                        <Download className="w-4 h-4" />
                      </Button>
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
