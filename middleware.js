// middleware.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Cria cliente Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ["/", "/articles/[id]"];
  if (
    publicRoutes.some((route) =>
      pathname.startsWith(route.replace("/[id]", ""))
    )
  ) {
    return response;
  }

  // Verifica sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não há sessão e a rota não é pública, redireciona para home
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Extrai profileName da URL (quando aplicável)
  const profileName = pathname.split("/")[1];

  // Se for rota de perfil ou edição (/Jonny ou /Jonny/edit/[id])
  if (profileName && profileName !== "writte") {
    // Busca o profileName do usuário logado
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("profileName")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) {
      console.error("Erro ao buscar perfil:", error);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Se o profileName na URL não corresponde ao do usuário logado
    if (profile.profileName !== profileName) {
      return NextResponse.redirect(
        new URL(`/${profile.profileName}`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/writte", "/:profileName", "/:profileName/edit/:id"],
};
