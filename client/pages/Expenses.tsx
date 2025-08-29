import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/navigation/BottomNav";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Expense { id: string; title: string; amount: number; paidBy: string; status: "paid" | "pending" | "settled" }

export default function Expenses() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Expense[]>([
    { id: "1", title: "Kyoto Hotel", amount: 12000, paidBy: "You", status: "paid" },
    { id: "2", title: "JR Pass", amount: 4000, paidBy: "Marcus", status: "pending" },
  ]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const total = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);

  const add = () => {
    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt)) return;
    setItems((x) => [{ id: crypto.randomUUID(), title: title.trim(), amount: amt, paidBy: "You", status: "paid" }, ...x]);
    setTitle("");
    setAmount("");
  };

  const label = (s: Expense["status"]) => s === "paid" ? "bg-primary/15 text-primary" : s === "pending" ? "bg-secondary/25 text-foreground" : "bg-accent/30 text-foreground";

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Trip Expenses</h1>
        </div>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Total and balances</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-4xl font-bold text-primary">₹{total.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Across {items.length} expenses</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="e.g., Osaka Food Tour" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button onClick={add}><FaPlus className="h-4 w-4 mr-1" /> Add</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {items.map((e) => (
            <Card key={e.id} className="bg-white/90">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">Paid by {e.paidBy}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold">₹{e.amount.toLocaleString()}</div>
                  <Badge className={`${label(e.status)} capitalize`}>{e.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
