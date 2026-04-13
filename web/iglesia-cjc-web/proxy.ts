import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getRequiredRole,
  isAuthProtectedPath,
  normalizeRoles,
  roleAllowsPath,
} from "@/lib/access-control";
import { getSupabaseConfig } from "@/lib/supabase-config";

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseConfig();

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.searchParams.set("redirect", redirectTarget);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const requiredRole = getRequiredRole(pathname);
  const isProtected = isAuthProtectedPath(pathname) || requiredRole !== null;

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

  const { data: { user } } = await supabase.auth.getUser();
  const shouldNoIndex = ["/admin", "/login", "/register", "/auth"].some((r) =>
    pathname.startsWith(r)
  );

  if (shouldNoIndex) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (isProtected && !user) {
    return redirectToLogin(request);
  }

  if (requiredRole && user) {
    const { data: userData } = await supabase
      .from("usuarios")
      .select("rol, roles")
      .eq("id", user.id)
      .single();

    const roles = normalizeRoles(userData);
    if (!roleAllowsPath(requiredRole, roles)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
