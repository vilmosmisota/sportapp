import { NextRequest, NextResponse } from "next/server";
import { parseDomain, isRootDomain } from "./middleware.logic";

/**
 * Minimal middleware for handling multi-tenant routing in the Sportwise application.
 *
 * Key responsibilities:
 * - Subdomain-based routing (e.g., tenant.sportwise.net → /tenant/...)
 * - Pass-through for root domain requests
 *
 * Note:
 * - All tenant validation will be done client-side with Tanstack Query
 * - All auth will be handled client-side
 * - All redirects will be handled at the route level
 */
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const tenantDomain = req.headers.get("host");
  if (!tenantDomain) return NextResponse.next();

  if (isRootDomain(tenantDomain)) {
    return NextResponse.next();
  }

  const { subDomain } = parseDomain(tenantDomain);

  const url = req.nextUrl.clone();
  url.pathname = `/${subDomain}${url.pathname}`;

  const response = NextResponse.rewrite(url);

  response.headers.set("x-tenant-subdomain", subDomain);

  return response;
}
