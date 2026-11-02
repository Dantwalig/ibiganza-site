"use client";

import { useState } from "react";
import { ORG } from "@/lib/config";
import { CONTENT } from "@/lib/content";

const t = CONTENT.form;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactForm() {
  const [f, setF] = useState({ name: "", organization: "", email: "", phone: "", interest: ORG.interests[0], message: "", website: "" });
  const [state, setState] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (f.name.trim().length < 2) return setError(t.errName);
    if (!EMAIL_RE.test(f.email.trim())) return setError(t.errEmail);
    if (f.message.trim().length < 5) return setError(t.errMessage);
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("idle");
        return setError(data.error === "email" ? t.errEmail : data.error === "name" ? t.errName : data.error === "message" ? t.errMessage : t.errGeneric);
      }
      setResult({ emailSent: data.emailSent });
      setState("done");
    } catch {
      setState("idle");
      setError(t.errGeneric);
    }
  }

  if (state === "done") {
    return (
      <div className="card success">
        <h3>{t.okTitle}</h3>
        <p>{result.emailSent ? t.okBody : t.okNoEmail}</p>
        <button className="btn ghost" onClick={() => { setF({ name: "", organization: "", email: "", phone: "", interest: ORG.interests[0], message: "", website: "" }); setState("idle"); }}>{t.again}</button>
      </div>
    );
  }

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <div className="two">
        <label><span>{t.name}</span><input value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" required /></label>
        <label><span>{t.organization}</span><input value={f.organization} onChange={(e) => set("organization", e.target.value)} autoComplete="organization" /></label>
      </div>
      <div className="two">
        <label><span>{t.email}</span><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" required /></label>
        <label><span>{t.phone}</span><input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></label>
      </div>
      <label>
        <span>{t.interest}</span>
        <select value={f.interest} onChange={(e) => set("interest", e.target.value)}>
          {ORG.interests.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </label>
      <label><span>{t.message}</span><textarea rows={5} maxLength={2000} value={f.message} onChange={(e) => set("message", e.target.value)} required /></label>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={(e) => set("website", e.target.value)} name="website" />
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn dark" disabled={state === "sending"}>{state === "sending" ? t.sending : t.submit}</button>
      <p className="note">{t.note}</p>
    </form>
  );
}
