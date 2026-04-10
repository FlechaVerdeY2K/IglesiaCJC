import { supabase, type ConfigHome } from "@/lib/supabase";
import { Phone, MapPin, ExternalLink } from "lucide-react";

export default async function ContactoPage() {
  const { data } = await supabase.from("config_home").select("*").eq("id", 1).single();
  const config = data as ConfigHome | null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <span className="section-label">Hablemos</span>
      <h1 className="text-4xl font-bold mt-2 mb-2">Contacto</h1>
      <p className="text-muted mb-12">Estamos aquí para ti. No dudes en comunicarte.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-5">
          {config?.telefono && (
            <a
              href={`https://wa.me/${config.telefono.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:border-accent transition-colors flex items-center gap-4"
            >
              <div className="bg-green-500/10 rounded-xl p-3">
                <Phone className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">WhatsApp</p>
                <p className="text-muted text-sm">{config.telefono}</p>
              </div>
            </a>
          )}
          {config?.instagram_url && (
            <a
              href={config.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:border-accent transition-colors flex items-center gap-4"
            >
              <div className="bg-pink-500/10 rounded-xl p-3">
                <ExternalLink className="text-pink-400" size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">Instagram</p>
                <p className="text-muted text-sm">Síguenos en Instagram</p>
              </div>
            </a>
          )}
          {config?.youtube_url && (
            <a
              href={config.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:border-accent transition-colors flex items-center gap-4"
            >
              <div className="bg-red-500/10 rounded-xl p-3">
                <ExternalLink className="text-red-400" size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">YouTube</p>
                <p className="text-muted text-sm">Canal de sermones y eventos</p>
              </div>
            </a>
          )}
          {config?.facebook_url && (
            <a
              href={config.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:border-accent transition-colors flex items-center gap-4"
            >
              <div className="bg-blue-500/10 rounded-xl p-3">
                <ExternalLink className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">Facebook</p>
                <p className="text-muted text-sm">Página de la iglesia</p>
              </div>
            </a>
          )}
          {config?.waze_url && (
            <a
              href={config.waze_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:border-accent transition-colors flex items-center gap-4"
            >
              <div className="bg-cyan-500/10 rounded-xl p-3">
                <MapPin className="text-cyan-400" size={24} />
              </div>
              <div>
                <p className="text-white font-semibold">Cómo llegar</p>
                <p className="text-muted text-sm">Abrir en Waze</p>
              </div>
            </a>
          )}
        </div>

        {/* Mapa embebido OpenStreetMap */}
        <div className="card p-0 overflow-hidden h-96">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=-84.2,9.9,-83.9,10.1&layer=mapnik"
            className="w-full h-full border-0"
            title="Ubicación Iglesia CJC"
          />
        </div>
      </div>
    </div>
  );
}
