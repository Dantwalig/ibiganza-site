import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/supabase";
import { ORG } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let data, error;
  try {
    ({ data, error } = await getDb().from("inquiries").select("*").order("created_at", { ascending: false }));
  } catch (e) {
    error = e;
  }
  if (error || !data) {
    console.error("Admin message list failed", error);
    return NextResponse.json({ error: "server", detail: String(error?.message || error || "unknown") }, { status: 500 });
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const fallback = ORG.interests[ORG.interests.length - 1];
  const stats = {
    total: data.length,
    lastWeek: data.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
    fromOrganizations: data.filter((r) => r.organization).length,
    partnership: data.filter((r) => r.interest !== fallback).length,
  };
  return NextResponse.json({ messages: data, stats });
}

export async function DELETE(req) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let ids = [];
  const one = new URL(req.url).searchParams.get("id");
  if (one) ids = [one];
  else {
    try {
      const b = await req.json();
      if (Array.isArray(b.ids)) ids = b.ids;
    } catch {}
  }
  ids = ids.map((x) => String(x)).filter(Boolean).slice(0, 1000);
  if (!ids.length) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    const { error } = await getDb().from("inquiries").delete().in("id", ids);
    if (error) throw error;
  } catch (e) {
    console.error("Admin delete failed", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deleted: ids.length });
}
