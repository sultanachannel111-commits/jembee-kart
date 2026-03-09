import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

const path = request.nextUrl.pathname;

/* =========================
   ADMIN PROTECTION
========================= */

if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {

const admin = request.cookies.get("admin");

if (!admin) {
return NextResponse.redirect(
new URL("/admin/login", request.url)
);
}

}

/* =========================
   SELLER PROTECTION
========================= */

if (path.startsWith("/seller") && !path.startsWith("/seller/login")) {

const seller = request.cookies.get("seller");

if (!seller) {
return NextResponse.redirect(
new URL("/seller/login", request.url)
);
}

}

/* =========================
   ALLOW REQUEST
========================= */

return NextResponse.next();

}

/* =========================
   ROUTE MATCHER
========================= */

export const config = {
matcher: [
"/admin/:path*",
"/seller/:path*",
],
};
