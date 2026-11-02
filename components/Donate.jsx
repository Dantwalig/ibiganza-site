"use client";

import { useState } from "react";
import { ORG } from "@/lib/config";
import { CONTENT } from "@/lib/content";

const t = CONTENT.donate;
const tel = (code) => "tel:" + code.replace(/#/g, "%23");

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1600);
    } catch {}
  }
  return <button type="button" className="copy-btn" onClick={copy} aria-live="polite">{ok ? t.copied : t.copy}</button>;
}

export default function Donate() {
  const { momo, bank } = ORG.support;
  return (
    <section id="donate" className="paper">
      <div className="wrap support">
        <span className="tag">{t.tag}</span>
        <h2>{t.title}</h2>
        <p className="lead">{t.text}</p>
        <div className="give-grid">
          <div className="give-card">
            <p className="give-kicker">{t.momoTitle}</p>
            <h3 className="give-name">{ORG.name}</h3>
            <p className="give-label">{t.momoLabel}</p>
            <p className="give-num">{momo.code} <CopyBtn text={momo.code} /></p>
            <p className="give-holder">{t.holder}: {momo.holder}</p>
            <a className="momo-btn" href={tel(momo.ussd)} aria-label={`${t.momoBtn}: ${momo.ussd}`}>
              <span className="momo-dot" aria-hidden="true" />{t.momoBtn}
            </a>
            <p className="give-hint">{t.momoHint}</p>
          </div>

          <div className="give-card bank-card">
            <p className="give-kicker">{t.bankTitle}</p>
            <h3 className="give-name">{bank.bank}</h3>
            <div className="bank-row">
              <div>
                <small>{t.account}</small>
                <span className="acc">{bank.account}</span>
              </div>
              <CopyBtn text={bank.account} />
              {bank.ekash && (
                <div className="ekash-wrap">
                  <a className="ekash-btn" href={tel(bank.ekash)} aria-label={`${t.ekashBtn}: ${bank.ekash}`}>
                    <span className="momo-dot" aria-hidden="true" />{t.ekashBtn}
                  </a>
                  <span className="ekash-hint">{t.ekashHint}</span>
                </div>
              )}
            </div>
            <div className="bank-meta">
              <p><small>{t.names}</small>{bank.holder}</p>
              <p><small>{t.swift}</small><b className="swift">{bank.swift}</b> <CopyBtn text={bank.swift} /></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
