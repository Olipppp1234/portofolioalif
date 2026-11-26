import { useEffect, useRef, useState } from "react";
import Starfield from "./Starfield.jsx";
import Icon, { SocialIcon } from "./icons.jsx";
import { profile, projects, hobbies, experiences, experienceTitle, experienceDesc } from "./data.js";

function useTypewriter(words) {
  const [text, setText] = useState("");
  useEffect(() => {
    let wi = 0, ci = 0, del = false, t;
    const tick = () => {
      const word = words[wi];
      ci += del ? -1 : 1;
      setText(word.slice(0, ci));
      let d = del ? 35 : 80;
      if (!del && ci === word.length) { del = true; d = 1600; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; d = 400; }
      t = setTimeout(tick, d);
    };
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [words]);
  return text;
}

// Nama dipecah per huruf supaya tiap huruf bisa dianimasikan satu per satu.
function AnimatedName({ text }) {
  let i = 0;
  const words = text.split(" ");
  return (
    <h2 className="hero-name" aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi}>
          <span className="word" aria-hidden="true">
            {[...word].map((c, ci) => (
              <span className="ch" style={{ "--i": i++ }} key={ci}>{c}</span>
            ))}
          </span>
          {wi < words.length - 1 && " "}
        </span>
      ))}
    </h2>
  );
}

function Img({ src, alt, className }) {
  const [ok, setOk] = useState(true);
  return ok ? (
    <img className={className} src={src} alt={alt} loading="lazy" onError={() => setOk(false)} />
  ) : (
    <div className={`${className || ""} img-fallback`} role="img" aria-label={alt} />
  );
}

function Intro({ leaving, onReady, onProgress }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let v = 0;
    const t = setInterval(() => {
      v = Math.min(100, v + Math.random() * 5 + 2);
      setPct(Math.round(v));
      onProgress(v / 100);
      if (v >= 100) { clearInterval(t); onReady(); }
    }, 120);
    return () => clearInterval(t);
  }, []);
  const ready = pct >= 100;
  return (
    <div className={leaving ? "intro leaving" : "intro"}>
      <p className="mono intro-small">{profile.intro.small}</p>
      <h1>{profile.intro.title}</h1>
      <p className="intro-sub">{profile.intro.sub}</p>
      <div className="bar" aria-hidden="true"><i style={{ width: pct + "%" }} /></div>
      <p className={ready ? "mono intro-pct hint" : "mono intro-pct"}>
        {ready ? "Bersiap meledak…" : `Memuat ${pct}%`}
      </p>
    </div>
  );
}

export default function App() {
  const typed = useTypewriter(profile.typed);
  const [phase, setPhase] = useState("intro"); // intro -> leaving -> done
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = phase === "done" ? "" : "hidden";
  }, [phase]);

  // Fade-in saat bagian halaman pertama kali terlihat (saat di-scroll)
  useEffect(() => {
    if (phase === "intro") return;
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver(
      (list) => list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [phase]);

  const enter = () => {
    setPhase("leaving");
    setTimeout(() => setPhase("done"), 1000);
  };

  return (
    <>
      <Starfield phase={phase} ready={ready} progress={progress} onEnter={enter} />
      {phase !== "done" && <Intro leaving={phase === "leaving"} onReady={() => setReady(true)} onProgress={setProgress} />}

      <main className={phase === "intro" ? "hidden" : "shown"}>
        <section className="hero">
          <div className="hero-text">
            <p className="mono hero-hello">{profile.hero.greeting}</p>
            <AnimatedName text={profile.name} />
            <p className="hero-role">{profile.role}</p>
            <p className="mono typed">{typed}<span className="caret">_</span></p>
            <div className="about">
              <h3>Tentang Saya</h3>
              <p>{profile.about}</p>
            </div>
          </div>
          <div className="photo-wrap">
            <Img className="photo" src="/assets/profil.PNG" alt="Foto profil" />
            <span className="badge mono">{profile.gpa}</span>
          </div>
        </section>

        <section className="stack reveal">
          <h2 className="title grad">{profile.stackTitle}</h2>
          <p className="stack-desc">{profile.stackDesc}</p>
          <div className="stack-grid">
            {profile.skills.map((n) => (
              <div className="card stack-item" key={n}>
                <Icon name={n} />
                <span>{n}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="reveal">
          <h2 className="title">Project</h2>
          <div className="grid">
            {projects.map((p) => (
              <article className="card project" key={p.id}>
                <Img className="cover" src={p.image} alt={`Proyek ${p.title}`} />
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                {p.tools && (
                  <ul className="tools mono" aria-label="Tools yang digunakan">
                    {p.tools.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                )}
                <div className="actions">
                  {p.links.map((l, i) => (
                    <a key={l.label} className={i ? "btn ghost" : "btn"} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="exp reveal">
          <h2 className="title">{experienceTitle}</h2>
          <p className="exp-desc">{experienceDesc}</p>
          <ol className="timeline">
            {experiences.map((e) => (
              <li key={e.title}>
                <span className="mono tag">{e.tag}</span>
                <h3>{e.title}</h3>
                {Array.isArray(e.text) ? (
                  <ul>
                    {e.text.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                ) : (
                  <p>{e.text}</p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="reveal">
          <h2 className="title">Hobi</h2>
          <div className="grid">
            {hobbies.map((h) => (
              <article className="card project" key={h.title}>
                <Img className="cover" src={h.image} alt={h.title} />
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="reveal">
          <nav className="links">
            {profile.links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer"><SocialIcon name={l.label} />{l.label}</a>
            ))}
          </nav>
          <a className="terminal mono" href={profile.resume} download="CV_Alif.pdf">
            <span>$ ./download_resume.sh</span>
            <small>Klik untuk mengunduh CV saya.</small>
          </a>
          <p className="copyright mono">© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
