import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fvffsnenebscigtywgwn.supabase.co";
const supabaseAnonKey = "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN";

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

export interface GaleriaItem {
  id: string;
  image_url: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
}

export interface Recurso {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  tipo: string;
  fecha: string;
}

export interface ConfigLive {
  video_id: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

export interface Anuncio {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  fecha: string;
  activo: boolean;
}
