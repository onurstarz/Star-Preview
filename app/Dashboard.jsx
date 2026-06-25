"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════════════════════════════════════
   ⭐ STAR DASHBOARD — Ontario Virtual School quick-launch
   ────────────────────────────────────────────────────────────────────────────
   👉 EDIT YOUR LINKS / ACCOUNT IN ONE PLACE:  the TOOLS array + SCHOOL_EMAIL
   below. Everything else is wiring. All tools open in a new tab so they work
   reliably on every device (Google/ChatGPT block being embedded in iframes).
   ════════════════════════════════════════════════════════════════════════════ */

// Your school Google account — used to nudge Google links to the right account.
const SCHOOL_EMAIL = "you@ontariovirtualschool.ca"; // ← change me

// Builds a Google link that pre-selects your school account, then continues on.
function google(continueUrl) {
  return (
    "https://accounts.google.com/AccountChooser?Email=" +
    encodeURIComponent(SCHOOL_EMAIL) +
    "&continue=" +
    encodeURIComponent(continueUrl)
  );
}

// ─── THE TOOLS (edit names / links / icons freely) ───────────────────────────
const TOOLS = [
  {
    key: "ovs",
    name: "Ontario Virtual School",
    desc: "Courses, lessons & grades",
    href: "https://www.ontariovirtualschool.ca/",
    icon: "🎓",
    tint: "sage",
    featured: true,
  },
  {
    key: "gmail",
    name: "School Gmail",
    desc: "Your school inbox",
    href: google("https://mail.google.com/mail/u/0/"),
    icon: "✉️",
    tint: "berry",
  },
  {
    key: "docs",
    name: "Google Docs",
    desc: "Write & edit documents",
    href: google("https://docs.google.com/document/u/0/"),
    icon: "📄",
    tint: "sky",
  },
  {
    key: "slides",
    name: "Google Slides",
    desc: "Build presentations",
    href: google("https://docs.google.com/presentation/u/0/"),
    icon: "📊",
    tint: "peach",
  },
  {
    key: "canva",
    name: "Canva",
    desc: "Design anything",
    href: "https://www.canva.com/",
    icon: "🎨",
    tint: "violet",
  },
  {
    key: "chatgpt",
    name: "ChatGPT",
    desc: "Quick chat & help",
    href: "https://chatgpt.com/",
    icon: "🤖",
    tint: "sage",
  },
  {
    key: "youtube",
    name: "YouTube",
    desc: "Watch & learn",
    href: "https://www.youtube.com/",
    icon: "▶️",
    tint: "berry",
  },
  {
    key: "grammar",
    name: "Grammar Checker",
    desc: "Proofread your writing",
    href: "https://app.grammarly.com/", // ← swap if you use a different one
    icon: "✅",
    tint: "sage",
  },
  {
    key: "project",
    name: "My Current Project",
    desc: "What I'm working on now",
    href: "#", // ← point this wherever your current project lives
    icon: "⭐",
    tint: "peach",
  },
];

// ─── TINY LOCAL AUTH (browser-only, no server) ───────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem("star_users") || "{}"); } catch { return {}; }
}
function saveUsers(u) { localStorage.setItem("star_users", JSON.stringify(u)); }
function getSession() {
  try { return JSON.parse(localStorage.getItem("star_session") || "null"); } catch { return null; }
}
function saveSession(s) { localStorage.setItem("star_session", s ? JSON.stringify(s) : "null"); }

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
function today() {
  return new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ════════════════════════════════════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Caveat:wght@600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --cream:#f7efe0; --cream2:#efe4cf; --card:#fffdf7;
  --cocoa:#5e4632; --cocoa2:#7a6048; --ink:#4a3829;
  --muted:#9c8a73; --line:#e6d9c2;
  --sage:#8ba577; --sage-d:#6d8a55;
  --berry:#cf8a93; --berry-d:#b96b76;
  --sky:#8fb3c9; --peach:#e6a274; --violet:#b69ccb;
  --shadow:0 10px 30px rgba(94,70,50,.12);
  --shadow-sm:0 4px 14px rgba(94,70,50,.10);
}

html,body{height:100%;}
body{
  font-family:'Nunito',system-ui,sans-serif;
  color:var(--ink);
  background:
    radial-gradient(ellipse 80% 60% at 15% 0%, rgba(139,165,119,.16), transparent 60%),
    radial-gradient(ellipse 70% 50% at 95% 10%, rgba(207,138,147,.14), transparent 55%),
    radial-gradient(ellipse 90% 60% at 50% 110%, rgba(230,162,116,.12), transparent 60%),
    var(--cream);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}

.font-display{font-family:'Fredoka',sans-serif;}
.script{font-family:'Caveat',cursive;}

/* gingham/checker overlay like the café card */
.bg-checker::before{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5;
  background-image:
    linear-gradient(45deg, rgba(139,165,119,.05) 25%, transparent 25%, transparent 75%, rgba(139,165,119,.05) 75%),
    linear-gradient(45deg, rgba(139,165,119,.05) 25%, transparent 25%, transparent 75%, rgba(139,165,119,.05) 75%);
  background-size:40px 40px; background-position:0 0,20px 20px;
}

/* ── floating decor ── */
.decor{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;}
.deco{position:absolute;opacity:.55;will-change:transform;}
.deco.s1{top:12%;left:6%;font-size:2.2rem;animation:bob 7s ease-in-out infinite;}
.deco.s2{top:24%;right:8%;font-size:1.6rem;animation:bob 9s ease-in-out infinite .8s;}
.deco.s3{bottom:18%;left:9%;font-size:1.9rem;animation:bob 8s ease-in-out infinite .4s;}
.deco.s4{bottom:26%;right:6%;font-size:2.4rem;animation:bob 10s ease-in-out infinite 1.2s;}
.deco.s5{top:46%;left:3%;font-size:1.3rem;animation:bob 11s ease-in-out infinite .6s;}
.deco.s6{top:60%;right:4%;font-size:1.5rem;animation:bob 8.5s ease-in-out infinite .2s;}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-16px) rotate(6deg);}}

/* ════ AUTH ════ */
.auth{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;position:relative;z-index:2;}
.auth-card{
  width:100%;max-width:400px;background:var(--card);border:2px solid var(--line);
  border-radius:28px;padding:40px 34px;box-shadow:var(--shadow);position:relative;
}
.auth-badge{
  position:absolute;top:-22px;left:50%;transform:translateX(-50%);
  background:var(--sage);color:#fff;font-family:'Fredoka';font-weight:600;
  padding:8px 22px;border-radius:999px;font-size:.92rem;white-space:nowrap;
  box-shadow:var(--shadow-sm);border:2px solid #fff;
}
.auth-logo{font-family:'Fredoka';font-weight:700;font-size:2rem;text-align:center;margin-top:14px;color:var(--cocoa);}
.auth-logo .star{color:var(--peach);}
.auth-sub{text-align:center;color:var(--muted);font-size:.88rem;margin-top:2px;margin-bottom:26px;}
.auth-sub .script{font-size:1.15rem;color:var(--sage-d);}

.seg{display:flex;background:var(--cream2);border-radius:14px;padding:4px;margin-bottom:20px;gap:4px;}
.seg button{
  flex:1;border:none;background:none;padding:9px;border-radius:11px;cursor:pointer;
  font-family:'Nunito';font-weight:700;font-size:.82rem;color:var(--muted);transition:.18s;
}
.seg button.on{background:#fff;color:var(--cocoa);box-shadow:var(--shadow-sm);}

.field{margin-bottom:14px;}
.field label{display:block;font-size:.74rem;font-weight:700;color:var(--cocoa2);margin-bottom:6px;letter-spacing:.02em;}
.field input{
  width:100%;padding:13px 15px;border:2px solid var(--line);border-radius:13px;
  font-family:'Nunito';font-size:.95rem;font-weight:600;color:var(--ink);background:var(--cream);outline:none;transition:.18s;
}
.field input:focus{border-color:var(--sage);background:#fff;}

.btn-go{
  width:100%;padding:14px;border:none;border-radius:14px;cursor:pointer;margin-top:6px;
  background:linear-gradient(135deg,var(--sage),var(--sage-d));color:#fff;
  font-family:'Fredoka';font-weight:600;font-size:1rem;box-shadow:var(--shadow-sm);transition:.16s;
}
.btn-go:hover{filter:brightness(1.05);transform:translateY(-2px);}
.btn-go:active{transform:translateY(0);}
.btn-go:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.err{color:var(--berry-d);text-align:center;font-size:.82rem;font-weight:700;margin-top:12px;}
.hint{text-align:center;font-size:.74rem;color:var(--muted);margin-top:16px;line-height:1.5;}

/* ════ APP SHELL ════ */
.shell{position:relative;z-index:2;min-height:100vh;}
.wrap{max-width:1180px;margin:0 auto;padding:0 22px;}

/* awning header (café-style) */
.awning{height:30px;display:flex;overflow:hidden;}
.awning span{flex:1;}
.awning span:nth-child(odd){background:var(--sage);}
.awning span:nth-child(even){background:var(--cream);}
.awning span{border-bottom-left-radius:14px;border-bottom-right-radius:14px;}

.topbar{display:flex;align-items:center;justify-content:space-between;padding:20px 0 6px;gap:14px;flex-wrap:wrap;}
.brand{display:flex;align-items:center;gap:12px;}
.brand-mark{
  width:46px;height:46px;border-radius:15px;display:grid;place-items:center;font-size:1.4rem;
  background:linear-gradient(135deg,var(--peach),var(--berry));box-shadow:var(--shadow-sm);
}
.brand-name{font-family:'Fredoka';font-weight:700;font-size:1.35rem;line-height:1;color:var(--cocoa);}
.brand-name .star{color:var(--peach);}
.brand-tag{font-size:.72rem;color:var(--muted);font-weight:700;}

.userchip{display:flex;align-items:center;gap:10px;background:var(--card);border:2px solid var(--line);
  border-radius:999px;padding:6px 8px 6px 14px;box-shadow:var(--shadow-sm);}
.userchip .who{font-weight:800;font-size:.82rem;color:var(--cocoa);}
.av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--sage),var(--sky));
  display:grid;place-items:center;color:#fff;font-family:'Fredoka';font-weight:600;font-size:.85rem;}
.logout{border:none;background:var(--cream2);color:var(--cocoa2);font-weight:700;font-size:.74rem;
  padding:7px 12px;border-radius:999px;cursor:pointer;transition:.16s;font-family:'Nunito';}
.logout:hover{background:var(--berry);color:#fff;}

/* hero banner */
.hero{
  margin-top:14px;background:linear-gradient(135deg,#fff,var(--card));
  border:2px solid var(--line);border-radius:26px;padding:26px 28px;
  display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;
  box-shadow:var(--shadow);position:relative;overflow:hidden;
}
.hero::after{content:"⭐";position:absolute;right:-10px;bottom:-22px;font-size:7rem;opacity:.06;transform:rotate(-12deg);}
.hero h1{font-family:'Fredoka';font-weight:700;font-size:1.85rem;color:var(--cocoa);line-height:1.1;}
.hero p{color:var(--muted);font-weight:700;margin-top:6px;font-size:.92rem;}
.pills{display:flex;gap:10px;flex-wrap:wrap;}
.pill{display:flex;align-items:center;gap:7px;background:var(--cream);border:2px solid var(--line);
  border-radius:999px;padding:8px 15px;font-weight:800;font-size:.78rem;color:var(--cocoa2);}
.dot{width:9px;height:9px;border-radius:50%;background:var(--sage);box-shadow:0 0 0 4px rgba(139,165,119,.22);}

/* section label */
.sec{display:flex;align-items:center;gap:10px;margin:30px 0 16px;}
.sec h2{font-family:'Fredoka';font-weight:600;font-size:1.15rem;color:var(--cocoa);}
.sec .line{flex:1;height:2px;background:repeating-linear-gradient(90deg,var(--line) 0 8px,transparent 8px 14px);}
.sec .count{font-size:.74rem;font-weight:800;color:var(--muted);}

/* search */
.search{display:flex;align-items:center;gap:10px;background:var(--card);border:2px solid var(--line);
  border-radius:14px;padding:11px 16px;box-shadow:var(--shadow-sm);margin-top:4px;}
.search input{flex:1;border:none;background:none;outline:none;font-family:'Nunito';font-weight:700;
  font-size:.95rem;color:var(--ink);}
.search input::placeholder{color:var(--muted);}

/* tool grid */
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));}
.grid.mob{grid-template-columns:repeat(2,1fr);gap:12px;}

.card{
  position:relative;background:var(--card);border:2px solid var(--line);border-radius:22px;
  padding:20px;cursor:pointer;text-decoration:none;color:inherit;display:block;
  box-shadow:var(--shadow-sm);transition:box-shadow .2s, border-color .2s;
  transform-style:preserve-3d;
}
.card:hover{box-shadow:var(--shadow);border-color:var(--sage);}
.card .ico{
  width:52px;height:52px;border-radius:16px;display:grid;place-items:center;font-size:1.55rem;
  margin-bottom:14px;transition:transform .2s;box-shadow:var(--shadow-sm);transform:translateZ(28px);
}
.card:hover .ico{transform:translateZ(28px) scale(1.08) rotate(-5deg);}
.tint-sage{background:#e7eede;}.tint-berry{background:#f6e3e5;}.tint-sky{background:#e2edf3;}
.tint-peach{background:#f8e8d8;}.tint-violet{background:#ece3f3;}
.card h3{font-family:'Fredoka';font-weight:600;font-size:1.05rem;color:var(--cocoa);transform:translateZ(18px);}
.card p{color:var(--muted);font-weight:700;font-size:.8rem;margin-top:3px;transform:translateZ(12px);}
.card .arrow{position:absolute;top:18px;right:18px;color:var(--line);font-weight:900;transition:.2s;transform:translateZ(20px);}
.card:hover .arrow{color:var(--sage);transform:translateZ(20px) translateX(3px);}
.card.feat{grid-column:1/-1;background:linear-gradient(135deg,var(--sage),var(--sage-d));border-color:transparent;color:#fff;}
.card.feat h3,.card.feat p{color:#fff;}
.card.feat p{opacity:.9;}
.card.feat .ico{background:rgba(255,255,255,.22);}
.card.feat .arrow{color:rgba(255,255,255,.7);}
.card.feat .go{display:inline-block;margin-top:12px;background:#fff;color:var(--sage-d);font-family:'Fredoka';
  font-weight:600;padding:8px 18px;border-radius:999px;font-size:.85rem;transform:translateZ(16px);}

/* footer */
.foot{text-align:center;padding:38px 0 30px;color:var(--muted);font-weight:700;font-size:.78rem;}
.foot .script{font-size:1.1rem;color:var(--sage-d);}

/* ════ MOBILE-SPECIFIC SHELL ════ */
.m-head{position:sticky;top:0;z-index:20;background:rgba(247,239,224,.86);backdrop-filter:blur(10px);
  border-bottom:2px solid var(--line);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;}
.m-greet{font-family:'Fredoka';font-weight:600;font-size:1.05rem;color:var(--cocoa);line-height:1.1;}
.m-greet small{display:block;font-family:'Nunito';font-weight:700;font-size:.68rem;color:var(--muted);}
.m-body{padding:16px;}
.m-status{display:flex;gap:8px;margin:2px 0 14px;}
.m-status .pill{flex:1;justify-content:center;font-size:.72rem;padding:9px;}
.m-feat{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,var(--sage),var(--sage-d));
  color:#fff;border-radius:20px;padding:18px;text-decoration:none;box-shadow:var(--shadow);margin-bottom:8px;}
.m-feat .ico{width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.22);display:grid;place-items:center;font-size:1.5rem;flex-shrink:0;}
.m-feat h3{font-family:'Fredoka';font-weight:600;font-size:1.1rem;}
.m-feat p{font-size:.78rem;opacity:.9;font-weight:700;}
.m-card{display:flex;flex-direction:column;align-items:flex-start;background:var(--card);border:2px solid var(--line);
  border-radius:18px;padding:15px;text-decoration:none;color:inherit;box-shadow:var(--shadow-sm);
  transition:transform .12s;min-height:118px;}
.m-card:active{transform:scale(.96);}
.m-card .ico{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-size:1.35rem;margin-bottom:10px;box-shadow:var(--shadow-sm);}
.m-card h3{font-family:'Fredoka';font-weight:600;font-size:.92rem;color:var(--cocoa);line-height:1.15;}
.m-card p{color:var(--muted);font-weight:700;font-size:.7rem;margin-top:2px;}

@media (max-width:380px){.grid.mob{gap:10px;}.m-card{padding:12px;min-height:108px;}}
`;

/* ════════════════════════════════════════════════════════════════════════════
   AUTH SCREEN
   ════════════════════════════════════════════════════════════════════════════ */
function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = () => {
    setErr("");
    if (!email || !pw) return setErr("Please fill in your email and password.");
    if (pw.length < 4) return setErr("Password should be at least 4 characters.");
    if (mode === "signup" && !name.trim()) return setErr("What should we call you?");
    setBusy(true);
    setTimeout(() => {
      const users = getUsers();
      if (mode === "signup") {
        if (users[email]) { setErr("That account already exists — try signing in."); setBusy(false); return; }
        users[email] = { pw, name: name.trim() };
        saveUsers(users);
        onLogin({ email, name: name.trim() });
      } else {
        if (!users[email] || users[email].pw !== pw) { setErr("Hmm, that email or password isn't right."); setBusy(false); return; }
        onLogin({ email, name: users[email].name });
      }
    }, 450);
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-badge">Welcome! ⋆˚࿔</div>
        <div className="auth-logo">Star<span className="star"> ✦ </span>Desk</div>
        <div className="auth-sub">your school <span className="script">home base</span></div>

        <div className="seg">
          <button className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setErr(""); }}>Sign In</button>
          <button className={mode === "signup" ? "on" : ""} onClick={() => { setMode("signup"); setErr(""); }}>Create</button>
        </div>

        {mode === "signup" && (
          <div className="field">
            <label>Your name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.ca" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        <button className="btn-go" onClick={submit} disabled={busy}>
          {busy ? "One sec…" : mode === "login" ? "Let's go ⭐" : "Create my desk ⭐"}
        </button>
        {err && <div className="err">{err}</div>}
        <div className="hint">Saved only on this device — no server, nothing leaves your browser.</div>
      </div>
    </div>
  );
}

/* ── 3D tilt wrapper (desktop only) ── */
function TiltCard({ children, className, href, onClick }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-4px)`;
  };
  const reset = () => { const el = ref.current; if (el) el.style.transform = ""; };
  return (
    <a ref={ref} className={className} href={href} onClick={onClick}
       target={href && href !== "#" ? "_blank" : undefined} rel="noopener noreferrer"
       onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </a>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   DESKTOP DASHBOARD
   ════════════════════════════════════════════════════════════════════════════ */
function DesktopDash({ session, onLogout }) {
  const [q, setQ] = useState("");
  const decorRef = useRef(null);

  // mouse parallax for floating decor
  useEffect(() => {
    const onMove = (e) => {
      const el = decorRef.current; if (!el) return;
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      el.querySelectorAll(".deco").forEach((d, i) => {
        const depth = (i % 3 + 1) * 6;
        d.style.marginLeft = `${mx * depth}px`;
        d.style.marginTop = `${my * depth}px`;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const list = TOOLS.filter(t => (t.name + t.desc).toLowerCase().includes(q.toLowerCase()));
  const featured = list.find(t => t.featured);
  const rest = list.filter(t => !t.featured);
  const initials = (session.name || session.email || "?").slice(0, 1).toUpperCase();

  const open = (t) => (e) => { if (t.href === "#") e.preventDefault(); };

  return (
    <div className="shell">
      <div className="decor" ref={decorRef} aria-hidden>
        <span className="deco s1">⭐</span><span className="deco s2">✿</span>
        <span className="deco s3">☁️</span><span className="deco s4">✦</span>
        <span className="deco s5">🍵</span><span className="deco s6">✧</span>
      </div>

      <div className="awning">{Array.from({ length: 14 }).map((_, i) => <span key={i} />)}</div>

      <div className="wrap">
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">⭐</div>
            <div>
              <div className="brand-name">Star<span className="star"> Desk</span></div>
              <div className="brand-tag">Ontario Virtual School · quick launch</div>
            </div>
          </div>
          <div className="userchip">
            <div className="av">{initials}</div>
            <span className="who">{session.name || session.email}</span>
            <button className="logout" onClick={onLogout}>Log out</button>
          </div>
        </div>

        <div className="hero">
          <div>
            <h1>{greeting()}, {session.name || "friend"}! ⋆˙⟡</h1>
            <p>Have a look around — everything you need for school, one tap away.</p>
          </div>
          <div className="pills">
            <span className="pill"><span className="dot" /> status: ready</span>
            <span className="pill">📅 {today()}</span>
            <span className="pill">🧰 {TOOLS.length} tools</span>
          </div>
        </div>

        <div className="sec">
          <h2>🔎 Find a tool</h2><span className="line" />
        </div>
        <div className="search">
          <span>🔎</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your tools…" />
        </div>

        <div className="sec">
          <h2>✿ Your tools</h2><span className="line" /><span className="count">{rest.length} shown</span>
        </div>

        {featured && (
          <a className="card feat" href={featured.href} target="_blank" rel="noopener noreferrer" style={{ marginBottom: 16 }}>
            <span className="arrow">↗</span>
            <div className="ico">{featured.icon}</div>
            <h3>{featured.name}</h3>
            <p>{featured.desc} — open your classroom & grades</p>
            <span className="go">Open school ↗</span>
          </a>
        )}

        <div className="grid">
          {rest.map(t => (
            <TiltCard key={t.key} className="card" href={t.href} onClick={open(t)}>
              <span className="arrow">↗</span>
              <div className={`ico tint-${t.tint}`}>{t.icon}</div>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </TiltCard>
          ))}
          {rest.length === 0 && !featured && (
            <p style={{ color: "var(--muted)", fontWeight: 700, gridColumn: "1/-1", padding: "30px 0", textAlign: "center" }}>
              No tools match “{q}” 🍃
            </p>
          )}
        </div>

        <div className="foot">
          <span className="script">stay cozy & study well</span> · Star Desk ⭐
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MOBILE DASHBOARD (distinct layout)
   ════════════════════════════════════════════════════════════════════════════ */
function MobileDash({ session, onLogout }) {
  const featured = TOOLS.find(t => t.featured);
  const rest = TOOLS.filter(t => !t.featured);
  return (
    <div className="shell">
      <div className="decor" aria-hidden>
        <span className="deco s1">⭐</span><span className="deco s4">✦</span><span className="deco s3">☁️</span>
      </div>

      <div className="m-head">
        <div className="m-greet">{greeting()}! ⭐<small>{session.name || session.email}</small></div>
        <button className="logout" onClick={onLogout}>Log out</button>
      </div>

      <div className="m-body">
        <div className="m-status">
          <span className="pill"><span className="dot" /> ready</span>
          <span className="pill">📅 {today()}</span>
        </div>

        {featured && (
          <a className="m-feat" href={featured.href} target="_blank" rel="noopener noreferrer">
            <div className="ico">{featured.icon}</div>
            <div>
              <h3>{featured.name}</h3>
              <p>Tap to open your classroom ↗</p>
            </div>
          </a>
        )}

        <div className="sec">
          <h2>✿ Your tools</h2><span className="line" />
        </div>

        <div className="grid mob">
          {rest.map(t => (
            <a key={t.key} className="m-card" href={t.href}
               target={t.href !== "#" ? "_blank" : undefined} rel="noopener noreferrer"
               onClick={e => t.href === "#" && e.preventDefault()}>
              <div className={`ico tint-${t.tint}`}>{t.icon}</div>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </a>
          ))}
        </div>

        <div className="foot"><span className="script">stay cozy & study well</span><br />Star Desk ⭐</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ROOT — picks mobile vs desktop UI, handles session
   ════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
    const mq = window.matchMedia("(max-width: 720px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const login = (s) => { saveSession(s); setSession(s); };
  const logout = () => { saveSession(null); setSession(null); };

  return (
    <>
      <style>{css}</style>
      <div className="bg-checker" />
      {!ready ? null : !session ? (
        <Auth onLogin={login} />
      ) : isMobile ? (
        <MobileDash session={session} onLogout={logout} />
      ) : (
        <DesktopDash session={session} onLogout={logout} />
      )}
    </>
  );
}
