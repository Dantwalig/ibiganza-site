import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Prevent spreadsheet formulas from running if someone typed something like =HYPERLINK(...)
const cell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await getDb().from("inquiries").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "server" }, { status: 500 });

  const head = ["Name", "Organization", "Email", "Phone", "Partnership interest", "Message", "Submitted"];
  const lines = data.map((r) =>
    [r.name, r.organization, r.email, r.phone, r.interest, r.message, r.created_at].map(cell).join(",")
  );
  lines.push("", ["TOTAL MESSAGES", data.length].map(cell).join(","));
  const csv = "\uFEFF" + [head.map(cell).join(","), ...lines].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ibiganza-messages.csv"',
    },
  });
}
