import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2, Coffee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/food")({
  head: () => ({
    meta: [
      { title: "Food Planner — Planner hub" },
      { name: "description", content: "Plan your meals for breakfast, lunch, dinner, and snacks." },
    ],
  }),
  component: Food,
});

type FoodItem = { id: string; title: string; meal: "breakfast" | "lunch" | "dinner" | "snack"; done: boolean };
const STORAGE_KEY = "food.v1";
const meals = ["breakfast", "lunch", "dinner", "snack"] as const;

function Food() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [title, setTitle] = useState("");
  const [meal, setMeal] = useState<FoodItem["meal"]>("breakfast");
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
    setItems((list) => [{ id: crypto.randomUUID(), title: trimmedTitle, meal, done: false }, ...list]);
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
            <Coffee className="size-5" />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Food planner</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">Meal planning</h1>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meal item"
              className="bg-background text-base"
            />
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value as FoodItem["meal"])}
              className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent"
            >
              {meals.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
            <Button onClick={addItem} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="size-5" /> Add meal
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Meal plan</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Your meals</h2>
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
                No meal plans yet.
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
                    <div className="text-muted-foreground capitalize">{item.meal}</div>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Delete meal plan"
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
