import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Temporary: allow all routes
  return NextResponse.next();
}
