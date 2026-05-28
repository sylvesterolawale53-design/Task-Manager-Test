import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tasks — Planner hub" },
      { name: "description", content: "Capture your tasks and keep them under control." },
    ],
  }),
  component: Index,
});

type Task = { id: string; title: string; done: boolean };
const STORAGE_KEY = "tasks.v1";

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {
      // ignore parse error
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loaded]);

  const addTask = () => {
    const title = input.trim();
    if (!title) return;
    setTasks((list) => [{ id: crypto.randomUUID(), title, done: false }, ...list]);
    setInput("");
  };

  const toggleTask = (id: string) => setTasks((list) => list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  const removeTask = (id: string) => setTasks((list) => list.filter((item) => item.id !== id));

  const clearDone = () => setTasks((list) => list.filter((item) => !item.done));

  const filteredTasks = tasks.filter((item) =>
    filter === "all" ? true : filter === "active" ? !item.done : item.done,
  );

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <main className="min-h-screen pb-28 bg-background">
      <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Tasks</p>
          <h1 className="mt-2 text-5xl sm:text-6xl font-display leading-none text-foreground">
            Your task list<span className="text-accent">.</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            {remaining === 0 ? "All clear. Add something to begin." : `${remaining} thing${remaining === 1 ? "" : "s"} to do.`}
          </p>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a task"
            className="h-12 bg-card text-base"
          />
          <Button onClick={addTask} size="lg" className="h-12 px-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="size-5" />
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {(["all", "active", "done"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  "px-3 py-1 rounded-full capitalize transition-colors",
                  filter === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          {tasks.some((task) => task.done) && (
            <button onClick={clearDone} className="text-muted-foreground hover:text-foreground">
              Clear completed
            </button>
          )}
        </div>

        <ul className="mt-6 space-y-2">
          {filteredTasks.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
              Nothing here.
            </li>
          ) : (
            filteredTasks.map((task) => (
              <li
                key={task.id}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-accent/40"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    task.done ? "border-success bg-success text-background" : "border-border hover:border-accent",
                  )}
                  aria-label={task.done ? "Mark as not done" : "Mark as done"}
                >
                  {task.done && <Check className="size-4" strokeWidth={3} />}
                </button>
                <span className={cn("flex-1 text-base transition-colors", task.done && "text-muted-foreground line-through")}>{task.title}</span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  aria-label="Delete task"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}
