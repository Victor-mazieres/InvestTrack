// src/components/Modules/OngoingTasks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_META = {
  in_progress: { label: "En cours",  cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  todo:        { label: "À faire",    cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  blocked:     { label: "Bloquée",    cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  done:        { label: "Terminée",   cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

const DEFAULT_STATUS = Object.freeze(["in_progress", "todo", "blocked"]);

/* ───────────────────────────── ResponsiveSelect ─────────────────────────────
   - Desktop (sm:≥640px): vrai <select>.
   - Mobile (<640px): bouton qui ouvre une bottom-sheet.
   - Fixes: safe-area bottom, z-index élevé, scroll lock, hauteur 65dvh.
   --------------------------------------------------------------------------- */
function ResponsiveSelect({ value, onChange, options, placeholder = "Choisir...", className = "" }) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => String(o.value) === String(value));

  // Lock le scroll de la page quand la feuille est ouverte (iOS/Android)
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevTouch = body.style.touchAction;
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    return () => {
      body.style.overflow = prevOverflow;
      body.style.touchAction = prevTouch;
    };
  }, [open]);

  // Desktop: vrai select
  const DesktopSelect = (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`hidden sm:block px-3 py-2 rounded-lg bg-[#0a1016] border border-white/10 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${className}`}
    >
      {options.map((o) => (
        <option key={o.value ?? "all"} value={o.value}>{o.label}</option>
      ))}
    </select>
  );

  // Mobile: bouton + bottom sheet
  const MobileButton = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`sm:hidden flex items-center justify-between px-3 py-2 rounded-lg bg-[#0a1016] border border-white/10 text-gray-100 w-full ${className}`}
    >
      <span className="truncate text-left">{current?.label ?? placeholder}</span>
      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
    </button>
  );

  return (
    <>
      {DesktopSelect}
      {MobileButton}

      {/* Bottom sheet mobile */}
      <AnimatePresence>
        {open && (
          <>
            {/* overlay (z très élevé pour passer au-dessus de la nav) */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/60 sm:hidden"
              onClick={() => setOpen(false)}
            />
            {/* sheet */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed inset-x-0 bottom-0 z-[130] sm:hidden rounded-t-2xl bg-[#0b1118] border-t border-white/10 shadow-[0_-24px_48px_rgba(0,0,0,0.5)]"
              // Espace de respiration pour la barre système / nav
              style={{
                paddingBottom: "max(env(safe-area-inset-bottom, 16px), 16px)",
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-medium text-gray-100">{placeholder}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5"
                  aria-label="Fermer"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-300" />
                </button>
              </div>

              {/* Liste: hauteur en dvh (viewport dynamique mobile), fallback 65vh */}
              <div
                className="py-1 overflow-y-auto"
                style={{
                  maxHeight: "min(65dvh, 70vh)",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {options.map((o) => {
                  const active = String(o.value) === String(value);
                  return (
                    <button
                      key={o.value ?? "all"}
                      type="button"
                      onClick={() => { onChange(o.value); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-4 text-left border-b border-white/5 ${active ? "bg-white/5" : "hover:bg-white/5"}`}
                    >
                      <span className="text-[16px] text-gray-100">{o.label}</span>
                      {active && <CheckIcon className="h-5 w-5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───────────────────────────── OngoingTasks ───────────────────────────── */
export default function OngoingTasks({ statusFilter = DEFAULT_STATUS }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [property, setProperty] = useState("all");

  const [openGroupIds, setOpenGroupIds] = useState(() => new Set());

  const statusesKey = useMemo(
    () => (Array.isArray(statusFilter) && statusFilter.length ? statusFilter : DEFAULT_STATUS).join(","),
    [Array.isArray(statusFilter) ? statusFilter.join("|") : "default"]
  );

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function fetchProfileUserId() {
      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          signal: controller.signal,
        });
        if (!res.ok) return null;
        const user = await res.json();
        return user?.id ?? null;
      } catch {
        return null;
      }
    }

    async function fetchFromAggregate(userId) {
      const allowed = encodeURIComponent(statusesKey);
      const url = userId
        ? `${API_BASE}/api/tasks?status=${allowed}&userId=${encodeURIComponent(userId)}`
        : `${API_BASE}/api/tasks?status=${allowed}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        signal: controller.signal,
      });
      if (res.status === 404) throw new Error("404");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }

    async function fetchFallbackClientSide() {
      const pRes = await fetch(`${API_BASE}/api/properties`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        signal: controller.signal,
      });
      if (!pRes.ok) throw new Error(`HTTP ${pRes.status} properties`);
      const properties = await pRes.json();
      const props = Array.isArray(properties) ? properties : properties?.rows || [];

      const allTasks = [];
      await Promise.all(
        props.map(async (prop) => {
          const pid = prop.id;
          if (!pid) return;
          const wRes = await fetch(`${API_BASE}/api/properties/${pid}/works`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            signal: controller.signal,
          });
          if (!wRes.ok) return;
          const w = await wRes.json();
          const rooms = Array.isArray(w?.rooms) ? w.rooms : [];
          for (const room of rooms) {
            const roomId = room?.id ?? null;
            const roomName = room?.name ?? "Pièce";
            const todos = Array.isArray(room?.todos) ? room.todos : [];
            for (const td of todos) {
              const st =
                td.status ||
                td.state ||
                (td.done === true ? "done" : td.blocked ? "blocked" : "in_progress");
              const wanted = new Set(statusesKey.split(",").filter(Boolean));
              if (wanted.size && !wanted.has(st)) continue;

              allTasks.push({
                id: td.id || `${pid}:${roomId || "room"}:${Math.random().toString(36).slice(2)}`,
                title: td.title || td.label || td.name || "Sans titre",
                status: st,
                dueDate: td.dueDate || td.deadline || td.limitDate || null,
                priority: td.priority ?? null,
                assignee: td.assignee ?? td.user ?? null,
                propertyId: pid,
                property: { id: pid, name: prop?.name ?? `Bien #${pid}` },
                roomId, roomName,
              });
            }
          }
        })
      );

      const order = { blocked: 0, in_progress: 1, todo: 2, done: 3 };
      allTasks.sort((a, b) => {
        const sa = order[a.status] ?? 99;
        const sb = order[b.status] ?? 99;
        if (sa !== sb) return sa - sb;
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      });
      return allTasks;
    }

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const userId = await fetchProfileUserId();

        let data = [];
        try {
          data = await fetchFromAggregate(userId);
        } catch {
          data = await fetchFallbackClientSide();
        }

        const normalized = (Array.isArray(data) ? data : data?.tasks || []).map((t) => ({
          id: t.id ?? crypto.randomUUID(),
          title: t.title ?? t.name ?? "Sans titre",
          status: t.status ?? "in_progress",
          dueDate: t.dueDate ?? t.deadline ?? null,
          priority: t.priority ?? null,
          assignee: t.assignee ?? t.user ?? null,
          property: t.property ?? t.apartment ?? t.realEstate ?? null,
          propertyId: t.propertyId ?? t.property?.id ?? t.apartmentId ?? null,
          roomId: t.roomId ?? null,
          roomName: t.roomName ?? null,
        }));

        if (mounted) {
          setTasks(normalized);
          const firstTwo = new Set();
          const pids = Array.from(new Set(normalized.map(t => String(t.propertyId ?? t.property?.id ?? "unknown")))).slice(0, 2);
          pids.forEach(id => firstTwo.add(id));
          setOpenGroupIds(firstTwo);
        }
      } catch (e) {
        if (e.name !== "AbortError" && mounted) {
          setErr(e.message || "Erreur lors du chargement");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; controller.abort(); };
  }, [statusesKey]);

  const properties = useMemo(() => {
    const map = new Map();
    for (const t of tasks) {
      const pid = String(t.propertyId ?? (t.property?.id ?? "unknown"));
      const name = t.property?.name ?? `Bien #${pid}`;
      map.set(pid, name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (property !== "all") {
        const pid = String(t.propertyId ?? (t.property?.id ?? "unknown"));
        if (pid !== String(property)) return false;
      }
      if (q) {
        const text = `${t.title} ${t.assignee ?? ""} ${t.property?.name ?? ""} ${t.roomName ?? ""}`.toLowerCase();
        if (!text.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [tasks, status, property, q]);

  const grouped = useMemo(() => {
    const g = new Map();
    for (const t of filtered) {
      const pid = String(t.propertyId ?? (t.property?.id ?? "unknown"));
      if (!g.has(pid)) g.set(pid, []);
      g.get(pid).push(t);
    }
    return g;
  }, [filtered]);

  const toggleGroup = (pid) => {
    const id = String(pid);
    const next = new Set(openGroupIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenGroupIds(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="ml-3 text-sm text-gray-300">Chargement des tâches…</span>
      </div>
    );
  }

  if (err) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-rose-300">Impossible de charger les tâches : {err}</p>
        <p className="text-xs text-gray-400">Vérifie le token et l’endpoint <code className="text-gray-200">/api/tasks</code>.</p>
      </div>
    );
  }

  const total = filtered.length;
  const totalInProgress = filtered.filter(t => t.status === "in_progress").length;

  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "in_progress", label: "En cours" },
    { value: "todo", label: "À faire" },
    { value: "blocked", label: "Bloquée" },
    { value: "done", label: "Terminée" },
  ];
  const propertyOptions = [
    { value: "all", label: "Tous les biens" },
    ...properties.map(p => ({ value: String(p.id), label: p.name })),
  ];

  return (
    <div className="space-y-4">
      {/* Barre outils */}
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            {total} tâche{total > 1 ? "s" : ""}
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {totalInProgress} en cours
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:ml-auto w-full sm:w-auto">
          <label className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une tâche, un bien…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0a1016] border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>

          <ResponsiveSelect
            value={status}
            onChange={setStatus}
            options={statusOptions}
            placeholder="Statut"
          />

          <ResponsiveSelect
            value={property}
            onChange={setProperty}
            options={propertyOptions}
            placeholder="Bien"
          />
        </div>
      </div>

      {/* Groupes (biens) */}
      {Array.from(grouped.entries()).map(([pid, list]) => {
        const id = String(pid);
        const pname = properties.find(p => String(p.id) === id)?.name ?? `Bien #${id}`;
        const isOpen = openGroupIds.has(id);

        return (
          <div key={id} className="rounded-2xl border border-white/10 bg-[#0a1016]/60 overflow-hidden">
            <button
              onClick={() => toggleGroup(id)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-gray-100 truncate">{pname}</h4>
                <p className="text-[11px] text-gray-400">{list.length} tâche{list.length>1?"s":""}</p>
              </div>
              <ChevronDownIcon className={`h-5 w-5 text-gray-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <ul className="divide-y divide-white/10">
                {list.map((t) => {
                  const meta = STATUS_META[t.status] ?? STATUS_META.in_progress;
                  return (
                    <li key={t.id} className="px-3 sm:px-4 py-3 flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-white truncate">{t.title}</p>
                        <span className={`whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full border ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                        {t.roomName && <span className="px-2 py-0.5 rounded-full border border-white/10">{t.roomName}</span>}
                        {t.assignee && <span className="px-2 py-0.5 rounded-full border border-white/10">Assignée à {t.assignee}</span>}
                        {t.priority && <span className="px-2 py-0.5 rounded-full border border-white/10">Priorité: {t.priority}</span>}
                        <span className="px-2 py-0.5 rounded-full border border-white/10">
                          Échéance: {fmtDate(t.dueDate)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {grouped.size === 0 && (
        <p className="text-sm text-gray-400">Aucune tâche correspondant aux filtres.</p>
      )}
    </div>
  );
}
