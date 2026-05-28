import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "Daily Planner — Planner hub" },
      { name: "description", content: "Organize your daily priorities for morning, afternoon, and evening." },
    ],
  }),
  component: Daily,
});

type DailyItem = { id: string; title: string; period: "morning" | "afternoon" | "evening"; done: boolean };
const STORAGE_KEY = "daily.v1";
const periods = ["morning", "afternoon", "evening"] as const;

function Daily() {
  const [items, setItems] = useState<DailyItem[]>([]);
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState<DailyItem["period"]>("morning");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setItems((list) => [{ id: crypto.randomUUID(), title: trimmedTitle, period, done: false }, ...list]);
    setTitle("");
  };

  const toggle = (id: string) =>
    setItems((list) => list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));

  const remove = (id: string) => setItems((list) => list.filter((item) => item.id !== id));
  const clearCompleted = () => setItems((list) => list.filter((item) => !item.done));

  return (
    <main className="min-h-screen pb-28 bg-background">
      <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 text-foreground">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">D</div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Daily planner</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">Plan your day</h1>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Daily priority"
              className="bg-background text-base"
            />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as DailyItem["period"])}
              className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent"
            >
              {periods.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
            <Button onClick={addItem} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="size-5" /> Add daily priority
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Daily priorities</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Your focus areas</h2>
            </div>
            {items.some((item) => item.done) && (
              <button onClick={clearCompleted} className="text-sm text-muted-foreground hover:text-foreground">
                Clear completed
              </button>
            )}
          </div>

          <ul className="mt-6 space-y-3">
            {items.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">
                No daily priorities yet.
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-all hover:border-accent/40"
                >
                  <button
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      item.done ? "border-success bg-success text-background" : "border-border hover:border-accent",
                    )}
                    aria-label={item.done ? "Mark as not done" : "Mark as done"}
                  >
                    {item.done && <Check className="size-4" strokeWidth={3} />}
                  </button>
                  <div className="flex-1 text-sm">
                    <div className={cn("font-medium", item.done && "text-muted-foreground line-through")}>{item.title}</div>
                    <div className="text-muted-foreground capitalize">{item.period}</div>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Delete daily item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
