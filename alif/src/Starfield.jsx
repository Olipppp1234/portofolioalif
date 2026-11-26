import { useEffect, useRef } from "react";

// Background luar angkasa: bintang berlapis (parallax) + bintang jatuh + black hole bergerak.
// phase: "intro" | "leaving" | "done". Intro: black hole membesar lalu meledak otomatis -> onEnter().
export default function Starfield({ phase = "done", ready = false, progress = 0, onEnter }) {
  const ref = useRef(null);
  const target = useRef(1);
  target.current = phase === "leaving" ? 7 : 1;
  const readyRef = useRef(false);
  readyRef.current = ready;
  const progRef = useRef(0);
  progRef.current = progress;
  const enterRef = useRef(onEnter);
  enterRef.current = onEnter;
  const startMode = useRef(phase === "intro" ? "intro" : "free");

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, stars = [], shooters = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const layers = [
      { count: 0.00012, speed: 0.04, size: 0.7, alpha: 0.5 },
      { count: 0.00006, speed: 0.1, size: 1.1, alpha: 0.75 },
      { count: 0.00003, speed: 0.22, size: 1.7, alpha: 1 },
    ];

    // ===== Black hole: bintang dan debu tersedot masuk =====
    const hole = { x: 0, y: 0, R: 30 };
    let baseR = 30;
    let gs = 1; // skala pembesaran black hole saat intro
    let mode = startMode.current; // intro -> boom -> free
    let sc = mode === "intro" ? 1 : 1; // skala kemunculan black hole
    let readyAt = 0;
    let boomT = 0, flash = 0, blasts = [], rings = [];
    const tilt = -0.28;
    let disk = [];
    const spawnDisk = (any) => {
      const R = hole.R;
      const r = any ? R * (1.4 + Math.random() * 5.2) : R * (6 + Math.random() * 0.6);
      return { r, a: Math.random() * Math.PI * 2, size: 0.6 + Math.random() * 1.3, purple: Math.random() < 0.2 };
    };
    // Black hole bergerak mengelilingi layar (jalur Lissajous halus)
    const moveHole = (t) => {
      const sec = t / 1000;
      hole.x = w * (0.5 + 0.34 * Math.sin(sec * 0.13));
      hole.y = h * (0.5 + 0.3 * Math.sin(sec * 0.19 + 1.2));
    };
    const placeHole = (t) => {
      if (mode === "intro") {
        // makin bergetar menjelang meledak
        const sh = Math.pow(progRef.current, 3) * 5;
        hole.x = w * 0.5 + (Math.random() - 0.5) * sh;
        hole.y = h * 0.7 + Math.sin(t / 900) * 4 + (Math.random() - 0.5) * sh;
      } else if (mode === "free") moveHole(t);
    };
    const initHole = () => {
      const small = w < 640;
      baseR = Math.max(22, Math.min(w, h) * (small ? 0.045 : 0.055));
      hole.R = baseR;
      placeHole(performance.now());
      disk = Array.from({ length: small ? 140 : 260 }, () => spawnDisk(true));
    };
    const pullStar = (s, dt) => {
      const dx = hole.x - s.x;
      const dy = hole.y - s.y;
      const d = Math.hypot(dx, dy) || 1;
      const pr = hole.R * gs * 9;
      if (d > pr) return;
      const f = 1 - d / pr;
      const pull = (0.12 + 3.2 * f * f) * dt;
      s.x += (dx / d) * pull - (dy / d) * pull * 0.6;
      s.y += (dy / d) * pull + (dx / d) * pull * 0.6;
      if (d < hole.R * gs * 1.1) {
        s.x = Math.random() * w; // tersedot habis, muncul lagi di tempat lain
        s.y = Math.random() * h;
      }
    };
    const drawParticles = (front) => {
      for (const p of disk) {
        if ((Math.sin(p.a) > 0) !== front) continue;
        const k = hole.R / p.r;
        const ex = Math.cos(p.a) * p.r;
        const ey = Math.sin(p.a) * p.r * 0.3;
        const x = hole.x + ex * Math.cos(tilt) - ey * Math.sin(tilt);
        const y = hole.y + ex * Math.sin(tilt) + ey * Math.cos(tilt);
        const alpha = Math.min(1, 0.25 + k * 0.9);
        ctx.fillStyle = p.purple
          ? `hsla(275, 90%, ${60 + k * 25}%, ${alpha})`
          : `hsla(${25 + k * 25}, 100%, ${55 + k * 30}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.8 + k * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const drawHole = (dt) => {
      const R = hole.R;
      if (!reduce) {
        for (let i = 0; i < disk.length; i++) {
          const p = disk[i];
          const k = R / p.r;
          p.a += 0.05 * Math.pow(k, 1.2) * dt;
          p.r -= (0.05 + 0.5 * k * k) * dt * (R / 40);
          if (p.r < R * 1.08) disk[i] = spawnDisk(false);
        }
      }
      drawParticles(false);
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.strokeStyle = "rgba(255,210,150,0.85)";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "rgba(255,160,80,0.9)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, R * 1.05, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      drawParticles(true);
    };

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initHole();
      stars = [];
      layers.forEach((l, li) => {
        const n = Math.floor(w * h * l.count);
        for (let i = 0; i < n; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            li,
            tw: Math.random() * Math.PI * 2,
            hue: Math.random() < 0.25 ? 30 : Math.random() < 0.1 ? 45 : 0,
          });
        }
      });
    };

    const explode = () => {
      if (mode !== "intro") return;
      mode = "boom";
      boomT = 0;
      flash = 1;
      sc = 0;
      const n = 240;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 2 + Math.random() * 13;
        blasts.push({ x: hole.x, y: hole.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, size: 1 + Math.random() * 2.6, hue: 15 + Math.random() * 40 });
      }
      rings.push({ r: hole.R * gs, a: 1, v: 16 }, { r: hole.R * gs * 0.6, a: 0.8, v: 10 });
      for (const st of stars) {
        const dx = st.x - hole.x, dy = st.y - hole.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = 28 / (1 + d / 120);
        st.kx = (dx / d) * f;
        st.ky = (dy / d) * f;
      }
      enterRef.current && enterRef.current();
    };
    const spawnShooter = () => {
      shooters.push({
        x: Math.random() * w * 0.8 + w * 0.2,
        y: Math.random() * h * 0.4,
        vx: -(6 + Math.random() * 4),
        vy: 3 + Math.random() * 2,
        life: 0,
      });
    };

    let mult = 1;
    let last = performance.now();
    let nextShooter = last + 2500;

    const draw = (now) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      mult += (target.current - mult) * 0.06 * dt;
      ctx.clearRect(0, 0, w, h);
      if (!reduce || mode === "intro") placeHole(now);
      // intro: black hole makin besar seiring progres loading
      const gt = mode === "intro" ? 0.8 + progRef.current * 1.5 : 1;
      gs += (gt - gs) * 0.08 * dt;
      if (mode !== "intro") gs = 1;
      // setelah loading penuh & ukuran maksimal -> meledak otomatis
      if (mode === "intro" && readyRef.current) {
        if (!readyAt) readyAt = now;
        if (now - readyAt > 900) explode();
      }
      if (mode === "boom") {
        boomT += dt * 16.67;
        if (boomT > 1000) {
          mode = "free";
          hole.R = baseR;
          disk = disk.map(() => spawnDisk(true));
          sc = 0;
          placeHole(now);
        }
      } else if (mode === "free" && sc < 1) {
        sc = Math.min(1, sc + 0.014 * dt);
      }

      for (const s of stars) {
        const l = layers[s.li];
        if (!reduce) {
          s.x -= l.speed * mult * dt;
          s.y += l.speed * 0.35 * mult * dt;
          s.tw += 0.02 * dt;
          if (s.kx) {
            s.x += s.kx * dt;
            s.y += s.ky * dt;
            s.kx *= Math.pow(0.93, dt);
            s.ky *= Math.pow(0.93, dt);
            if (Math.abs(s.kx) + Math.abs(s.ky) < 0.05) s.kx = s.ky = 0;
          }
          if (s.x < -2) s.x = w + 2;
          if (s.y > h + 2) s.y = -2;
          if (sc > 0.5) pullStar(s, dt);
        }
        const dh = Math.hypot(hole.x - s.x, hole.y - s.y);
        const a = l.alpha * (0.65 + 0.35 * Math.sin(s.tw)) * Math.min(1, 0.35 + dh / (hole.R * 6));
        const col = `hsla(${s.hue}, ${s.hue ? 80 : 0}%, 95%, ${a})`;
        if (mult > 2.5 && !reduce) {
          ctx.strokeStyle = col;
          ctx.lineWidth = l.size;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + l.speed * mult * 3, s.y - l.speed * 0.35 * mult * 3);
          ctx.stroke();
        } else {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(s.x, s.y, l.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (sc > 0.02) {
        const k = mode === "free" ? 1 - Math.pow(1 - sc, 3) : gs;
        ctx.save();
        ctx.translate(hole.x, hole.y);
        ctx.scale(k, k);
        ctx.translate(-hole.x, -hole.y);
        drawHole(dt);
        ctx.restore();
      }

      // ledakan: gelombang kejut + percikan + kilatan
      for (const r of rings) {
        r.r += r.v * dt;
        r.a -= 0.014 * dt;
        if (r.a <= 0) continue;
        ctx.strokeStyle = `rgba(255,205,150,${r.a})`;
        ctx.lineWidth = 3 + r.a * 5;
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      rings = rings.filter((r) => r.a > 0);
      for (const b of blasts) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vx *= Math.pow(0.975, dt);
        b.vy *= Math.pow(0.975, dt);
        b.life -= 0.012 * dt;
        if (b.life <= 0) continue;
        ctx.fillStyle = `hsla(${b.hue}, 100%, ${55 + b.life * 35}%, ${b.life})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * (0.5 + b.life), 0, Math.PI * 2);
        ctx.fill();
      }
      blasts = blasts.filter((b) => b.life > 0);
      if (flash > 0) {
        ctx.fillStyle = `rgba(255,225,190,${flash * 0.55})`;
        ctx.fillRect(0, 0, w, h);
        flash -= 0.04 * dt;
      }

      if (!reduce) {
        if (now > nextShooter) {
          spawnShooter();
          nextShooter = now + 3000 + Math.random() * 5000;
        }
        shooters = shooters.filter((s) => s.life < 70);
        for (const s of shooters) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.life += dt;
          const fade = 1 - s.life / 70;
          const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
          g.addColorStop(0, `rgba(255,255,255,${fade})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    init();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <div className="space" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}
