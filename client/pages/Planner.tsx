import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/navigation/BottomNav";
import { addTask, getTasks, removeTask, updateTask, type Priority, type Task } from "@/lib/planner";
import { Plus, Trash2, Check, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Planner() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => { setTasks(getTasks()); }, []);

  const create = () => {
    if (!title.trim()) return;
    const t = addTask({ title: title.trim(), priority, done: false });
    setTasks((x) => [t, ...x]);
    setTitle("");
  };

  const toggleDone = (id: string, done: boolean) => {
    updateTask(id, { done });
    setTasks(getTasks());
  };

  const changePriority = (id: string, p: Priority) => { updateTask(id, { priority: p }); setTasks(getTasks()); };
  const del = (id: string) => { removeTask(id); setTasks(getTasks()); };

  const colorFor = (p: Priority) => p === "high" ? "bg-primary/15 text-primary" : p === "low" ? "bg-accent/30 text-foreground" : "bg-secondary/25 text-foreground";

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Trip To-Do Planner</h1>
        </div>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Add Task</CardTitle>
            <CardDescription>Quickly capture travel tasks and plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="e.g., Book Kyoto hotel" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Button onClick={create}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Priority:</Label>
              {["low","medium","high"].map((p) => (
                <button key={p} onClick={() => setPriority(p as Priority)} className={`px-3 py-1 rounded-full text-xs ${priority===p?"bg-primary text-white":"bg-muted"}`}>{p}</button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id} className="bg-white/90 border-[hsl(var(--border))]">
              <CardContent className="py-4 flex items-center gap-3">
                <button aria-label="done" onClick={() => toggleDone(t.id, !t.done)} className={`p-2 rounded-full ${t.done?"bg-primary text-white":"bg-muted text-foreground/70"}`}>
                  <Check className="h-4 w-4" />
                </button>
                <div className="flex-1">
                  <div className={`font-medium ${t.done?"line-through text-foreground/60":""}`}>{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.notes || ""}</div>
                </div>
                <Badge className={`${colorFor(t.priority)} capitalize`}>{t.priority}</Badge>
                <div className="flex items-center gap-2">
                  <button aria-label="priority-low" onClick={() => changePriority(t.id, "low")} className="p-2 rounded-lg hover:bg-muted"><Star className="h-4 w-4 opacity-50" /></button>
                  <button aria-label="priority-high" onClick={() => changePriority(t.id, "high")} className="p-2 rounded-lg hover:bg-muted"><Star className="h-4 w-4" /></button>
                  <button aria-label="delete" onClick={() => del(t.id)} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks yet. Use the AI assistant to generate suggestions or add your own.</p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
