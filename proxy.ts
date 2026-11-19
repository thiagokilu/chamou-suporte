import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TOKEN_COOKIE = "tickets_token";
const DEMO_TOKEN = "demo-token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  // O modo demo só pode usar os mocks no navegador; nenhuma requisição /api
  // deve ser encaminhada ao backend enquanto esse token estiver ativo.
  if (token === DEMO_TOKEN && request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "A API não está disponível no modo demonstração." }, { status: 403 });
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (token === DEMO_TOKEN || token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/agent/:path*",
    "/client/:path*",
    "/chamado/:path*",
    "/configuracoes/:path*",
    "/perfil/:path*",
    "/usuarios/:path*",
    "/api/:path*",
  ],
}
