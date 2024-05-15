import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./libs/supabase/middleware";

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

const ROOT_DOMAIN = "sportwise.net";
const LOCAL_DOMAIN = "localhost:3000";
const ALLOWED_SUBDOMAINS = ["develop", "lwpl"];

export default async function middleware(req: NextRequest) {
  const tenantDomain = req.headers.get("host")?.split(".").at(0);

  if (tenantDomain === LOCAL_DOMAIN || tenantDomain === ROOT_DOMAIN) {
    return NextResponse.next();
  }

  const domainParts = req.headers.get("host")?.split(".");
  const subDomain = domainParts?.at(0) ?? "";
  const rootDomain = domainParts?.at(1) ?? "";
  let protocol = rootDomain === LOCAL_DOMAIN ? "http" : "https";

  // if (!ALLOWED_SUBDOMAINS.includes(subDomain)) {
  //   return NextResponse.redirect(new URL(`/`, `${protocol}://${rootDomain}/`));
  // }

  const urlToRewrite = getUrlToRewrite(req);
  const { supabase, response } = await updateSession(req, urlToRewrite);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(
      new URL(`/login`, `${protocol}://${subDomain}.${rootDomain}/`)
    );
  }

  return response;
}

function getUrlToRewrite(req: NextRequest) {
  const url = req.nextUrl;

  const hostname = req.headers.get("host")?.split(".").at(0);
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  return `${hostname}${path}`;
}