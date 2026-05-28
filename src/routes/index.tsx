import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tasks — A calm place to get things done" },
      { name: "description", content: "A simple, focused task manager to capture what matters and check it off." },
      { property: "og:title", content: "Tasks" },
      { property: "og:description", content: "A simple, focused task manager." },
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
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const add = () => {
    const title = input.trim();
    if (!title) return;
    setTasks((t) => [{ id: crypto.randomUUID(), title, done: false }, ...t]);
    setInput("");
  };

  const toggle = (id: string) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id: string) => setTasks((t) => t.filter((x) => x.id !== id));
  const clearDone = () => setTasks((t) => t.filter((x) => !x.done));

  const filtered = tasks.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done,
  );
  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Today</p>
          <h1 className="mt-2 text-5xl sm:text-6xl font-display leading-none text-foreground">
            Your tasks<span className="text-accent">.</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            {remaining === 0 ? "All clear. Add something to begin." : `${remaining} thing${remaining === 1 ? "" : "s"} to do.`}
          </p>
        </header>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="What needs doing?"
            className="h-12 bg-card text-base"
          />
          <Button onClick={add} size="lg" className="h-12 px-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="size-5" />
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {(["all", "active", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-full capitalize transition-colors",
                  filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {tasks.some((t) => t.done) && (
            <button onClick={clearDone} className="text-muted-foreground hover:text-foreground">
              Clear completed
            </button>
          )}
        </div>

        <ul className="mt-6 space-y-2">
          {filtered.length === 0 && (
            <li className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
              Nothing here.
            </li>
          )}
          {filtered.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-accent/40"
            >
              <button
                onClick={() => toggle(t.id)}
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  t.done
                    ? "border-success bg-success text-background"
                    : "border-border hover:border-accent",
                )}
                aria-label={t.done ? "Mark as not done" : "Mark as done"}
              >
                {t.done && <Check className="size-4" strokeWidth={3} />}
              </button>
              <span
                className={cn(
                  "flex-1 text-base transition-colors",
                  t.done && "text-muted-foreground line-through",
                )}
              >
                {t.title}
              </span>
              <button
                onClick={() => remove(t.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                aria-label="Delete task"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
