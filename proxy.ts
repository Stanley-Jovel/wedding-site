import { NextResponse, type NextRequest } from "next/server";

const locales = ["es", "en"];

// Send visitors without a language in the URL to /es or /en based on their browser.
// Spanish browsers get Spanish; everyone else gets English.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return;

  const accept = request.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  const locale = first.startsWith("es") ? "es" : "en";

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, API routes and files with an extension (images, .ics, favicon).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
