"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ORG } from "@/lib/config";

function Login({ onDone }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function go(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setBusy(false);
    if (res.ok) onDone();
    else setErr("Wrong password.");
  }
  return (
    <form className="card form login" onSubmit={go}>
      <h1 style={{ textAlign: "center" }}>Messages</h1>
      <label>
        <span>Password</span>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
      </label>
      {err && <p className="error">{err}</p>}
      <button className="btn" disabled={busy}>{busy ? "Checking..." : "Sign in"}</button>
    </form>
  );
}

export default function Admin() {
  const [data, setData] = useState(null);
  const [authed, setAuthed] = useState(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [confirmIds, setConfirmIds] = useState(null); // array of messages waiting for delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/messages", { cache: "no-store" });
    if (res.status === 401) return setAuthed(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.messages) {
      setLoadError(body.detail || "The messages could not be loaded.");
      return setAuthed(true);
    }
    setLoadError("");
    setData(body);
    setAuthed(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    return data.messages.filter((g) => {
      if (tab !== "all" && g.interest !== tab) return false;
      if (!s) return true;
      return [g.name, g.organization, g.email, g.phone, g.interest, g.message].some((v) => (v || "").toLowerCase().includes(s));
    });
  }, [data, q, tab]);

  const allShown = rows.length > 0 && rows.every((g) => selected.has(g.id));
  const toggleOne = (id) => setSelected((o) => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected((o) => {
    const n = new Set(o);
    if (allShown) rows.forEach((g) => n.delete(g.id)); else rows.forEach((g) => n.add(g.id));
    return n;
  });

  async function doDelete() {
    if (!confirmIds) return;
    setDeleting(true);
    setDelError("");
    try {
      const res = await fetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: confirmIds.map((g) => g.id) }),
      });
      if (res.status === 401) { setConfirmIds(null); setAuthed(false); return; }
      if (!res.ok) throw new Error("failed");
      setSelected((o) => { const n = new Set(o); confirmIds.forEach((g) => n.delete(g.id)); return n; });
      setConfirmIds(null);
      await load();
    } catch {
      setDelError("Could not delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setData(null);
    setAuthed(false);
  }

  if (authed === null) return <div className="admin"><p>Loading...</p></div>;
  if (authed === false) return <div className="admin"><Login onDone={load} /></div>;

  if (!data) {
    return (
      <div className="admin">
        <div className="admin-top">
          <h1>Messages</h1>
          <div className="admin-actions">
            <button className="btn ghost" onClick={load}>Try again</button>
            <button className="btn ghost" onClick={logout}>Sign out</button>
          </div>
        </div>
        <p className="error" role="alert">Could not load the messages: {loadError}</p>
      </div>
    );
  }

  const st = data.stats;
  const chosen = data.messages.filter((g) => selected.has(g.id));
  return (
    <div className="admin">
      <div className="admin-top">
        <h1>Messages</h1>
        <div className="admin-actions">
          <a className="btn" href="/api/admin/export">Download CSV</a>
          <button className="btn ghost" onClick={load}>Refresh</button>
          <button className="btn ghost" onClick={logout}>Sign out</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat main"><b>{st.total}</b><span>Total messages</span></div>
        <div className="stat"><b>{st.lastWeek}</b><span>Last 7 days</span></div>
        <div className="stat"><b>{st.partnership}</b><span>Partnership requests</span></div>
        <div className="stat"><b>{st.fromOrganizations}</b><span>From organizations</span></div>
      </div>

      <div className="toolbar">
        <input placeholder="Search name, organization, email, phone or message" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="tabs">
          {[["all", "All"], ...ORG.interests.map((i) => [i, i])].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      {chosen.length > 0 && (
        <div className="bulk-bar" role="status">
          <span><b>{chosen.length}</b> selected</span>
          <div className="admin-actions">
            <button className="btn ghost" onClick={() => setSelected(new Set())}>Clear</button>
            <button className="btn danger" onClick={() => { setDelError(""); setConfirmIds(chosen); }}>Delete selected</button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th className="sel"><input type="checkbox" aria-label="Select all shown" checked={allShown} onChange={toggleAll} /></th><th>Name</th><th>Contact</th><th>Interest</th><th>Message</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7}>No messages yet.</td></tr>}
            {rows.map((g) => (
              <tr key={g.id} className={selected.has(g.id) ? "picked" : ""}>
                <td className="sel"><input type="checkbox" aria-label={`Select ${g.name}`} checked={selected.has(g.id)} onChange={() => toggleOne(g.id)} /></td>
                <td><strong>{g.name}</strong>{g.organization ? <><br />{g.organization}</> : null}</td>
                <td>{g.email}{g.phone ? <><br />{g.phone}</> : null}</td>
                <td><span className="pill yes">{g.interest}</span></td>
                <td className="msg-cell">{g.message}</td>
                <td style={{ whiteSpace: "nowrap" }}>{new Date(g.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td><button className="link-btn" onClick={() => { setDelError(""); setConfirmIds([g]); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmIds && (
        <div className="modal-scrim" onClick={() => !deleting && setConfirmIds(null)}>
          <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="del-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="del-title">Delete {confirmIds.length === 1 ? "this message" : `${confirmIds.length} messages`}?</h2>
            <p>
              {confirmIds.length === 1
                ? <>You are about to delete the message from <strong>{confirmIds[0].name}</strong>.</>
                : <>You are about to delete these messages:</>}
            </p>
            {confirmIds.length > 1 && (
              <ul className="modal-list">
                {confirmIds.slice(0, 8).map((g) => <li key={g.id}>{g.name}</li>)}
                {confirmIds.length > 8 && <li>and {confirmIds.length - 8} more</li>}
              </ul>
            )}
            <p className="modal-warn">This cannot be undone.</p>
            {delError && <p className="error" role="alert">{delError}</p>}
            <div className="admin-actions modal-actions">
              <button className="btn ghost" onClick={() => setConfirmIds(null)} disabled={deleting}>Cancel</button>
              <button className="btn danger" onClick={doDelete} disabled={deleting} autoFocus>{deleting ? "Deleting..." : "Yes, delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
