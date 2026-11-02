"use client";

import { useState } from "react";
import { ORG } from "@/lib/config";
import { CONTENT as C } from "@/lib/content";
import ContactForm from "./ContactForm";
import Donate from "./Donate";

// Shows the photo when a path is set in lib/config.js, otherwise a placeholder block
function Pic({ src, label, alt, className = "" }) {
  if (src) return <img className={"pic " + className} src={src} alt={alt || label} loading="lazy" />;
  return <div className={"ph " + className}>Photo placeholder: {label}</div>;
}

const Head = ({ tag, title, light }) => (
  <>
    <span className="tag">{tag}</span>
    <h2 style={light ? { color: "#fff" } : undefined}>{title}</h2>
  </>
);

export default function Site() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const im = ORG.images;

  return (
    <>
      <header>
        <div className="wrap bar">
          <a className="logo" href="#top" onClick={close}>{ORG.name}</a>
          <nav className={open ? "open" : ""} aria-label="Main">
            {C.nav.map(([l, h]) => <a key={h} href={h} onClick={close}>{l}</a>)}
          </nav>
          <a className="btn small" href="#partnerships" onClick={close}>Partner with us</a>
          <button className="menu" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}><i /><i /><i /></button>
        </div>
      </header>

      <main id="top">
        <section className="hero" style={im.hero ? { backgroundImage: `linear-gradient(rgba(16,40,31,.8),rgba(16,40,31,.88)),url(${im.hero})` } : undefined}>
          <div className="wrap">
            <h1>{C.hero.title.map((l, i) => <span key={i}>{l}<br /></span>)}</h1>
            <p>{C.hero.text}</p>
            <div className="row">
              <a className="btn" href="#partnerships">{C.hero.cta1}</a>
              <a className="btn alt" href="#programs">{C.hero.cta2}</a>
            </div>
          </div>
        </section>

        <section id="about">
          <div className="wrap split">
            <Pic src={im.about} label="young performers" alt={ORG.alts.about} />
            <div>
              <Head tag={C.about.tag} title={C.about.title} />
              {C.about.text.map((p, i) => <p key={i} className={i === 0 ? "lead" : ""}>{p}</p>)}
              <a className="btn dark" href="#programs">{C.about.cta}</a>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Head tag={C.foundations.tag} title={C.foundations.title} />
            <div className="grid">
              {C.foundations.items.map(([h, p]) => <div key={h} className="found"><h3>{h}</h3><p>{p}</p></div>)}
            </div>
          </div>
        </section>

        <section id="programs" className="paper">
          <div className="wrap">
            <Head tag={C.programs.tag} title={C.programs.title} />
            <div className="grid">
              {C.programs.items.map(([h, p]) => <div key={h} className="card"><h3>{h}</h3><p>{p}</p></div>)}
            </div>
          </div>
        </section>

        <section className="band">
          <div className="wrap split">
            <div>
              <Head tag={C.featured.tag} title={C.featured.title} light />
              <p><b>{C.featured.slogan}</b></p>
              <p className="m">{C.featured.text}</p>
              <div className="grid" style={{ marginBottom: 22 }}>
                {C.featured.facts.map(([h, p]) => <div key={h} className="card"><h3>{h}</h3><p>{p}</p></div>)}
              </div>
              <p className="m">{C.featured.more}</p>
              <a className="btn" href="#partnerships">{C.featured.cta}</a>
            </div>
            <Pic src={im.featured} label="competition or rehearsal" alt={ORG.alts.featured} className="top" />
          </div>
        </section>

        <section id="impact" className="deep">
          <div className="wrap">
            <Head tag={C.impact.tag} title={C.impact.title} light />
            <div className="stats-row">
              {C.impact.stats.map(([n, l]) => <div key={l} className="figure"><b>{n}</b><span>{l}</span></div>)}
            </div>
            <p className="m" style={{ maxWidth: "62ch" }}>{C.impact.text}</p>
          </div>
        </section>

        <section>
          <div className="wrap split">
            <Pic src={im.culture} label="traditional dance" alt={ORG.alts.culture} />
            <div>
              <Head tag={C.culture.tag} title={C.culture.title} />
              {C.culture.text.map((p, i) => <p key={i} className={i === 0 ? "lead" : ""}>{p}</p>)}
              <a className="btn dark" href="#programs">{C.culture.cta}</a>
            </div>
          </div>
        </section>

        <section className="paper">
          <div className="wrap split">
            <div>
              <Head tag={C.faith.tag} title={C.faith.title} />
              <p className="lead">{C.faith.text}</p>
              <div className="chips">{C.faith.values.map((v) => <span key={v}>{v}</span>)}</div>
            </div>
            <Pic src={im.faith} label="youth gathering" alt={ORG.alts.faith} />
          </div>
        </section>

        <section id="events">
          <div className="wrap">
            <Head tag={C.events.tag} title={C.events.title} />
            <div className="events">
              {C.events.items.map(([when, h, p]) => (
                <div key={h} className="ev"><b>{when}</b><div><h3>{h}</h3><p className="sub">{p}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className="paper">
          <div className="wrap">
            <Head tag={C.stories.tag} title={C.stories.title} />
            <div className="grid">
              {C.stories.items.map(([h, p], i) => (
                <div key={h} className="story"><Pic src={im.stories[i]} label="story photo" alt={ORG.alts.stories[i]} /><h3>{h}</h3><p>{p}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section id="partnerships" className="deep">
          <div className="wrap">
            <Head tag={C.partnerships.tag} title={C.partnerships.title} light />
            <p className="m" style={{ maxWidth: "62ch" }}>{C.partnerships.text}</p>
            <div className="grid on-dark" style={{ margin: "26px 0" }}>
              {C.partnerships.items.map(([h, p]) => <div key={h} className="card"><h3>{h}</h3><p>{p}</p></div>)}
            </div>
            <a className="btn" href="#contact">{C.partnerships.cta}</a>
          </div>
        </section>

        <section>
          <div className="wrap split">
            <Pic src={im.why} label="community moment" alt={ORG.alts.why} />
            <div>
              <Head tag={C.why.tag} title={C.why.title} />
              <ul className="list">
                {C.why.items.map(([h, p]) => <li key={h}><b>{h}</b> {p}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section id="resources" className="paper">
          <div className="wrap">
            <Head tag={C.resources.tag} title={C.resources.title} />
            <div className="grid">
              {C.resources.items.map((r) => (
                <div key={r.title} className="res">
                  <h3>{r.title}</h3><p>{r.text}</p>
                  {r.href ? <a className="dl" href={r.href} target="_blank" rel="noopener noreferrer">Download</a> : <small>Coming soon</small>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="get-involved">
          <div className="wrap">
            <Head tag={C.involved.tag} title={C.involved.title} />
            <p className="lead">{C.involved.text}</p>
            <div className="grid" style={{ marginTop: 24 }}>
              {C.involved.items.map(([h, p]) => <div key={h} className="card"><h3>{h}</h3><p>{p}</p></div>)}
            </div>
          </div>
        </section>

        <Donate />

        <section>
          <div className="wrap">
            <Head tag={C.gallery.tag} title={C.gallery.title} />
            <div className="gal">
              {im.gallery.map((src, i) => <Pic key={i} src={src} label={`gallery photo ${i + 1}`} alt={ORG.alts.gallery[i]} />)}
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="wrap split top">
            <div>
              <Head tag={C.contact.tag} title={C.contact.title} />
              <p className="lead">{C.contact.text}</p>
              <p>
                <b>{ORG.location}</b><br />
                {ORG.email}<br />
                {ORG.phone}<br />
                {ORG.whatsapp}
                {ORG.social.length > 0 && <><br />{ORG.social.map((s, i) => <span key={s.url}>{i > 0 && " | "}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></span>)}</>}
              </p>
            </div>
            <ContactForm />
          </div>
        </section>

        <section className="cta">
          <div className="wrap">
            <h2>{C.cta.title}</h2>
            <p>{C.cta.text}</p>
            <a className="btn" href="#partnerships">{C.cta.cta1}</a>{" "}
            <a className="btn alt" href="#donate">{C.cta.cta2}</a>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap grid4">
          <div><h3>{ORG.name}</h3><p>{ORG.tagline}</p></div>
          <div><h3>About</h3><a href="#about">Who we are</a><a href="#programs">Programs</a><a href="#impact">Impact</a></div>
          <div><h3>Get involved</h3><a href="#events">Events</a><a href="#partnerships">Partnerships</a><a href="#donate">Donate</a><a href="#resources">Resources</a></div>
          <div><h3>Contact</h3><a href="#contact">Get in touch</a></div>
        </div>
        <div className="wrap legal">&copy; {new Date().getFullYear()} {ORG.name}. {C.footer.rights}</div>
      </footer>
    </>
  );
}
