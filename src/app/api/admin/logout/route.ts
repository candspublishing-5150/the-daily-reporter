import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://the-daily-reporter.vercel.app" : "http://localhost:3000")
  );
  response.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
  return response;
}
