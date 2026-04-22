import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase-config";

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface ConfigHome {
  bienvenida_titulo: string;
  bienvenida_texto: string;
  servicios_texto: string;
  telefono: string;
  waze_url: string;
  google_maps_url: string;
  apple_maps_url: string;
  youtube_url: string;
  instagram_url: string;
  facebook_url: string;
  hero_image_url: string | null;
  servicios_image_url: string | null;
  ofrenda_video_url: string | null;
}

export interface Sermon {
  id: string;
  titulo: string;
  descripcion: string;
  video_id: string;
  predicador: string;
  fecha: string;
  activo: boolean;
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string | null;
  lugar: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  activo: boolean;
  tipo: string | null;
  equipo_id: string | null;
}

export interface Devocional {
  id: string;
  titulo: string;
  versiculo: string;
  referencia: string;
  reflexion: string;
  fecha: string;
}

export interface Oracion {
  id: string;
  nombre: string;
  peticion: string;
  anonima: boolean;
  fecha: string;
  estado: string;
  orantes: number;
  autor_uid: string | null;
}

export interface Pastor {
  id: string;
  nombre: string;
  cargo: string;
  bio: string;
  foto_url: string | null;
  orden: number;
  versiculo: string | null;
}

export interface Equipo {
  id: string;
  nombre: string;
  descripcion: string;
  lider: string;
  icon_name: string | null;
  orden: number;
}

export interface GaleriaAlbum {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha: string;
}

export interface GaleriaItem {
  id: string;
  image_url: string;
  album_id: string;
  fecha: string;
}

export interface Recurso {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  tipo: string;
  fecha: string;
  audiencia?: string | null;
  equipo_id?: string | null;
}

export interface ConfigLive {
  video_id: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

export interface ConfigOfrenda {
  sinpe_numero: string | null;
  sinpe_nombre: string | null;
  bcr_nombre: string | null;
  bcr_cedula: string | null;
  bcr_iban_colones: string | null;
  bcr_iban_dolares: string | null;
}

export interface Anuncio {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  fecha: string;
  activo: boolean;
}
