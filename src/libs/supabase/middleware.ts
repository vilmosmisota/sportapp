import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(
  request: NextRequest,
  urlToRewrite: string
) {
  let response = getWrittenResWithSetHeaders(request, urlToRewrite);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = getWrittenResWithSetHeaders(request, urlToRewrite);
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = getWrittenResWithSetHeaders(request, urlToRewrite);
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
}

function getWrittenResWithSetHeaders(req: NextRequest, urlToRewrite: string) {
  return NextResponse.rewrite(new URL(`/${urlToRewrite}`, req.url), {
    request: {
      headers: req.headers,
    },
  });
}
