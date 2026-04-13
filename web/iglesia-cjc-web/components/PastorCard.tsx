"use client";
import { useState } from "react";
import Image from "next/image";
import { User, X } from "lucide-react";
import type { Pastor } from "@/lib/supabase";

export default function PastorCard({ pastor }: { pastor: Pastor }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setOpen(true)}
        className="card text-center cursor-pointer hover:border-accent/40 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
      >
        {pastor.foto_url ? (
          <Image
            src={pastor.foto_url}
            alt={pastor.nombre}
            className="w-28 h-28 rounded-full object-cover mx-auto mb-5 border-2 border-accent"
            width={112}
            height={112}
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-border flex items-center justify-center mx-auto mb-5">
            <User className="text-muted" size={40} />
          </div>
        )}
        <h2 className="font-bold text-white text-xl mb-1">{pastor.nombre}</h2>
        <p className="text-accent text-sm font-semibold mb-4">{pastor.cargo}</p>
        <p className="text-muted text-sm leading-relaxed line-clamp-3">{pastor.bio}</p>
        {pastor.versiculo && (
          <p className="text-white/30 text-xs italic mt-4 border-t border-white/5 pt-4">
            &quot;{pastor.versiculo}&quot;
          </p>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", animation: "fadeIn 0.2s ease" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-white/10 p-8 text-center"
            style={{ background: "#0D1628", animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {pastor.foto_url ? (
              <Image
                src={pastor.foto_url}
                alt={pastor.nombre}
                className="w-36 h-36 rounded-full object-cover mx-auto mb-6 border-2 border-accent shadow-lg"
                width={144}
                height={144}
                style={{ boxShadow: "0 0 32px rgba(191,30,46,0.3)" }}
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-border flex items-center justify-center mx-auto mb-6">
                <User className="text-muted" size={56} />
              </div>
            )}

            <h2 className="font-black text-white text-2xl mb-1">{pastor.nombre}</h2>
            <p className="text-accent text-sm font-semibold mb-5">{pastor.cargo}</p>

            {pastor.bio && (
              <p className="text-white/60 text-sm leading-relaxed mb-5">{pastor.bio}</p>
            )}

            {pastor.versiculo && (
              <div className="border-t border-white/5 pt-4">
                <p className="text-white/40 text-xs italic">&quot;{pastor.versiculo}&quot;</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </>
  );
}
