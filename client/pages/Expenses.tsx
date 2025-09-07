import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import BottomNav from "@/components/navigation/BottomNav";
import { Plus, Trash2, Pencil, CheckCircle2, IndianRupee, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Participant { id: string; name: string }
interface Expense {
  id: string;
  title: string;
  amount: number;
  category: "Food" | "Transport" | "Accommodation" | "Activities" | "Misc";
  date: string; // ISO yyyy-mm-dd
  paidBy: string; // participant id
  splitBetween: string[]; // participant ids
  settled: boolean;
}

const STORAGE_KEY = "tb_expenses";

const defaultParticipants: Participant[] = [
  { id: "p1", name: "Aarav" },
  { id: "p2", name: "Priya" },
  { id: "p3", name: "Rohan" },
  { id: "p4", name: "Neha" },
];

const sampleDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
};

const defaultExpenses: Expense[] = [
  { id: crypto.randomUUID(), title: "Mumbai Hotel", amount: 8000, category: "Accommodation", date: sampleDate(4), paidBy: "p2", splitBetween: ["p1","p2","p3","p4"], settled: false },
  { id: crypto.randomUUID(), title: "Ola Ride Bengaluru", amount: 450, category: "Transport", date: sampleDate(3), paidBy: "p3", splitBetween: ["p1","p3"], settled: false },
  { id: crypto.randomUUID(), title: "Goa Shack Dinner", amount: 2200, category: "Food", date: sampleDate(1), paidBy: "p1", splitBetween: ["p1","p2","p3","p4"], settled: false },
];

function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : defaultExpenses;
  } catch {
    return defaultExpenses;
  }
}

function saveExpenses(items: Expense[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

export default function Expenses() {
  const navigate = useNavigate();
  const [participants] = useState<Participant[]>(defaultParticipants);
  const [items, setItems] = useState<Expense[]>(loadExpenses());
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("Food");
  const [date, setDate] = useState<string>(sampleDate());
  const [paidBy, setPaidBy] = useState<string>(participants[0].id);
  const [split, setSplit] = useState<Record<string, boolean>>(
    Object.fromEntries(participants.map(p => [p.id, true]))
  );

  useEffect(() => { saveExpenses(items); }, [items]);

  const total = useMemo(() => items.reduce((s, i) => s + (i.settled ? 0 : i.amount), 0), [items]);

  // Compute per-participant totals and net balances (paid - owed) excluding settled
  const perHead = useMemo(() => {
    const paid: Record<string, number> = {}; // total paid
    const owed: Record<string, number> = {}; // their share across expenses
    participants.forEach(p => { paid[p.id] = 0; owed[p.id] = 0; });

    items.forEach(e => {
      if (e.settled) return;
      paid[e.paidBy] = (paid[e.paidBy] || 0) + e.amount;
      const count = e.splitBetween.length;
      if (count > 0) {
        const share = e.amount / count;
        e.splitBetween.forEach(pid => {
          owed[pid] = (owed[pid] || 0) + share;
        });
      }
    });

    const net: Record<string, number> = {};
    participants.forEach(p => { net[p.id] = (paid[p.id] || 0) - (owed[p.id] || 0); });
    return { paid, owed, net };
  }, [items, participants]);

  // Greedy settlement suggestions
  const settlements = useMemo(() => {
    const creditors: { id: string; amount: number }[] = [];
    const debtors: { id: string; amount: number }[] = [];
    for (const p of participants) {
      const n = perHead.net[p.id] || 0;
      if (n > 1e-2) creditors.push({ id: p.id, amount: n });
      else if (n < -1e-2) debtors.push({ id: p.id, amount: -n });
    }
    creditors.sort((a,b)=>b.amount-a.amount);
    debtors.sort((a,b)=>b.amount-a.amount);
    const res: { from: string; to: string; amount: number }[] = [];
    let i=0,j=0;
    while (i<debtors.length && j<creditors.length) {
      const d = debtors[i];
      const c = creditors[j];
      const pay = Math.min(d.amount, c.amount);
      res.push({ from: d.id, to: c.id, amount: pay });
      d.amount -= pay; c.amount -= pay;
      if (d.amount <= 1e-2) i++;
      if (c.amount <= 1e-2) j++;
    }
    return res;
  }, [perHead, participants]);

  const resetForm = () => {
    setTitle(""); setAmount(""); setCategory("Food"); setDate(sampleDate()); setPaidBy(participants[0].id);
    setSplit(Object.fromEntries(participants.map(p => [p.id, true])));
  };

  const add = () => {
    const amt = parseFloat(amount);
    const selected = Object.keys(split).filter(id => split[id]);
    if (!title.trim() || isNaN(amt) || amt <= 0 || selected.length === 0) return;
    const e: Expense = { id: crypto.randomUUID(), title: title.trim(), amount: amt, category, date, paidBy, splitBetween: selected, settled: false };
    setItems(x => [e, ...x]);
    resetForm();
  };

  const del = (id: string) => setItems(x => x.filter(e => e.id !== id));

  const toggleSettled = (id: string) => setItems(x => x.map(e => e.id === id ? { ...e, settled: !e.settled } : e));

  const startEdit = (id: string) => setEditingId(id);
  const cancelEdit = () => setEditingId(null);
  const saveEdit = (id: string, patch: Partial<Expense>) => {
    setItems(x => x.map(e => e.id === id ? { ...e, ...patch } : e));
    setEditingId(null);
  };

  const nameOf = (pid: string) => participants.find(p => p.id === pid)?.name || "Unknown";

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Trip Expenses</h1>
        </div>

        {/* Summary */}
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Total and balances (excluding settled)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary flex items-center gap-1"><IndianRupee className="h-6 w-6" />{total.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Across {items.filter(i=>!i.settled).length} active expenses</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {participants.map(p => {
                const paid = perHead.paid[p.id] || 0;
                const owed = perHead.owed[p.id] || 0;
                const net = perHead.net[p.id] || 0;
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-2 bg-white/70">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Paid ₹{paid.toFixed(0)} • Owes ₹{owed.toFixed(0)} • {net>=0?"Net +₹"+net.toFixed(0):"Net -₹"+Math.abs(net).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Add Expense */}
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input placeholder="e.g., Chennai Hotel" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input placeholder="Amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
              <Input placeholder="Category (Food/Transport/...)" value={category} onChange={(e) => setCategory((e.target.value || "Food") as Expense["category"])} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              <div className="space-y-2">
                <Label>Payer</Label>
                <div className="flex flex-wrap gap-2">
                  {participants.map(p => (
                    <Button key={p.id} variant={paidBy===p.id?"default":"outline"} size="sm" onClick={()=>setPaidBy(p.id)}>{p.name}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Split Between</Label>
                <div className="flex flex-wrap gap-4">
                  {participants.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={!!split[p.id]} onCheckedChange={(v)=> setSplit(s => ({...s, [p.id]: Boolean(v)}))} /> {p.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Settlements */}
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Who owes whom</CardTitle>
            <CardDescription>Automatic equal split suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {settlements.length === 0 ? (
              <div className="text-sm text-muted-foreground">All settled. No pending balances.</div>
            ) : (
              settlements.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-md border p-2 bg-white/70">
                  <div>
                    <span className="font-medium">{nameOf(s.from)}</span> owes <span className="font-medium">{nameOf(s.to)}</span>
                  </div>
                  <div className="font-semibold">₹{s.amount.toFixed(0)}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Expenses List */}
        <div className="space-y-3">
          {items.map((e) => {
            const isEditing = editingId === e.id;
            return (
              <Card key={e.id} className="bg-white/90">
                {!isEditing ? (
                  <CardContent className="py-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{e.category}</Badge>
                      <Badge>{e.splitBetween.length} split</Badge>
                    </div>
                    <div className="font-semibold flex items-center gap-1"><IndianRupee className="h-4 w-4" />{e.amount.toLocaleString()}</div>
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant="outline">Paid by {nameOf(e.paidBy)}</Badge>
                      <Badge className={e.settled?"bg-green-100 text-green-700":"bg-amber-100 text-amber-700"}>{e.settled?"Settled":"Pending"}</Badge>
                      <Button size="sm" variant="outline" onClick={()=>startEdit(e.id)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={()=>toggleSettled(e.id)}><CheckCircle2 className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={()=>del(e.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="py-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input defaultValue={e.title} onChange={(ev)=> (e.title = ev.target.value)} />
                      <Input defaultValue={String(e.amount)} inputMode="decimal" onChange={(ev)=> (e.amount = parseFloat(ev.target.value || "0"))} />
                      <Input defaultValue={e.category} onChange={(ev)=> (e.category = ev.target.value as Expense["category"])} />
                      <Input type="date" defaultValue={e.date} onChange={(ev)=> (e.date = ev.target.value)} />
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Label>Payer:</Label>
                      {participants.map(p => (
                        <Button key={p.id} variant={e.paidBy===p.id?"default":"outline"} size="sm" onClick={()=> (e.paidBy = p.id)}>{p.name}</Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Split Between</Label>
                      <div className="flex flex-wrap gap-4">
                        {participants.map(p => (
                          <label key={p.id} className="flex items-center gap-2 text-sm">
                            <Checkbox defaultChecked={e.splitBetween.includes(p.id)} onCheckedChange={(v)=> {
                              const has = e.splitBetween.includes(p.id);
                              if (v && !has) e.splitBetween.push(p.id);
                              if (!v && has) e.splitBetween = e.splitBetween.filter(id => id !== p.id);
                            }} /> {p.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                      <Button onClick={()=> saveEdit(e.id, e)}>Save</Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
