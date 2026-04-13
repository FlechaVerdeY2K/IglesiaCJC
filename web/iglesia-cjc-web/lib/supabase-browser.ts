import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://fvffsnenebscigtywgwn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN";

// Singleton — one instance shared across all client components
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}
