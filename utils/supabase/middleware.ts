import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Redirigir usuarios autenticados que intenten acceder a login o registro
  if (
    user &&
    (url.pathname.startsWith("/login") || url.pathname.startsWith("/register"))
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Redirigir usuarios no autenticados
  if (
    !user &&
    !url.pathname.startsWith("/login") &&
    !url.pathname.startsWith("/auth") &&
    !url.pathname.startsWith("/register") &&
    !url.pathname.startsWith("/forgot-password") &&
    !url.pathname.startsWith("/perfil")
  ) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Verificar si la ruta requiere permisos de administrador
  if (url.pathname.startsWith("/admin")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("isAdmin")
      .eq("id", user?.id)
      .single();

    if (error || !profile?.isAdmin) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
