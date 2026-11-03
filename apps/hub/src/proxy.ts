import { isLocale, LOCALE_COOKIE, pickLocale } from "@ghom/core";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Routing i18n par sous-chemin : toute URL sans langue (/, /x) est redirigée
 * vers /fr/… ou /en/… selon le cookie de langue puis l'en-tête Accept-Language.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isLocale(pathname.split("/")[1])) return NextResponse.next();

  const locale = pickLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  // La réponse dépend de la langue du visiteur : pas de cache partagé de la redirection.
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  // Ni les assets Next, ni les fichiers (icon.svg, robots.txt…)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
