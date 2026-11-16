import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JwtPayload {
  sub?: string;
  role?: "SUPER_ADMIN" | "COMPANY";
  companyId?: string | null;
  exp?: number;
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const parsed = JSON.parse(json) as JwtPayload;

    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookie = request.cookies.get("igl_admin")?.value;
  const user = adminCookie ? parseJwtPayload(adminCookie) : null;

  // Root admin redirects
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") {
      if (user) {
        return NextResponse.redirect(
          new URL(
            user.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/company/dashboard",
            request.url,
          ),
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user.role === "SUPER_ADMIN") {
      if (pathname === "/admin/otp" || pathname.startsWith("/admin/otp/")) {
        return NextResponse.redirect(new URL("/super-admin/otp", request.url));
      }
      if (pathname === "/admin/submissions" || pathname.startsWith("/admin/submissions/")) {
        return NextResponse.redirect(new URL("/super-admin/submissions", request.url));
      }
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/company/dashboard", request.url));
  }

  // Login page access
  if (pathname === "/login") {
    if (user) {
      return NextResponse.redirect(
        new URL(
          user.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/company/dashboard",
          request.url,
        ),
      );
    }
    return NextResponse.next();
  }

  // Super Admin section protection
  if (pathname === "/super-admin" || pathname.startsWith("/super-admin/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/company/dashboard", request.url));
    }

    if (pathname === "/super-admin") {
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Company section protection
  if (pathname === "/company" || pathname.startsWith("/company/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    }

    if (pathname === "/company") {
      return NextResponse.redirect(new URL("/company/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/login",
    "/super-admin/:path*",
    "/super-admin",
    "/company/:path*",
    "/company",
  ],
};
