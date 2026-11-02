import { NextResponse } from "next/server";
import { passwordMatches, setAdminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!passwordMatches(password)) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  setAdminCookie();
  return NextResponse.json({ ok: true });
}
