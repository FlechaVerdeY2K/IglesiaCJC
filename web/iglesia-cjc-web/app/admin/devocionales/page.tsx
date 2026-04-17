"use client";
import { getBrowserClient } from "@/lib/supabase-browser";
const supabase = getBrowserClient();
import { useEffect, useState } from "react";

import { Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import { broadcastNotification } from "@/lib/notifications";
import { LIBROS, getLibro } from "@/lib/bible-books";

type Devocional = { id: string; versiculo: string; referencia: string; reflexion: string; fecha: string };
type Verse = { verse: number; text: string };
const EMPTY: Omit<Devocional, "id"> = { versiculo: "", referencia: "", reflexion: "", fecha: "" };

const AT = LIBROS.filter((l) => l.t === "AT");
const NT = LIBROS.filter((l) => l.t === "NT");

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminDevocionales() {
  const [items, setItems] = useState<Devocional[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Omit<Devocional, "id">>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [libro, setLibro] = useState("juan");
  const [capitulo, setCapitulo] = useState(3);
  const [versiculoNum, setVersiculoNum] = useState(16);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [pickerError, setPickerError] = useState("");

  const libroData = getLibro(libro);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("devocionales").select("*").order("fecha", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!modal) return;
    const timer = setTimeout(() => {
      setLoadingVerses(true);
      setPickerError("");
      setVerses([]);
      fetch(`/api/bible?t=RV1960&b=${libroData.num}&c=${capitulo}`)
        .then((r) => r.json())
        .then((data) => {
          if (!Array.isArray(data)) {
            setPickerError("No se pudo cargar el capitulo.");
            return;
          }
          const parsed = data.map((d: { verse: number; text: string }) => ({
            verse: d.verse,
            text: String(d.text ?? "").replace(/<[^>]*>/g, "").trim(),
          }));
          setVerses(parsed);
          if (parsed.length > 0 && !parsed.find((v: Verse) => v.verse === versiculoNum)) {
            setVersiculoNum(parsed[0].verse);
          }
        })
        .catch(() => setPickerError("Error consultando versiculos."))
        .finally(() => setLoadingVerses(false));
    }, 0);

    return () => clearTimeout(timer);
  }, [modal, libro, capitulo, libroData.num, versiculoNum]);

  const openNew = () => {
    setForm({ ...EMPTY, fecha: todayISO() });
    setEditing(null);
    setModal(true);
  };

  const openEdit = (d: Devocional) => {
    const { id, ...rest } = d;
    setForm(rest);
    setEditing(id);
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("devocionales").update(form).eq("id", editing);
    } else {
      await supabase.from("devocionales").insert(form);
      void broadcastNotification("devocional_nuevo", "Nuevo devocional disponible", form.referencia || null, { referencia: form.referencia });
    }
    setSaving(false);
    setModal(false);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar devocional?")) return;
    await supabase.from("devocionales").delete().eq("id", id);
    void load();
  };

  const applyBibleVerse = () => {
    const selected = verses.find((v) => v.verse === versiculoNum);
    if (!selected) {
      setPickerError("Selecciona un versiculo valido.");
      return;
    }
    const referencia = `${libroData.nombre} ${capitulo}:${versiculoNum}`;
    setForm((prev) => ({ ...prev, referencia, versiculo: selected.text }));
    setPickerError("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Devocionales</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} devocionales</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-white/30 text-sm">Cargando...</p>
        ) : (
          items.map((d) => (
            <div key={d.id} className="p-4 rounded-2xl border border-border" style={{ background: "#0D1628" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-accent text-xs font-bold uppercase tracking-wider mb-1">
                    {d.referencia} · {d.fecha}
                  </p>
                  <p className="text-white font-semibold line-clamp-2">{d.versiculo}</p>
                  <p className="text-white/40 text-sm mt-1 line-clamp-2">{d.reflexion}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(d.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border p-6 space-y-4" style={{ background: "#0D1628" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? "Editar devocional" : "Nuevo devocional"}</h2>
              <button onClick={() => setModal(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl border border-white/10 p-4 space-y-3" style={{ background: "#080E1E" }}>
              <p className="text-white/70 text-xs uppercase tracking-wider font-bold flex items-center gap-2">
                <Search size={13} className="text-accent" /> Buscar en Biblia
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/45 text-xs mb-1 block">Antiguo Testamento</label>
                  <select
                    className="input w-full"
                    value={AT.some((l) => l.id === libro) ? libro : ""}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      setLibro(e.target.value);
                      setCapitulo(1);
                      setVersiculoNum(1);
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {AT.map((l) => (
                      <option key={l.id} value={l.id}>{l.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/45 text-xs mb-1 block">Nuevo Testamento</label>
                  <select
                    className="input w-full"
                    value={NT.some((l) => l.id === libro) ? libro : ""}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      setLibro(e.target.value);
                      setCapitulo(1);
                      setVersiculoNum(1);
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {NT.map((l) => (
                      <option key={l.id} value={l.id}>{l.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/45 text-xs mb-1 block">Capítulo</label>
                  <input
                    type="number"
                    min={1}
                    max={libroData.caps}
                    className="input w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={capitulo}
                    onChange={(e) => {
                      const n = parseInt(e.target.value || "1", 10);
                      setCapitulo(Math.min(libroData.caps, Math.max(1, Number.isNaN(n) ? 1 : n)));
                    }}
                  />
                </div>
                <div>
                  <label className="text-white/45 text-xs mb-1 block">Versículo</label>
                  <select
                    className="input w-full"
                    value={versiculoNum}
                    onChange={(e) => setVersiculoNum(parseInt(e.target.value, 10))}
                    disabled={loadingVerses || verses.length === 0}
                  >
                    {verses.map((v) => (
                      <option key={v.verse} value={v.verse}>{v.verse}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingVerses ? (
                <p className="text-white/35 text-xs">Cargando versículos...</p>
              ) : (
                <p className="text-white/45 text-sm line-clamp-3">
                  {verses.find((v) => v.verse === versiculoNum)?.text ?? "Selecciona un versículo."}
                </p>
              )}

              {pickerError && <p className="text-accent text-xs">{pickerError}</p>}

              <button type="button" onClick={applyBibleVerse} className="btn-secondary text-sm py-2 px-3">
                Colocar referencia y versículo
              </button>
            </div>

            {(["fecha", "referencia", "versiculo", "reflexion"] as const).map((f) => (
              <div key={f}>
                <label className="text-white/50 text-xs uppercase tracking-wider mb-1 block">{f}</label>
                {f === "versiculo" || f === "reflexion" ? (
                  <textarea
                    className="input w-full h-24 resize-none"
                    value={form[f]}
                    onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                  />
                ) : (
                  <input
                    type={f === "fecha" ? "date" : "text"}
                    className="input w-full"
                    value={form[f]}
                    onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
                <Check size={14} /> {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
