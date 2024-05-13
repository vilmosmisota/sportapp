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

export default async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host")?.split(".").at(0);

  // base url should come here
  if (hostname === "localhost:3000") {
    return;
  }

  const urlToRewrite = getUrlToRewrite(req);

  const { supabase, response } = await updateSession(req, urlToRewrite);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(
      new URL(`/login`, `http://lwpl.localhost:3000/`)
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
