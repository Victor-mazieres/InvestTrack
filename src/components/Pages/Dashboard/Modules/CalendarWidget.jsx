// src/components/Calendar/CalendarWidget.jsx
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Props:
 * - events: Array<{ date: string|Date, title: string, meta?: string, type?: "due"|"payment" }>
 * - startOnMonday?: boolean (default true)
 */
export default function CalendarWidget({ events = [], startOnMonday = true }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const d = typeof ev.date === "string" ? new Date(ev.date) : ev.date;
      if (isNaN(d)) continue;
      const key = d.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  const startDayIndex = useMemo(() => {
    const jsIndex = viewDate.getDay(); // 0=Dim ... 6=Sam
    return startOnMonday ? (jsIndex === 0 ? 6 : jsIndex - 1) : jsIndex;
  }, [viewDate, startOnMonday]);

  const daysInMonth = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    return new Date(y, m + 1, 0).getDate();
  }, [viewDate]);

  const weeks = useMemo(() => {
    const cells = [];
    for (let i = 0; i < startDayIndex; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);

    const w = [];
    for (let i = 0; i < cells.length; i += 7) w.push(cells.slice(i, i + 7));
    return w;
  }, [startDayIndex, daysInMonth, viewDate]);

  const dayNames = startOnMonday
    ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const keyOf = (d) => d.toISOString().slice(0, 10);
  const goPrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const goNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectedKey = keyOf(selectedDate);
  const selectedEvents = eventsByDay.get(selectedKey) || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header mois */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5 text-gray-200" />
        </button>
        <div className="text-white font-semibold">
          {viewDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </div>
        <button
          type="button"
          onClick={goNextMonth}
          className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-5 h-5 text-gray-200" />
        </button>
      </div>

      {/* Noms des jours */}
      <div className="grid grid-cols-7 gap-2 text-xs text-gray-400">
        {dayNames.map((d) => (
          <div key={d} className="text-center uppercase tracking-wide">{d}</div>
        ))}
      </div>

      {/* Grille du mois */}
      <div className="grid grid-cols-7 gap-2">
        {weeks.map((week, wi) => (
          <React.Fragment key={wi}>
            {week.map((d, di) => {
              if (!d) {
                return (
                  <div key={`${wi}-${di}`} className="h-12 rounded-xl border border-white/5 bg-white/0" />
                );
              }
              const key = keyOf(d);
              const evs = eventsByDay.get(key) || [];
              const hasEvents = evs.length > 0;
              const isToday = isSameDay(d, new Date());
              const isSelected = isSameDay(d, selectedDate);

              return (
                <button
                  key={`${wi}-${di}`}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={[
                    "h-12 rounded-xl border transition relative flex items-center justify-center",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
                    isSelected ? "border-emerald-400/60 bg-emerald-400/10" : "border-white/10 hover:bg-white/5",
                  ].join(" ")}
                >
                  <span className="text-sm text-white">{d.getDate()}</span>
                  {isToday && (
                    <span className="absolute top-1 right-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                  {hasEvents && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                      {evs.slice(0, 3).map((ev, i) => (
                        <span
                          key={i}
                          className={[
                            "w-1.5 h-1.5 rounded-full",
                            ev.type === "payment" ? "bg-emerald-500/90" : "bg-amber-400/90",
                          ].join(" ")}
                        />
                      ))}
                      {evs.length > 3 && (
                        <span className="text-[10px] text-gray-300 ml-1">+{evs.length - 3}</span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Agenda du jour */}
      <div className="rounded-2xl border border-white/10 p-3 bg-white/5">
        <div className="text-sm text-gray-300 mb-2">
          Agenda — {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}
        </div>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun événement.</p>
        ) : (
          <ul className="space-y-2">
            {selectedEvents.map((ev, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl bg-black/30 border border-white/10 px-3 py-2">
                <span className="text-white text-sm">
                  {ev.title}
                </span>
                {ev.meta && <span className="text-xs text-gray-400">{ev.meta}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
