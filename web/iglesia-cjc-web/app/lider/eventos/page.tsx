"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, MapPin, Clock, CalendarDays, Pencil } from "lucide-react";

type Equipo = { id: string; nombre: string; tipo: string | null };
type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string | null;
  lugar: string | null;
  image_url: string | null;
  activo: boolean;
  equipo_id: string | null;
};

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseFechaKey(fecha: string) {
  return fecha.split("T")[0];
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

const emptyForm = { titulo: "", descripcion: "", fecha: "", hora: "", lugar: "", image_url: "", equipo_id: "" };

export default function LiderEventosPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [noEquipo, setNoEquipo] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<string>("all");

  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }
    const userId = session.user.id;

    const [liderIdRes, lideresRes] = await Promise.all([
      supabase.from("equipos").select("id, nombre, tipo").eq("lider_id", userId),
      supabase.from("equipos").select("id, nombre, tipo").contains("lideres", [{ id: userId }]),
    ]);

    const merged = new Map<string, Equipo>();
    for (const r of ((liderIdRes.data ?? []) as Equipo[])) merged.set(r.id, r);
    for (const r of ((lideresRes.data ?? []) as Equipo[])) if (!merged.has(r.id)) merged.set(r.id, r);
    const eqList = Array.from(merged.values());

    if (eqList.length === 0) { setNoEquipo(true); setLoading(false); return; }
    setEquipos(eqList);

    const { data: evts } = await supabase
      .from("eventos")
      .select("id, titulo, descripcion, fecha, hora, lugar, image_url, activo, equipo_id")
      .in("equipo_id", eqList.map((e) => e.id))
      .order("fecha", { ascending: true });

    setEventos((evts ?? []) as Evento[]);
    setNoEquipo(false);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filteredEventos = useMemo(() => {
    if (selectedEquipo === "all") return eventos;
    return eventos.filter((e) => e.equipo_id === selectedEquipo);
  }, [eventos, selectedEquipo]);

  const eventosByDay = useMemo(() => {
    const map = new Map<string, Evento[]>();
    for (const ev of filteredEventos) {
      const key = parseFechaKey(ev.fecha);
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    return map;
  }, [filteredEventos]);

  const calendarCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const firstDay = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date; inMonth: boolean }> = [];
    for (let i = 0; i < firstDay; i++) {
      const d = new Date(year, month, 1 - (firstDay - i));
      cells.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), inMonth: true });
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    }
    return cells;
  }, [cursor]);

  const selectedEventos = useMemo(() => {
    if (!selectedDay) return [];
    return (eventosByDay.get(selectedDay) ?? []).sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));
  }, [eventosByDay, selectedDay]);

  const openNew = (dateKey?: string) => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      fecha: dateKey ?? selectedDay ?? toDateKey(new Date()),
      equipo_id: selectedEquipo !== "all" ? selectedEquipo : (equipos[0]?.id ?? ""),
    });
    setShowForm(true);
  };

  const openEdit = (ev: Evento) => {
    setEditingId(ev.id);
    setForm({
      titulo: ev.titulo,
      descripcion: ev.descripcion ?? "",
      fecha: parseFechaKey(ev.fecha),
      hora: ev.hora ?? "",
      lugar: ev.lugar ?? "",
      image_url: ev.image_url ?? "",
      equipo_id: ev.equipo_id ?? equipos[0]?.id ?? "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.titulo.trim() || !form.fecha || !form.equipo_id) return;
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      fecha: form.fecha,
      hora: form.hora || null,
      lugar: form.lugar.trim() || null,
      image_url: form.image_url.trim() || null,
      equipo_id: form.equipo_id,
      activo: true,
    };
    if (editingId) {
      await supabase.from("eventos").update(payload).eq("id", editingId);
    } else {
      await supabase.from("eventos").insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    await supabase.from("eventos").delete().eq("id", id);
    void load();
  };

  const today = toDateKey(new Date());

  if (loading) return <div className="text-white/30 text-sm py-8">Cargando...</div>;

  if (noEquipo) return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-black text-white mb-2">Eventos</h1>
      <div className="p-6 rounded-2xl border border-border text-center" style={{ background: "#0D1628" }}>
        <CalendarDays size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm">No tienes un equipo asignado.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Eventos</h1>
          <p className="text-white/40 text-sm mt-1">Calendario exclusivo para tus {equipos.length > 1 ? "equipos" : "miembros"}.</p>
        </div>
        <button onClick={() => openNew()} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus size={15} /> Nuevo evento
        </button>
      </div>

      {equipos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedEquipo("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedEquipo === "all" ? "bg-accent/20 text-accent border border-accent/40" : "text-white/50 border border-white/10 hover:text-white"}`}
          >
            Todos
          </button>
          {equipos.map((eq) => (
            <button
              key={eq.id}
              onClick={() => setSelectedEquipo(eq.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedEquipo === eq.id ? "bg-accent/20 text-accent border border-accent/40" : "text-white/50 border border-white/10 hover:text-white"}`}
            >
              {eq.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="p-2 rounded-lg hover:bg-white/5 text-white/60">
            <ChevronLeft size={16} />
          </button>
          <p className="text-white font-bold">{MESES[cursor.getMonth()]} {cursor.getFullYear()}</p>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="p-2 rounded-lg hover:bg-white/5 text-white/60">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 border-b border-white/5">
          {DIAS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold uppercase tracking-wider text-white/30 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarCells.map((cell, i) => {
            const key = toDateKey(cell.date);
            const has = eventosByDay.get(key);
            const isToday = key === today;
            const isSelected = key === selectedDay;
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(key)}
                className={`relative aspect-square p-1.5 sm:p-2 border-t border-r border-white/5 text-left transition-colors ${cell.inMonth ? "hover:bg-white/5" : "opacity-30"} ${isSelected ? "bg-accent/10" : ""}`}
              >
                <span className={`text-xs font-semibold ${isToday ? "text-accent" : cell.inMonth ? "text-white/70" : "text-white/30"}`}>
                  {cell.date.getDate()}
                </span>
                {has && has.length > 0 && (
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-0.5">
                    {has.slice(0, 3).map((ev) => (
                      <span key={ev.id} className="flex-1 h-1 rounded-full bg-accent" />
                    ))}
                    {has.length > 3 && <span className="text-[9px] text-accent font-bold">+{has.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <p className="text-white font-bold text-sm">
              {new Date(selectedDay + "T00:00:00").toLocaleDateString("es", { timeZone: "America/Costa_Rica", weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <button onClick={() => openNew(selectedDay)} className="text-xs text-accent hover:text-accent/80 inline-flex items-center gap-1 font-semibold">
              <Plus size={12} /> Añadir
            </button>
          </div>
          {selectedEventos.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Sin eventos este día</p>
          ) : (
            <div className="divide-y divide-white/5">
              {selectedEventos.map((ev) => {
                const eq = equipos.find((e) => e.id === ev.equipo_id);
                return (
                  <div key={ev.id} className="px-5 py-4 flex gap-3">
                    <div className="shrink-0 text-center min-w-14">
                      <p className="text-accent font-black text-sm">{ev.hora?.slice(0, 5) || "—"}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{ev.titulo}</p>
                      {ev.descripcion && <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{ev.descripcion}</p>}
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {ev.lugar && <span className="text-white/40 text-xs inline-flex items-center gap-1"><MapPin size={11} /> {ev.lugar}</span>}
                        {eq && <span className="text-accent/70 text-xs font-semibold">{eq.nombre}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(ev)} className="p-2 rounded-lg hover:bg-white/5 text-white/50"><Pencil size={13} /></button>
                      <button onClick={() => void remove(ev.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/70"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[90] p-4 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="w-full max-w-lg rounded-2xl border border-border p-5 max-h-[90vh] overflow-y-auto" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">{editingId ? "Editar evento" : "Nuevo evento"}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Equipo *</label>
                <select className="input w-full" value={form.equipo_id} onChange={(e) => setForm((f) => ({ ...f, equipo_id: e.target.value }))}>
                  {equipos.map((eq) => (<option key={eq.id} value={eq.id}>{eq.nombre}</option>))}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Título *</label>
                <input className="input w-full" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Fecha *</label>
                  <input type="date" className="input w-full" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Hora</label>
                  <input type="time" className="input w-full" value={form.hora} onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Lugar</label>
                <input className="input w-full" value={form.lugar} onChange={(e) => setForm((f) => ({ ...f, lugar: e.target.value }))} />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Descripción</label>
                <textarea className="input w-full resize-none" rows={3} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Imagen (URL)</label>
                <input className="input w-full" placeholder="https://..." value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
              </div>
              {form.image_url && /^https?:\/\//i.test(form.image_url) && (
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-white/10">
                  <Image src={form.image_url} alt="" fill className="object-cover" />
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button className="btn-secondary py-2 px-4 text-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</button>
              <button className="btn-primary py-2 px-4 text-sm" onClick={() => void save()} disabled={saving || !form.titulo.trim() || !form.fecha || !form.equipo_id}>
                {saving ? "Guardando..." : editingId ? "Guardar" : "Crear evento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#0D1628" }}>
        <div className="px-5 py-3.5 border-b border-white/5">
          <p className="text-white font-bold text-sm flex items-center gap-2"><Clock size={14} className="text-accent" /> Próximos eventos</p>
        </div>
        {(() => {
          const upcoming = filteredEventos.filter((e) => parseFechaKey(e.fecha) >= today).slice(0, 8);
          if (upcoming.length === 0) return <p className="text-white/30 text-sm text-center py-8">Sin próximos eventos</p>;
          return (
            <div className="divide-y divide-white/5">
              {upcoming.map((ev) => {
                const eq = equipos.find((e) => e.id === ev.equipo_id);
                const [y, m, d] = parseFechaKey(ev.fecha).split("-").map(Number);
                const dt = new Date(y, m - 1, d);
                return (
                  <button key={ev.id} onClick={() => { setSelectedDay(parseFechaKey(ev.fecha)); setCursor(new Date(y, m - 1, 1)); }} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/5 transition-colors">
                    <div className="text-center min-w-10">
                      <p className="text-accent font-black text-lg leading-none">{dt.getDate()}</p>
                      <p className="text-accent/60 text-[10px] uppercase">{dt.toLocaleString("es", { month: "short" })}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/85 text-sm font-semibold truncate">{ev.titulo}</p>
                      <p className="text-white/40 text-xs truncate">
                        {ev.hora?.slice(0, 5)}{ev.hora && eq ? " · " : ""}{eq?.nombre}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
