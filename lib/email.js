import { Resend } from "resend";
import nodemailer from "nodemailer";
import { ORG } from "./config";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Palette (inline styles only: email clients ignore most stylesheets)
const C = { ink: "#23302a", soft: "#5d6b63", green: "#1f4d3c", gold: "#c8a04a", line: "#ddd3bd", pale: "#f3ede0" };
const SERIF = "Georgia,'Times New Roman',serif";

// ---------- sending ----------
// Sends through Gmail (SMTP app password) when SMTP_USER and SMTP_PASS are set, otherwise through Resend.
function mailerReady() {
  return Boolean((process.env.SMTP_USER && process.env.SMTP_PASS) || (process.env.RESEND_API_KEY && process.env.EMAIL_FROM));
}

const replyToAddress = () => process.env.REPLY_TO_EMAIL || ORG.replyTo || undefined;

async function deliver({ to, subject, html, text, replyTo }) {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS.replace(/\s/g, "") },
    });
    const from = process.env.EMAIL_FROM || `"${ORG.name}" <${process.env.SMTP_USER}>`;
    await transport.sendMail({ from, to, subject, html, text, replyTo });
    return true;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: process.env.EMAIL_FROM, to, subject, html, text, replyTo });
  if (error) console.error("Resend error", error);
  return !error;
}

// ---------- shared pieces ----------
const button = (href, label) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:4px 5px;padding:12px 24px;border-radius:4px;font-family:${SERIF};font-size:15px;font-weight:bold;text-decoration:none;background:${C.gold};color:#1b1b14;border:1px solid ${C.gold}">${label}</a>`;

const row = (k, v) =>
  `<tr><td style="padding:11px 0;border-bottom:1px solid ${C.line};font-family:${SERIF};font-size:13px;color:${C.gold};font-weight:bold;width:34%;vertical-align:top">${k}</td>
   <td style="padding:11px 0;border-bottom:1px solid ${C.line};font-family:${SERIF};font-size:16px;color:${C.ink};vertical-align:top">${v}</td></tr>`;

const shell = (preheader, inner) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#ffffff">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:28px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${C.line};border-radius:8px">
    <tr><td style="height:5px;background:${C.green};border-radius:8px 8px 0 0;font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td style="padding:34px 32px 30px">${inner}</td></tr>
  </table>
</td></tr></table></body></html>`;

const para = (t, extra = "") => `<p style="margin:0 0 12px;font-family:${SERIF};font-size:16px;line-height:1.6;color:${C.ink};${extra}">${t}</p>`;

// ---------- confirmation to the person who wrote ----------
function guestHtml(r) {
  const contact = [ORG.email, ORG.phone, ORG.whatsapp].filter(Boolean).map(esc).join("<br>");
  const inner = `
    <div style="font-family:${SERIF};font-size:30px;font-weight:bold;color:${C.green}">${esc(ORG.name)}</div>
    <div style="width:56px;height:2px;background:${C.gold};margin:14px 0 20px"></div>
    ${para(`Dear ${esc(r.name)},`)}
    ${para("Thank you for getting in touch. We have received your message and someone from our team will reply soon.")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 8px;border-top:1px solid ${C.line}">
      ${r.organization ? row("Organization", esc(r.organization)) : ""}
      ${row("Interest", esc(r.interest))}
      ${row("Your message", `<span style="white-space:pre-wrap">${esc(r.message)}</span>`)}
    </table>
    ${contact ? para(`If your matter is urgent, you can also reach us here:<br>${contact}`, `margin-top:18px;color:${C.soft};font-size:15px`) : ""}
    ${para(`With thanks,<br>${esc(ORG.name)}`, "margin-top:20px")}
    <p style="margin:18px 0 0;font-family:${SERIF};font-size:13px;font-style:italic;color:${C.soft}">${esc(ORG.tagline)}</p>`;
  return shell(`We received your message to ${ORG.name}.`, inner);
}

function guestText(r) {
  const L = [`Dear ${r.name},`, "", "Thank you for getting in touch. We have received your message and someone from our team will reply soon.", ""];
  if (r.organization) L.push(`Organization: ${r.organization}`);
  L.push(`Interest: ${r.interest}`, "", "Your message:", r.message, "");
  [ORG.email, ORG.phone, ORG.whatsapp].filter(Boolean).forEach((x) => L.push(x));
  L.push("", `With thanks, ${ORG.name}`);
  return L.join("\n");
}

export async function sendConfirmation(r) {
  if (!mailerReady()) return false;
  try {
    return await deliver({
      to: r.email,
      subject: `We received your message | ${ORG.name}`,
      html: guestHtml(r),
      text: guestText(r),
      replyTo: replyToAddress(),
    });
  } catch (e) {
    console.error("Email send failed", e);
    return false;
  }
}

// ---------- notification to the team ----------
export function notifyList() {
  const fromEnv = (process.env.NOTIFY_EMAIL || "").split(",").map((x) => x.trim()).filter(Boolean);
  return fromEnv.length ? fromEnv : ORG.notifyEmails;
}

function teamHtml(r, totals) {
  const when = new Date().toLocaleString("en-GB", { timeZone: "Africa/Kigali", dateStyle: "medium", timeStyle: "short" });
  const rows = [
    row("Name", `<strong>${esc(r.name)}</strong>`),
    r.organization ? row("Organization", esc(r.organization)) : "",
    row("Email", `<a href="mailto:${esc(r.email)}" style="color:${C.green}">${esc(r.email)}</a>`),
    r.phone ? row("Phone", `<a href="tel:${esc(r.phone.replace(/\s/g, ""))}" style="color:${C.green};text-decoration:none">${esc(r.phone)}</a>`) : "",
    row("Interest", esc(r.interest)),
    row("Received", esc(when) + " (Kigali time)"),
  ].join("");
  const tot = totals
    ? `<div style="margin-top:24px;padding:16px;border:1px solid ${C.line};border-radius:8px;text-align:center;font-family:${SERIF};color:${C.ink}">
         <div style="font-size:24px;font-weight:bold;margin:4px 0">${totals.all} ${totals.all === 1 ? "message" : "messages"} in total</div>
         <div style="font-size:14px;color:${C.soft}">${totals.week} in the last 7 days</div>
       </div>`
    : "";
  const inner = `
    <div style="font-family:${SERIF};font-size:13px;color:${C.soft}">New message</div>
    <div style="font-family:${SERIF};font-size:28px;font-weight:bold;color:${C.green};margin:6px 0 14px">${esc(ORG.name)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid ${C.line}">${rows}</table>
    <p style="margin:22px 0 6px;font-family:${SERIF};font-size:13px;color:${C.gold};font-weight:bold">Message</p>
    <div style="padding:14px 16px;background:${C.pale};border-left:3px solid ${C.green};border-radius:6px;font-family:${SERIF};font-size:16px;line-height:1.55;color:${C.ink};white-space:pre-wrap">${esc(r.message)}</div>
    ${tot}
    <div style="text-align:center;margin-top:22px">${button(`mailto:${r.email}?subject=${encodeURIComponent("Re: your message to " + ORG.name)}`, "Reply to " + esc(r.name.split(" ")[0]))}</div>`;
  return shell(`${r.name} wrote to ${ORG.name} (${r.interest})`, inner);
}

function teamText(r, totals) {
  const L = ["New message", "", `Name: ${r.name}`];
  if (r.organization) L.push(`Organization: ${r.organization}`);
  L.push(`Email: ${r.email}`);
  if (r.phone) L.push(`Phone: ${r.phone}`);
  L.push(`Interest: ${r.interest}`, "", `Message: ${r.message}`);
  if (totals) L.push("", `So far: ${totals.all} messages (${totals.week} in the last 7 days)`);
  return L.join("\n");
}

export async function notifyTeam(r, totals) {
  const to = notifyList();
  if (!to.length || !mailerReady()) return;
  try {
    await deliver({
      to,
      subject: `New message: ${r.name}${r.organization ? ` (${r.organization})` : ""} | ${r.interest}`,
      html: teamHtml(r, totals),
      text: teamText(r, totals),
      replyTo: r.email,
    });
  } catch (e) {
    console.error("Team notification failed", e);
  }
}
