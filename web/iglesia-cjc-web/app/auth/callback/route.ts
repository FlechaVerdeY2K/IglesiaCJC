import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | "recovery" | null;
  const next = searchParams.get("next") ?? "/";

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    "https://fvffsnenebscigtywgwn.supabase.co",
    "sb_publishable_w2f84f3_RoJOmoHbKAeLsw_6s4_J5qN",
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
    if (!error) return response;
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
        await supabase.from("usuarios").update({ foto_url: avatarUrl }).eq("id", data.user.id);
      }
      return response;
    }
    console.error("AUTH CALLBACK ERROR:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
