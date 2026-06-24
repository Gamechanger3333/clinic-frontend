"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Store, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", genericName: "", category: "", unit: "tablets", stockQuantity: "0", reorderLevel: "10", unitPrice: "0", manufacturer: "", expiryDate: "", description: "" };

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState("0");

  const fetchMeds = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (showLowStock) params.set("lowStock", "true");
    fetch(`/api/medicines?${params}`).then((r) => r.json()).then((d) => setMedicines(d.medicines || []));
  };

  useEffect(() => { fetchMeds(); }, [search, showLowStock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/medicines/${editId}` : "/api/medicines";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, stockQuantity: parseInt(form.stockQuantity), reorderLevel: parseInt(form.reorderLevel), unitPrice: parseFloat(form.unitPrice) }),
    });
    if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error"); return; }
    toast.success(editId ? "Medicine updated" : "Medicine added");
    setDialogOpen(false); setEditId(null); setForm(EMPTY_FORM); fetchMeds();
  };

  const openEdit = (m: any) => {
    setForm({ name: m.name, genericName: m.genericName, category: m.category, unit: m.unit, stockQuantity: String(m.stockQuantity), reorderLevel: String(m.reorderLevel), unitPrice: String(m.unitPrice), manufacturer: m.manufacturer || "", expiryDate: m.expiryDate || "", description: m.description || "" });
    setEditId(m.id); setDialogOpen(true);
  };

  const handleRestock = async (id: string) => {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    const med = medicines.find((m) => m.id === id);
    if (!med) return;
    const res = await fetch(`/api/medicines/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockQuantity: med.stockQuantity + qty }) });
    if (!res.ok) { toast.error("Restock failed"); return; }
    toast.success(`Added ${qty} units`);
    setRestockId(null); setRestockQty("0"); fetchMeds();
  };

  const lowStockCount = medicines.filter((m) => m.stockQuantity <= m.reorderLevel).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Pharmacy Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage medicine stock and reorder levels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(EMPTY_FORM); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Medicine</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "Edit Medicine" : "Add Medicine"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="col-span-2 space-y-2"><Label>Generic Name *</Label><Input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Category *</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Antibiotic" required /></div>
                <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="tablets" /></div>
                <div className="space-y-2"><Label>Stock Quantity</Label><Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} /></div>
                <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} /></div>
                <div className="space-y-2"><Label>Unit Price ($)</Label><Input type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></div>
                <div className="space-y-2"><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></div>
                <div className="col-span-2 space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
                <div className="col-span-2 space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              </div>
              <Button type="submit" className="w-full">{editId ? "Update" : "Add"} Medicine</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl p-4 text-warning">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{lowStockCount} medicine{lowStockCount !== 1 ? "s" : ""} running low on stock</p>
          <Button variant="ghost" size="sm" className="ml-auto text-warning hover:text-warning" onClick={() => setShowLowStock(!showLowStock)}>
            {showLowStock ? "Show All" : "Show Low Stock"}
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Medicine", "Category", "Stock", "Reorder Level", "Price", "Expiry", "Actions"].map((h) => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {medicines.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No medicines in inventory</p>
                </td></tr>
              ) : medicines.map((m) => {
                const isLow = m.stockQuantity <= m.reorderLevel;
                return (
                  <tr key={m.id} className={`hover:bg-muted/30 transition-colors ${isLow ? "bg-warning/5" : ""}`}>
                    <td className="p-4">
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.genericName}</p>
                    </td>
                    <td className="p-4 text-sm">{m.category}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {restockId === m.id ? (
                          <div className="flex items-center gap-1">
                            <Input type="number" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} className="w-20 h-7 text-xs" />
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleRestock(m.id)}>Add</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setRestockId(null)}>✕</Button>
                          </div>
                        ) : (
                          <>
                            <span className={`text-sm font-medium ${isLow ? "text-warning" : ""}`}>{m.stockQuantity} {m.unit}</span>
                            {isLow && <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-full font-medium">Low</span>}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">{m.reorderLevel} {m.unit}</td>
                    <td className="p-4 text-sm">${m.unitPrice.toFixed(2)}</td>
                    <td className="p-4 text-sm">{m.expiryDate || "—"}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setRestockId(m.id); setRestockQty("0"); }}>Restock</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>Edit</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
