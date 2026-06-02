"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── TINY AUTH STORE (localStorage-backed) ───────────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem("sb_users") || "{}"); } catch { return {}; }
}
function saveUsers(u) { localStorage.setItem("sb_users", JSON.stringify(u)); }
function getSession() {
  try { return JSON.parse(localStorage.getItem("sb_session") || "null"); } catch { return null; }
}
function saveSession(s) { localStorage.setItem("sb_session", s ? JSON.stringify(s) : "null"); }

// ─── KEYWORD EXTRACTION — calls our server-side API route ────────────────────
async function extractKeywords(text) {
  const res = await fetch("/api/extract-keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const data = await res.json();
  return data.keywords;
}

// ─── IMAGE URL BUILDER ────────────────────────────────────────────────────────
function makeImageUrl(keyword) {
  const prompt = encodeURIComponent(
    `minimalist stickman illustration: ${keyword}, black ink on white, simple clean lines, graphic novel style`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1a1a1a;
    --paper: #f5f0e8;
    --paper2: #ede8dc;
    --accent: #c0392b;
    --accent2: #e67e22;
    --muted: #7a7264;
    --border: #d4cdc0;
    --card: #faf7f2;
    --shadow: 0 2px 12px rgba(0,0,0,0.08);
  }

  html, body, #__next {
    height: 100%;
    font-family: 'DM Mono', monospace;
    background: var(--paper);
    color: var(--ink);
  }

  body { overflow-x: hidden; }

  .auth-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(192,57,43,0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(230,126,34,0.05) 0%, transparent 50%),
      var(--paper);
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 48px 40px;
    box-shadow: 4px 4px 0 var(--ink);
  }

  .auth-logo {
    font-family: 'Instrument Serif', serif;
    font-size: 2rem;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }

  .auth-logo span { color: var(--accent); font-style: italic; }

  .auth-tagline {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 36px;
  }

  .tab-row {
    display: flex;
    gap: 0;
    margin-bottom: 28px;
    border-bottom: 1px solid var(--border);
  }

  .tab-btn {
    flex: 1;
    padding: 10px;
    background: none;
    border: none;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    color: var(--muted);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.15s;
  }

  .tab-btn.active { color: var(--ink); border-bottom-color: var(--accent); }

  .field { margin-bottom: 16px; }

  .field label {
    display: block;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .field input {
    width: 100%;
    padding: 10px 12px;
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 1px;
    font-family: 'DM Mono', monospace;
    font-size: 0.85rem;
    color: var(--ink);
    outline: none;
    transition: border-color 0.15s;
  }

  .field input:focus { border-color: var(--ink); }

  .btn-primary {
    width: 100%;
    padding: 12px;
    background: var(--ink);
    color: var(--paper);
    border: none;
    border-radius: 1px;
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.15s;
  }

  .btn-primary:hover { background: var(--accent); }
  .btn-primary:disabled { background: var(--muted); cursor: not-allowed; }

  .auth-error {
    font-size: 0.72rem;
    color: var(--accent);
    margin-top: 12px;
    text-align: center;
  }

  .app-wrap {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: var(--ink);
    color: var(--paper);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .topbar-logo {
    font-family: 'Instrument Serif', serif;
    font-size: 1.3rem;
    letter-spacing: -0.01em;
  }

  .topbar-logo span { color: var(--accent2); font-style: italic; }

  .topbar-user {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    color: rgba(245,240,232,0.6);
  }

  .btn-logout {
    background: none;
    border: 1px solid rgba(245,240,232,0.25);
    color: rgba(245,240,232,0.7);
    padding: 5px 10px;
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 1px;
    transition: all 0.15s;
  }

  .btn-logout:hover { border-color: var(--accent2); color: var(--accent2); }

  .main-content {
    flex: 1;
    display: grid;
    grid-template-columns: 380px 1fr;
    min-height: calc(100vh - 52px);
  }

  @media (max-width: 768px) {
    .main-content { grid-template-columns: 1fr; }
    .sidebar { border-right: none; border-bottom: 1px solid var(--border); }
  }

  .sidebar {
    background: var(--card);
    border-right: 1px solid var(--border);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .sidebar-title {
    font-size: 0.65rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .script-area {
    width: 100%;
    height: 220px;
    padding: 12px;
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 1px;
    font-family: 'DM Mono', monospace;
    font-size: 0.8rem;
    line-height: 1.6;
    color: var(--ink);
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
  }

  .script-area:focus { border-color: var(--ink); }
  .script-area::placeholder { color: var(--muted); }

  .generate-btn {
    width: 100%;
    padding: 14px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 1px;
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, transform 0.1s;
    box-shadow: 3px 3px 0 rgba(0,0,0,0.15);
  }

  .generate-btn:hover:not(:disabled) { background: #a93226; transform: translate(-1px,-1px); box-shadow: 4px 4px 0 rgba(0,0,0,0.15); }
  .generate-btn:active:not(:disabled) { transform: translate(1px,1px); box-shadow: 1px 1px 0 rgba(0,0,0,0.15); }
  .generate-btn:disabled { background: var(--muted); cursor: not-allowed; box-shadow: none; transform: none; }

  .keywords-section { display: flex; flex-direction: column; gap: 10px; }

  .keywords-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .keyword-chip {
    padding: 4px 10px;
    background: var(--paper2);
    border: 1px solid var(--border);
    border-radius: 1px;
    font-size: 0.7rem;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .keyword-chip.done { border-color: #27ae60; background: rgba(39,174,96,0.07); }
  .keyword-chip.loading { border-color: var(--accent2); background: rgba(230,126,34,0.07); animation: pulse 1.2s infinite; }

  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

  .status-bar {
    padding: 10px 12px;
    background: var(--paper2);
    border: 1px solid var(--border);
    border-radius: 1px;
    font-size: 0.68rem;
    color: var(--muted);
    line-height: 1.5;
  }

  .status-bar.active { color: var(--ink); border-color: var(--accent2); }

  .progress-bar-wrap {
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    margin-top: 8px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.4s ease;
  }

  .gallery-area {
    padding: 28px 24px;
    overflow-y: auto;
  }

  .gallery-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .gallery-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.5rem;
    letter-spacing: -0.01em;
  }

  .gallery-count {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
    .gallery-area { padding: 16px; }
    .sidebar { padding: 20px 16px; }
    .auth-card { padding: 32px 24px; }
    .topbar { padding: 12px 16px; }
  }

  .image-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 2px;
    overflow: hidden;
    animation: fadeIn 0.4s ease forwards;
    box-shadow: var(--shadow);
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .image-card:hover { box-shadow: 4px 4px 0 var(--ink); transform: translate(-2px,-2px); }

  @keyframes fadeIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }

  .image-card img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
    background: var(--paper2);
  }

  .image-card-meta {
    padding: 10px 12px;
    border-top: 1px solid var(--border);
  }

  .image-card-keyword {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }

  .image-card-time {
    font-size: 0.62rem;
    color: var(--muted);
    letter-spacing: 0.06em;
  }

  .skeleton {
    width: 100%;
    aspect-ratio: 1;
    background: linear-gradient(90deg, var(--paper2) 25%, var(--border) 50%, var(--paper2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    color: var(--muted);
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.4;
    display: block;
  }

  .empty-title {
    font-family: 'Instrument Serif', serif;
    font-size: 1.2rem;
    color: var(--ink);
    opacity: 0.4;
    margin-bottom: 8px;
  }

  .empty-sub { font-size: 0.72rem; letter-spacing: 0.06em; }

  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setTimeout(() => {
      const users = getUsers();
      if (tab === "signup") {
        if (users[email]) { setError("Account already exists."); setLoading(false); return; }
        users[email] = { password, name: email.split("@")[0] };
        saveUsers(users);
        const session = { email, name: users[email].name };
        saveSession(session);
        onLogin(session);
      } else {
        if (!users[email] || users[email].password !== password) {
          setError("Invalid email or password.");
          setLoading(false);
          return;
        }
        const session = { email, name: users[email].name };
        saveSession(session);
        onLogin(session);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">Story<span>board</span></div>
        <div className="auth-tagline">Script → Visual Concept Generator</div>

        <div className="tab-row">
          <button className={`tab-btn${tab === "login" ? " active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign In</button>
          <button className={`tab-btn${tab === "signup" ? " active" : ""}`} onClick={() => { setTab("signup"); setError(""); }}>Create Account</button>
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? "..." : tab === "login" ? "Sign In" : "Create Account"}
        </button>

        {error && <div className="auth-error">{error}</div>}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function StoryboardApp({ session, onLogout }) {
  const [script, setScript] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [images, setImages] = useState([]);
  const [loadingKw, setLoadingKw] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingSet, setLoadingSet] = useState(new Set());
  const [statusMsg, setStatusMsg] = useState("Paste a script or keyword list to begin.");
  const [progress, setProgress] = useState(0);
  const galleryRef = useRef(null);
  const abortRef = useRef(false);

  const totalDone = images.filter(i => i.loaded).length;

  const handleGenerate = useCallback(async () => {
    if (!script.trim() || generating || loadingKw) return;
    abortRef.current = false;

    setImages([]);
    setKeywords([]);
    setProgress(0);
    setLoadingSet(new Set());

    setLoadingKw(true);
    setStatusMsg("Analyzing script with AI...");
    let kws;
    try {
      kws = await extractKeywords(script);
    } catch (e) {
      // Fallback: simple word split
      kws = script.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 2).slice(0, 10);
    }
    setLoadingKw(false);
    setKeywords(kws);
    setGenerating(true);
    setStatusMsg(`Generating ${kws.length} images...`);

    for (let i = 0; i < kws.length; i++) {
      if (abortRef.current) break;
      const kw = kws[i];
      const url = makeImageUrl(kw);
      const id = `img-${Date.now()}-${i}`;
      const timestamp = new Date().toLocaleTimeString();

      setImages(prev => [...prev, { id, keyword: kw, url, loaded: false, timestamp }]);
      setLoadingSet(prev => new Set([...prev, id]));

      await new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = () => {
          setImages(prev => prev.map(im => im.id === id ? { ...im, loaded: true } : im));
          setLoadingSet(prev => { const s = new Set(prev); s.delete(id); return s; });
          setProgress(Math.round(((i + 1) / kws.length) * 100));
          setStatusMsg(`Generated ${i + 1} of ${kws.length} — "${kw}"`);
          resolve();
        };
        img.src = url;
        setTimeout(() => {
          setImages(prev => prev.map(im => im.id === id ? { ...im, loaded: true, error: true } : im));
          setLoadingSet(prev => { const s = new Set(prev); s.delete(id); return s; });
          setProgress(Math.round(((i + 1) / kws.length) * 100));
          resolve();
        }, 15000);
      });

      if (galleryRef.current) galleryRef.current.scrollTop = galleryRef.current.scrollHeight;
    }

    setGenerating(false);
    setStatusMsg(`Done! ${kws.length} images generated.`);
    setProgress(100);
  }, [script, generating, loadingKw]);

  const handleNewProject = () => {
    abortRef.current = true;
    setImages([]);
    setKeywords([]);
    setScript("");
    setProgress(0);
    setGenerating(false);
    setLoadingKw(false);
    setStatusMsg("Paste a script or keyword list to begin.");
  };

  const isWorking = generating || loadingKw;

  return (
    <div className="app-wrap">
      <div className="topbar">
        <div className="topbar-logo">Story<span>board</span></div>
        <div className="topbar-user">
          <span>{session.name}</span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="main-content">
        <div className="sidebar">
          <div className="sidebar-title">Your Script or Keywords</div>

          <textarea
            className="script-area"
            value={script}
            onChange={e => setScript(e.target.value)}
            placeholder={"Paste your script, scene description, or a list of keywords here...\n\nExample:\nA lone figure walks through a burning city. Shadows move. A door opens to light."}
            disabled={isWorking}
          />

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isWorking || !script.trim()}
          >
            {isWorking ? <><span className="spinner" /> Generating...</> : "⚡ Generate Storyboard"}
          </button>

          {images.length > 0 && !isWorking && (
            <button className="btn-primary" onClick={handleNewProject} style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--border)" }}>
              ✕ New Project
            </button>
          )}

          <div className={`status-bar${isWorking ? " active" : ""}`}>
            {statusMsg}
            {isWorking && progress > 0 && (
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          {keywords.length > 0 && (
            <div className="keywords-section">
              <div className="sidebar-title">Extracted Keywords</div>
              <div className="keywords-list">
                {keywords.map((kw, i) => {
                  const img = images.find(im => im.keyword === kw);
                  const cls = img?.loaded ? "done" : img ? "loading" : "";
                  return (
                    <div key={i} className={`keyword-chip ${cls}`}>
                      {img?.loaded ? "✓" : img ? "·" : "○"} {kw}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="gallery-area" ref={galleryRef}>
          <div className="gallery-header">
            <div className="gallery-title">Visual Output</div>
            {images.length > 0 && (
              <div className="gallery-count">{totalDone} / {images.length} ready</div>
            )}
          </div>

          <div className="gallery-grid">
            {images.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">✏</span>
                <div className="empty-title">Nothing generated yet</div>
                <div className="empty-sub">Paste your script and hit Generate</div>
              </div>
            )}

            {images.map(img => (
              <div key={img.id} className="image-card">
                {img.loaded && !img.error ? (
                  <img src={img.url} alt={img.keyword} loading="lazy" />
                ) : img.error ? (
                  <div className="skeleton" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "var(--muted)" }}>
                    Failed to load
                  </div>
                ) : (
                  <div className="skeleton" />
                )}
                <div className="image-card-meta">
                  <div className="image-card-keyword">{img.keyword}</div>
                  <div className="image-card-time">{img.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function StoryboardRoot() {
  const [session, setSession] = useState(() => getSession());

  const handleLogin = (s) => { saveSession(s); setSession(s); };
  const handleLogout = () => { saveSession(null); setSession(null); };

  return (
    <>
      <style>{css}</style>
      {session
        ? <StoryboardApp session={session} onLogout={handleLogout} />
        : <AuthScreen onLogin={handleLogin} />
      }
    </>
  );
}
