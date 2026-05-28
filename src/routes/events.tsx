import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Event Planner — Planner hub" },
      { name: "description", content: "Plan and track your upcoming events." },
    ],
  }),
  component: Events,
});

type EventItem = { id: string; title: string; date: string; time: string; done: boolean };
const STORAGE_KEY = "events.v1";

function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEvents(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, loaded]);

  const addEvent = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !date) return;
    setEvents((list) => [
      { id: crypto.randomUUID(), title: trimmedTitle, date, time, done: false },
      ...list,
    ]);
    setTitle("");
    setDate("");
    setTime("");
  };

  const toggle = (id: string) =>
    setEvents((list) => list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));

  const remove = (id: string) => setEvents((list) => list.filter((item) => item.id !== id));
  const clearCompleted = () => setEvents((list) => list.filter((item) => !item.done));

  const formatDate = (value: string) =>
    value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
  const formatTime = (value: string) =>
    value ? new Date(`1970-01-01T${value}`).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";

  return (
    <main className="min-h-screen pb-28 bg-background">
      <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 text-foreground">
            <CalendarDays className="size-5" />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Event planner</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">Upcoming events</h1>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="bg-background text-base"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent"
              />
            </div>
            <Button onClick={addEvent} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="size-5" /> Add event
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Events</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Your schedule</h2>
            </div>
            {events.some((event) => event.done) && (
              <button onClick={clearCompleted} className="text-sm text-muted-foreground hover:text-foreground">
                Clear completed
              </button>
            )}
          </div>

          <ul className="mt-6 space-y-3">
            {events.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">
                No events yet.
              </li>
            ) : (
              events.map((event) => (
                <li
                  key={event.id}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-all hover:border-accent/40"
                >
                  <button
                    onClick={() => toggle(event.id)}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      event.done ? "border-success bg-success text-background" : "border-border hover:border-accent",
                    )}
                    aria-label={event.done ? "Mark as not done" : "Mark as done"}
                  >
                    {event.done && <Check className="size-4" strokeWidth={3} />}
                  </button>
                  <div className="flex-1 text-sm">
                    <div className={cn("font-medium", event.done && "text-muted-foreground line-through")}>{event.title}</div>
                    <div className="text-muted-foreground">
                      {formatDate(event.date)} {event.time ? `· ${formatTime(event.time)}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(event.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Delete event"
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
