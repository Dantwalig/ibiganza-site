import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase";
import { sendConfirmation, notifyTeam } from "@/lib/email";
import { ORG } from "@/lib/config";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req) {
  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field
  if (b.website) return NextResponse.json({ ok: true, emailSent: false });

  const name = String(b.name || "").trim().slice(0, 120);
  const organization = String(b.organization || "").trim().slice(0, 160) || null;
  const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
  const phone = String(b.phone || "").trim().slice(0, 40) || null;
  const interest = String(b.interest || ORG.interests[ORG.interests.length - 1]);
  const message = String(b.message || "").trim().slice(0, 2000);

  if (name.length < 2) return NextResponse.json({ error: "name" }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "email" }, { status: 400 });
  if (!ORG.interests.includes(interest)) return NextResponse.json({ error: "interest" }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ error: "message" }, { status: 400 });

  const row = { name, organization, email, phone, interest, message };

  try {
    const { error } = await getDb().from("inquiries").insert(row);
    if (error) throw error;
  } catch (e) {
    console.error("Message save failed", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  let emailSent = false;
  try {
    // Running totals for the team notification (skipped quietly if the query fails)
    let totals = null;
    try {
      const { data } = await getDb().from("inquiries").select("created_at");
      if (data) {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        totals = { all: data.length, week: data.filter((x) => new Date(x.created_at).getTime() >= weekAgo).length };
      }
    } catch {}
    emailSent = await sendConfirmation(row);
    await notifyTeam(row, totals);
  } catch (e) {
    console.error("Message email failed", e);
  }

  return NextResponse.json({ ok: true, emailSent });
}
