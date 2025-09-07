export type Priority = "low" | "medium" | "high";
export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  done: boolean;
}

const KEY = "tb_planner_tasks";

export function getTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function addTask(task: Omit<Task, "id">): Task {
  const t: Task = { ...task, id: crypto.randomUUID() };
  const cur = getTasks();
  const next = [t, ...cur];
  saveTasks(next);
  return t;
}

export function updateTask(id: string, patch: Partial<Task>): Task | null {
  const cur = getTasks();
  const next = cur.map((t) => (t.id === id ? { ...t, ...patch } : t));
  saveTasks(next);
  return next.find((t) => t.id === id) || null;
}

export function removeTask(id: string) {
  const cur = getTasks();
  saveTasks(cur.filter((t) => t.id !== id));
}

export function importRecommendations(items: string[]) {
  const cur = getTasks();
  const newOnes = items
    .filter((txt) => !!txt.trim())
    .map((txt) => ({ id: crypto.randomUUID(), title: txt.trim(), priority: "medium" as Priority, done: false }));
  saveTasks([...newOnes, ...cur]);
}
