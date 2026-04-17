import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase-config";

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseConfig();

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "email" | "recovery" | "magiclink" | null;
  const next = searchParams.get("next") ?? "/";
  const welcomeNext = searchParams.get("next") ?? "/perfil";

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Email confirmation (token_hash flow)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      if (type === "signup" || type === "email") {
        const welcomeUrl = `${origin}/auth/bienvenida?next=${encodeURIComponent(welcomeNext)}`;
        response.headers.set("location", welcomeUrl);
      }
      return response;
    }
    console.error("OTP verify error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // OAuth / magic link (code flow)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const meta = data.user.user_metadata;
      const avatarUrl: string | null = meta?.avatar_url ?? meta?.picture ?? null;
      if (avatarUrl) {
        const { data: profile } = await supabase
          .from("usuarios")
          .select("foto_url")
          .eq("id", data.user.id)
          .single();

        // Only initialize provider avatar when user has no custom photo yet.
        if (!profile?.foto_url) {
          await supabase.from("usuarios").update({ foto_url: avatarUrl }).eq("id", data.user.id);
        }
      }
      const nowIso = new Date().toISOString();
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      const userAgent = request.headers.get("user-agent") ?? null;
      await supabase
        .from("usuarios")
        .update({ ultimo_acceso: nowIso })
        .eq("id", data.user.id);
      await supabase.from("access_logs").insert({
        user_id: data.user.id,
        source: "oauth_callback",
        ip,
        user_agent: userAgent,
        created_at: nowIso,
      });
      return response;
    }
    console.error("AUTH CALLBACK ERROR:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
