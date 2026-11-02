import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_token";
const TTL_MS = 1000 * 60 * 60 * 12;

function sign(value) {
  const secret = process.env.ADMIN_SECRET || "";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function passwordMatches(input) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !process.env.ADMIN_SECRET) return false;
  const a = crypto.createHash("sha256").update(String(input || "")).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export function setAdminCookie() {
  const exp = String(Date.now() + TTL_MS);
  cookies().set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export function clearAdminCookie() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function isAdmin() {
  const token = cookies().get(COOKIE)?.value;
  if (!token || !process.env.ADMIN_SECRET) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  if (good.length !== sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig));
}
