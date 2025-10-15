// src/components/WorkProgress.jsx
import React from "react";
import {
  Plus, Trash, CheckCircle2, Clock3, Image as ImageIcon,
  ChevronDown, ChevronUp, Camera
} from "lucide-react";
import { useWork } from "../hooks/useWork";
import { api } from "../../../../../api/api";
import PrimaryButton from "../../../../Reutilisable/PrimaryButton";

/* ------------------ Utils ------------------ */
const toPreview = (f) => {
  if (!f) return null;
  if (typeof f === "string") return f;
  if (f.url) return f.url;
  try { return URL.createObjectURL(f); } catch { return null; }
};

const newRoom = (name = "") => ({
  id: crypto.randomUUID(),
  name,
  surface: 0,
  todos: [],
  timeLogs: [],
  photos: { before: [], after: [] },
  collapsed: true,
});

/* ------------------ Component ------------------ */
export default function WorkProgress({ propertyId }) {
  const { rooms, setRooms, loading, error, saving, saveWork } = useWork(propertyId);

  const [addingRoom, setAddingRoom] = React.useState(false);
  const [roomName, setRoomName]     = React.useState("");
  const [message, setMessage]       = React.useState(null);

  React.useEffect(() => {
    if (!loading && rooms.length === 0) {
      setRooms([
        newRoom("Salle de bain"),
        newRoom("Salon"),
        newRoom("Cuisine"),
        newRoom("WC"),
        newRoom("Couloir"),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const totals = React.useMemo(() => {
    const byRoom = rooms.map((r) => {
      const totalTodos = r.todos.length || 0;
      const doneTodos  = r.todos.filter((t) => t.done).length;
      const pct   = totalTodos ? (doneTodos / totalTodos) * 100 : 0;
      const hours = r.timeLogs.reduce((s, l) => s + (Number(l.hours) || 0), 0);
      return { id: r.id, pct, hours, surface: Number(r.surface) || 0 };
    });

    const totalSurface = byRoom.reduce((s, x) => s + x.surface, 0);
    const weightedAvg  = totalSurface
      ? byRoom.reduce((s, x) => s + x.pct * x.surface, 0) / totalSurface
      : 0;
    const totalHours = byRoom.reduce((s, x) => s + x.hours, 0);

    return { byRoom, totalHours, avgPct: Math.round(weightedAvg) };
  }, [rooms]);

  const patchRoom = (id, updater) => {
    setRooms(prev => prev.map(r => (r.id === id ? updater({ ...r }) : r)));
  };
  const addRoom = () => {
    if (!roomName.trim()) return;
    setRooms(prev => [newRoom(roomName.trim()), ...prev]);
    setRoomName(""); setAddingRoom(false);
  };
  const removeRoom = (id) => setRooms(prev => prev.filter(r => r.id !== id));

  // Todos
  const addTodo    = (roomId, text) => {
    if (!text.trim()) return;
    patchRoom(roomId, (r) => {
      r.todos = [{ id: crypto.randomUUID(), text: text.trim(), done: false }, ...r.todos];
      return r;
    });
  };
  const toggleTodo = (roomId, todoId) => {
    patchRoom(roomId, (r) => {
      r.todos = r.todos.map(t => t.id === todoId ? { ...t, done: !t.done } : t);
      return r;
    });
  };
  const deleteTodo = (roomId, todoId) => {
    patchRoom(roomId, (r) => {
      r.todos = r.todos.filter(t => t.id !== todoId);
      return r;
    });
  };

  // Time logs
  const addLog = (roomId, dayLabel, hours) => {
    if (!dayLabel.trim() || !hours) return;
    patchRoom(roomId, (r) => {
      r.timeLogs = [{ id: crypto.randomUUID(), dayLabel: dayLabel.trim(), hours: Number(hours) }, ...r.timeLogs];
      return r;
    });
  };
  const deleteLog = (roomId, logId) => {
    patchRoom(roomId, (r) => {
      r.timeLogs = r.timeLogs.filter(l => l.id !== logId);
      return r;
    });
  };

  // Photos (upload + delete) — API authentifiée
  const addPhotos = async (roomId, type, files) => {
    if (!files?.length) return;
    try {
      const form = new FormData();
      form.append("roomId", roomId);
      form.append("type", type); // 'before' | 'after'
      Array.from(files).forEach((f) => form.append("files", f));

      const data = await api.post(`/api/properties/${propertyId}/works/photos`, form);
      const urls = data?.urls || [];
      patchRoom(roomId, (r) => {
        const current = r.photos?.[type] || [];
        r.photos = r.photos || { before: [], after: [] };
        r.photos[type] = [...current, ...urls.map(u => ({ url: u }))];
        return r;
      });
    } catch (e) {
      console.error('Upload échoué, fallback local:', e);
      // fallback local
      patchRoom(roomId, (r) => {
        const arr = Array.from(files).slice(0, 12);
        r.photos[type] = [...(r.photos?.[type] || []), ...arr];
        return r;
      });
    }
  };

  const removePhoto = async (roomId, type, idx) => {
    try {
      await api.del(`/api/properties/${propertyId}/works/photos`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, type, index: idx })
      });
      patchRoom(roomId, (r) => {
        const copy = [...(r.photos?.[type] || [])];
        copy.splice(idx, 1);
        r.photos = { ...r.photos, [type]: copy };
        return r;
      });
    } catch (e) {
      console.error('Suppression échouée, fallback local:', e);
      patchRoom(roomId, (r) => {
        const copy = [...(r.photos?.[type] || [])];
        copy.splice(idx, 1);
        r.photos = { ...r.photos, [type]: copy };
        return r;
      });
    }
  };

  const onSave = async () => {
    const res = await saveWork(rooms);
    if (res.ok) setMessage({ tone: 'ok', text: 'Travaux enregistrés.' });
    else setMessage({ tone: 'err', text: res.error || 'Erreur inconnue.' });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return <div className="p-4 text-gray-300">Chargement du suivi des travaux…</div>;
  if (error)   return <div className="p-4 text-red-400">Erreur : {error}</div>;

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Suivi des travaux</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-300">
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              Avancement pondéré : <b className="text-white">{totals.avgPct}%</b>
            </span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              Heures totales : <b className="text-white">{totals.totalHours} h</b>
            </span>
            {message && (
              <span className={`px-2 py-1 rounded-md border ${message.tone === 'ok'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                : 'bg-red-500/15 text-red-300 border-red-500/20'}`}>
                {message.text}
              </span>
            )}
          </div>
        </div>
        <PrimaryButton
  onClick={onSave}
  disabled={saving}
  className="px-4 py-2 rounded-2xl disabled:opacity-60"
>
  {saving ? "Enregistrement…" : "Enregistrer"}
</PrimaryButton>
      </div>

      {/* Ajout pièce */}
      <div className="rounded-2xl border border-white/10 bg-[#0a1016]/60 p-3 ring-1 ring-black/10">
        {!addingRoom ? (
          <button
            onClick={() => setAddingRoom(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-100"
          >
            <Plus className="w-4 h-4" /> Ajouter une pièce
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="h-11 w-full rounded-xl bg-gray-900/60 border border-white/10 px-3 text-white"
              placeholder="Ex : Salle de bain"
              autoFocus
            />
            <button onClick={addRoom} className="h-11 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white">
              OK
            </button>
            <button
              onClick={() => { setRoomName(""); setAddingRoom(false); }}
              className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-gray-100"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Liste des pièces */}
      <div className="grid grid-cols-1 gap-3">
        {rooms.map((r) => {
          const totalTodos = r.todos.length || 0;
          const doneTodos  = r.todos.filter((t) => t.done).length;
          const pct = totalTodos ? Math.round((doneTodos / totalTodos) * 100) : 0;
          const hours = r.timeLogs.reduce((s, l) => s + (Number(l.hours) || 0), 0);

          return (
            <div key={r.id} className="relative rounded-2xl border border-white/10 bg-[#0a1016]/60 p-4 ring-1 ring-black/10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{r.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doneTodos}/{totalTodos} tâches • {hours} h • {pct}%
                  </p>

                  <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        pct >= 75 ? "bg-greenLight" : pct >= 40 ? "bg-amber-400" : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={r.surface}
                      onChange={(e) => patchRoom(r.id, (room) => ({ ...room, surface: Number(e.target.value) }))}
                      placeholder="Surface (m²)"
                      className="h-9 w-32 rounded-lg bg-gray-900/60 border border-white/10 px-3 pr-8 text-sm text-white text-center"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">m²</span>
                  </div>

                  <button
                    onClick={() => patchRoom(r.id, (room) => ({ ...room, collapsed: !room.collapsed }))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
                    title={r.collapsed ? "Déplier" : "Replier"}
                  >
                    {r.collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                  <button onClick={() => removeRoom(r.id)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
                    <Trash className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 mt-1">
                Indiquez la surface en mètres carrés pour le calcul pondéré.
              </p>

              {!r.collapsed && (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <TodoSection
                    todos={r.todos}
                    onAdd={(txt) => addTodo(r.id, txt)}
                    onToggle={(id) => toggleTodo(r.id, id)}
                    onDelete={(id) => deleteTodo(r.id, id)}
                  />
                  <TimeSection
                    logs={r.timeLogs}
                    onAdd={(d, h) => addLog(r.id, d, h)}
                    onDelete={(id) => deleteLog(r.id, id)}
                  />
                  <PhotoSection
                    before={r.photos.before}
                    after={r.photos.after}
                    onPickBefore={(f) => addPhotos(r.id, "before", f)}
                    onPickAfter={(f) => addPhotos(r.id, "after", f)}
                    onDeleteBefore={(i) => removePhoto(r.id, "before", i)}
                    onDeleteAfter={(i) => removePhoto(r.id, "after", i)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Sub components ---------- */
function TodoSection({ todos, onAdd, onToggle, onDelete }) {
  const [val, setVal] = React.useState("");
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Tâches
        </p>
        <div className="flex items-center gap-2">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="h-9 w-40 rounded-lg bg-gray-900/60 border border-white/10 px-2 text-sm text-white"
            placeholder="Ajouter une tâche"
            onKeyDown={(e) => {
              if (e.key === "Enter") { onAdd(val); setVal(""); }
            }}
          />
          <button
            onClick={() => { onAdd(val); setVal(""); }}
            className="h-9 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-gray-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {todos.length === 0 && <p className="text-sm text-gray-400">Aucune tâche.</p>}
        {todos.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#0a1016]/60 border border-white/10 px-3 py-2">
            <label className="flex items-center gap-2 w-full">
              <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} className="accent-green-500" />
              <span className={`text-sm ${t.done ? "line-through text-gray-500" : "text-gray-100"}`}>{t.text}</span>
            </label>
            <button onClick={() => onDelete(t.id)} className="p-1 rounded-md hover:bg-white/10">
              <Trash className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeSection({ logs, onAdd, onDelete }) {
  const [day, setDay] = React.useState("");
  const [h, setH]     = React.useState("");
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <p className="text-sm font-medium text-white flex items-center gap-2">
          <Clock3 className="w-4 h-4" /> Journal de temps
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="h-10 w-full sm:w-28 rounded-lg bg-gray-900/60 border border-white/10 px-3 text-sm text-white placeholder:text-gray-400"
            placeholder="Jour 1"
          />
          <input
            value={h}
            onChange={(e) => setH(e.target.value)}
            type="number" step="0.25"
            className="h-10 w-full sm:w-20 rounded-lg bg-gray-900/60 border border-white/10 px-3 text-sm text-white placeholder:text-gray-400"
            placeholder="Heures"
          />
          <button
            onClick={() => { onAdd(day, h); setDay(""); setH(""); }}
            className="h-10 w-full sm:w-auto flex items-center justify-center gap-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-gray-100 transition"
          >
            <Plus className="w-4 h-4" /><span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {logs.length === 0 && <p className="text-sm text-gray-400">Aucune saisie.</p>}
        {logs.map((l) => (
          <div key={l.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-[#0a1016]/60 border border-white/10 px-3 py-2">
            <div className="text-sm text-gray-100 break-words">
              <span className="font-medium">{l.dayLabel}</span> — {l.hours} h
            </div>
            <button onClick={() => onDelete(l.id)} className="p-2 sm:p-1 rounded-md hover:bg-white/10">
              <Trash className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoSection({ before, after, onPickBefore, onPickAfter, onDeleteBefore, onDeleteAfter }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-sm font-medium text-white flex items-center gap-2 mb-2">
        <ImageIcon className="w-4 h-4" /> Photos
      </p>
      <div className="grid grid-cols-2 gap-3">
        <PhotoGroup label="Avant" files={before} onPick={onPickBefore} onDelete={onDeleteBefore} />
        <PhotoGroup label="Après" files={after} onPick={onPickAfter} onDelete={onDeleteAfter} />
      </div>
    </div>
  );
}

function PhotoGroup({ label, files, onPick, onDelete }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <label className="flex min-w-[88px] aspect-video items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#0a1016]/40 text-gray-300 cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPick(e.target.files)} />
          <div className="text-center text-xs">
            <Camera className="w-5 h-5 mx-auto mb-1" />
            Ajouter
          </div>
        </label>
        {files.map((f, i) => {
          const src = toPreview(f);
          return (
            <div key={i} className="relative min-w-[88px] aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/30">
              {src ? <img src={src} alt={`${label}-${i}`} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
              <button onClick={() => onDelete(i)} className="absolute top-1 right-1 p-1 rounded-md bg-black/50 hover:bg-black/60">
                <Trash className="w-4 h-4 text-red-300" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
