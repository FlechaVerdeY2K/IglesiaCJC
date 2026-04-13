import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    "https://fvffsnenebscigtywgwn.supabase.co",
    "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN",
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Rutas que requieren login
export const PROTECTED_ROUTES = [
  "/devocionales",
  "/galeria",
  "/equipos",
  "/oraciones",
  "/recursos",
  "/perfil",
  "/anuncios",
];
