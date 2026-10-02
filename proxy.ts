import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Optimistic admin check: reads the role from the JWT session cookie only.
 * This is a convenience redirect — real enforcement happens in
 * requireAdmin() next to the data source (see lib/auth.ts).
 */
export default async function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // The login page itself must stay reachable.
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = await auth();
  if (session?.user?.role === "admin") {
    return NextResponse.next();
  }

  const signInUrl = new URL("/admin/login", req.nextUrl);
  if (session?.user) {
    signInUrl.searchParams.set("error", "forbidden");
  }
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
