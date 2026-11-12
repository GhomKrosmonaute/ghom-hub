import { LOCALE_COOKIE, routeLocale } from "@ghom/core";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Routage i18n : le français (langue par défaut) est servi sans préfixe
 * (ghom.fr → réécriture interne vers /fr), l'anglais sous /en. Les URL /fr/…
 * redirigent vers leur version sans préfixe. Choix : cookie, sinon Accept-Language.
 */
export function proxy(request: NextRequest) {
  const route = routeLocale(
    request.nextUrl.pathname,
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );
  if (route.action === "next") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = route.pathname;
  const response =
    route.action === "rewrite"
      ? NextResponse.rewrite(url)
      : NextResponse.redirect(url, route.pathname.startsWith("/en") ? 307 : 308);
  // La réponse dépend de la langue du visiteur : pas de cache partagé indifférencié.
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  // Ni l'API, ni les assets Next, ni les fichiers (icon.svg, robots.txt…)
  matcher: ["/((?!_next|api|.*opengraph-image|.*\\..*).*)"],
};
