import { useEffect, useState } from "react";
import "./App.css";
import "./styles/Pages.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import CarbonRecords from "./pages/CarbonRecords";
import VoiceChatbot from "./pages/VoiceChatbot";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Login page styles ────────────────────────────────────────────────────────
const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&family=Rajdhani:wght@500;700&display=swap');

  .ww-root {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Exo 2', sans-serif;
    background: #0a1f14;
    overflow: hidden; position: relative;
  }
  .ww-bg-left {
    position: fixed; inset: 0 50% 0 0;
    background: radial-gradient(ellipse at 30% 50%, #1a5c30 0%, #0d3320 40%, #071a10 100%);
  }
  .ww-bg-right {
    position: fixed; inset: 0 0 0 50%;
    background: radial-gradient(ellipse at 70% 40%, #0d3d5c 0%, #072a42 40%, #040e1a 100%);
  }
  .ww-beam {
    position: fixed; right: 15%; top: 10%;
    width: 2px; height: 60%;
    background: linear-gradient(to bottom, transparent, rgba(0,200,255,0.35), transparent);
    box-shadow: 0 0 20px rgba(0,200,255,0.25);
    transform: rotate(-15deg); pointer-events: none;
  }
  .ww-beam2 {
    position: fixed; right: 30%; top: 25%;
    width: 1px; height: 35%;
    background: linear-gradient(to bottom, transparent, rgba(0,255,160,0.18), transparent);
    transform: rotate(10deg); pointer-events: none;
  }
  .ww-deco { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
  .ww-leaf {
    position: absolute; opacity: 0.32;
    animation: wwFloat 8s ease-in-out infinite;
  }
  .ww-sq {
    position: absolute; border: 1px solid rgba(100,220,180,0.28);
    animation: wwFloat 10s ease-in-out infinite;
  }
  .ww-waste {
    position: absolute; opacity: 0.12;
    animation: wwFloat 9s ease-in-out infinite;
    filter: blur(1px) saturate(0.2) brightness(1.6);
  }
  @keyframes wwFloat {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(-18px) rotate(8deg); }
  }

  .ww-center {
    position: relative; z-index: 10;
    display: flex; flex-direction: column; align-items: center;
    gap: 26px; width: 100%; max-width: 430px; padding: 0 20px;
    animation: wwFadeUp 0.65s ease both;
  }
  @keyframes wwFadeUp {
    from { opacity: 0; transform: translateY(26px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ww-logo { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .ww-logo-icon {
    width: 80px; height: 80px;
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .ww-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,0.65);
    border-top-color: transparent; border-bottom-color: transparent;
    animation: wwSpin 6s linear infinite;
  }
  .ww-ring::before, .ww-ring::after {
    content: ''; position: absolute;
    width: 8px; height: 8px; background: white; border-radius: 50%;
  }
  .ww-ring::before { top: -4px; left: 50%; transform: translateX(-50%); }
  .ww-ring::after  { bottom: -4px; left: 50%; transform: translateX(-50%); }
  @keyframes wwSpin { to { transform: rotate(360deg); } }
  .ww-logo-emoji {
    font-size: 2.1rem; z-index: 2;
    filter: drop-shadow(0 0 10px rgba(74,222,128,0.7));
  }
  .ww-brand {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2.8rem; font-weight: 700; color: #fff;
    letter-spacing: 1px; text-shadow: 0 0 30px rgba(74,222,128,0.35);
  }
  .ww-brand span { color: #4ade80; }
  .ww-tagline {
    font-size: 0.78rem; color: rgba(255,255,255,0.52);
    letter-spacing: 3px; text-transform: uppercase; font-weight: 300;
  }

  .ww-card {
    width: 100%;
    background: rgba(220,240,230,0.1);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 18px; padding: 30px 34px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
  }

  .ww-tabs {
    display: flex; margin-bottom: 22px;
    background: rgba(0,0,0,0.3); border-radius: 8px; padding: 4px;
  }
  .ww-tab {
    flex: 1; padding: 9px; border: none; background: transparent;
    color: rgba(255,255,255,0.45);
    font-family: 'Exo 2', sans-serif;
    font-size: 0.88rem; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer; border-radius: 6px; transition: all 0.22s;
  }
  .ww-tab.active {
    background: #22c55e; color: white;
    box-shadow: 0 2px 14px rgba(34,197,94,0.4);
  }

  .ww-form { display: flex; flex-direction: column; gap: 13px; }
  .ww-field { position: relative; display: flex; align-items: center; }
  .ww-fr { position: absolute; right: 12px; font-size: 1rem; pointer-events: none; }
  .ww-input {
    width: 100%; padding: 12px 42px 12px 14px;
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(74,222,128,0.35);
    border-radius: 8px; font-family: 'Exo 2', sans-serif;
    font-size: 0.95rem; color: #1a3a25; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ww-input::placeholder { color: #7aab8a; }
  .ww-input:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.18); }

  .ww-actions { display: flex; gap: 10px; margin-top: 6px; }
  .ww-btn-green {
    flex: 1; padding: 12px; background: #22c55e; color: white;
    border: none; border-radius: 8px;
    font-family: 'Exo 2', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; box-shadow: 0 4px 16px rgba(34,197,94,0.4);
    transition: background 0.2s;
  }
  .ww-btn-green:hover { background: #16a34a; }
  .ww-btn-green:disabled { opacity: 0.6; cursor: not-allowed; }
  .ww-btn-outline {
    flex: 1; padding: 12px; background: transparent;
    color: rgba(255,255,255,0.85);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px; font-family: 'Exo 2', sans-serif;
    font-size: 0.88rem; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s;
  }
  .ww-btn-outline:hover { border-color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.06); }

  .ww-forgot { text-align: center; margin-top: 8px; }
  .ww-forgot a { color: rgba(255,255,255,0.4); font-size: 0.8rem; text-decoration: none; }
  .ww-forgot a:hover { color: rgba(255,255,255,0.75); }
  .ww-error {
    background: rgba(239,68,68,0.14); border: 1px solid rgba(239,68,68,0.4);
    color: #fca5a5; border-radius: 7px; padding: 8px 12px;
    font-size: 0.85rem; margin-bottom: 6px;
  }

  .ww-status {
    position: fixed; bottom: 20px; left: 20px;
    display: flex; align-items: center; gap: 10px;
    color: rgba(255,255,255,0.65); font-family: 'Exo 2', sans-serif;
    font-size: 0.75rem; letter-spacing: 1px; z-index: 50;
  }
  .ww-status-ring {
    width: 34px; height: 34px; border-radius: 50%;
    border: 2px solid rgba(74,222,128,0.65); border-right-color: transparent;
    animation: wwSpin 3s linear infinite;
    box-shadow: 0 0 10px rgba(74,222,128,0.25);
  }
  .ww-globe {
    position: fixed; bottom: 16px; right: 16px;
    font-size: 1.9rem; z-index: 50;
    filter: drop-shadow(0 0 8px rgba(0,200,255,0.5));
    animation: wwFloat 5s ease-in-out infinite;
  }
`;

// ─── Login page component ─────────────────────────────────────────────────────
function LoginPage({ mode, setMode, name, setName, email, setEmail, password, setPassword, error, loading, handleAuthSubmit }) {
  return (
    <>
      <style>{loginStyles}</style>
      <div className="ww-root">
        <div className="ww-bg-left" />
        <div className="ww-bg-right" />
        <div className="ww-beam" />
        <div className="ww-beam2" />

        <div className="ww-deco">
          {/* Left: visible green foliage */}
          <span className="ww-leaf" style={{ top:"7%", left:"3%", fontSize:"4rem" }}>🌿</span>
          <span className="ww-leaf" style={{ top:"24%", left:"8%", fontSize:"2.4rem", animationDelay:"1.5s" }}>🍃</span>
          <span className="ww-leaf" style={{ top:"43%", left:"2%", fontSize:"3.2rem", animationDelay:"3s" }}>🌱</span>
          <span className="ww-leaf" style={{ top:"62%", left:"7%", fontSize:"3.5rem", animationDelay:"0.8s" }}>🌿</span>
          <span className="ww-leaf" style={{ top:"80%", left:"13%", fontSize:"2.2rem", animationDelay:"2.5s" }}>🍃</span>
          <span className="ww-leaf" style={{ top:"15%", left:"18%", fontSize:"1.8rem", animationDelay:"4s" }}>♻️</span>
          <span className="ww-leaf" style={{ top:"54%", left:"16%", fontSize:"2.6rem", animationDelay:"1s" }}>🌾</span>
          <span className="ww-leaf" style={{ top:"90%", left:"5%", fontSize:"2.8rem", animationDelay:"3.5s" }}>🌿</span>
          <div className="ww-sq" style={{ top:"11%", left:"22%", width:40, height:40, animationDelay:"1s" }} />
          <div className="ww-sq" style={{ top:"67%", left:"11%", width:26, height:26, animationDelay:"3s" }} />
          <div className="ww-sq" style={{ top:"35%", left:"24%", width:15, height:15, animationDelay:"5s" }} />

          {/* Right: ghostly biodegradable waste */}
          <span className="ww-waste" style={{ top:"5%", right:"5%", fontSize:"5rem", animationDelay:"0.5s" }}>🍎</span>
          <span className="ww-waste" style={{ top:"19%", right:"18%", fontSize:"3.5rem", animationDelay:"2s" }}>🥦</span>
          <span className="ww-waste" style={{ top:"33%", right:"4%", fontSize:"4.5rem", animationDelay:"1s" }}>🌽</span>
          <span className="ww-waste" style={{ top:"47%", right:"22%", fontSize:"3rem", animationDelay:"3.5s" }}>🍂</span>
          <span className="ww-waste" style={{ top:"59%", right:"6%", fontSize:"4rem", animationDelay:"1.8s" }}>🥕</span>
          <span className="ww-waste" style={{ top:"71%", right:"18%", fontSize:"3.3rem", animationDelay:"0.3s" }}>🍃</span>
          <span className="ww-waste" style={{ top:"83%", right:"5%", fontSize:"2.8rem", animationDelay:"2.8s" }}>🌰</span>
          <span className="ww-waste" style={{ top:"11%", right:"28%", fontSize:"2.5rem", animationDelay:"4s" }}>🥚</span>
          <span className="ww-waste" style={{ top:"43%", right:"30%", fontSize:"2.2rem", animationDelay:"2.2s" }}>🍞</span>
          <span className="ww-waste" style={{ top:"89%", right:"24%", fontSize:"3rem", animationDelay:"1.3s" }}>🍋</span>
        </div>

        <div className="ww-center">
          <div className="ww-logo">
            <div className="ww-logo-icon">
              <div className="ww-ring" />
              <span className="ww-logo-emoji">🌿</span>
            </div>
            <div className="ww-brand">Waste<span>Wise</span></div>
            <div className="ww-tagline">AI for a Sustainable Tomorrow</div>
          </div>

          <div className="ww-card">
            <div className="ww-tabs">
              <button className={`ww-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Login</button>
              <button className={`ww-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>Sign Up</button>
            </div>

            {error && <div className="ww-error">{error}</div>}

            <form className="ww-form" onSubmit={handleAuthSubmit}>
              {mode === "register" && (
                <div className="ww-field">
                  <input className="ww-input" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <span className="ww-fr">✦</span>
                </div>
              )}
              <div className="ww-field">
                <input className="ww-input" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <span className="ww-fr">🌿</span>
              </div>
              <div className="ww-field">
                <input className="ww-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <span className="ww-fr">🔒</span>
              </div>
              <div className="ww-actions">
                <button className="ww-btn-green" type="submit" disabled={loading}>
                  {loading ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
                </button>
                {mode === "login" && (
                  <button className="ww-btn-outline" type="button" onClick={() => setMode("register")}>Sign Up</button>
                )}
              </div>
            </form>

            {mode === "login" && (
              <div className="ww-forgot"><a href="#">Forgot Password?</a></div>
            )}
          </div>
        </div>

        
        <div className="ww-globe">🌍</div>
      </div>
    </>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [token, setToken] = useState(localStorage.getItem("wastewise_token") || "");
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ totalCarbonSavedKg: 0, totalItemsManaged: 0, totalAnalyses: 0 });
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) loadDashboard(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadDashboard(currentToken) {
    setError("");
    try {
      const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${currentToken}` } });
      const meData = await meRes.json();
      if (!meRes.ok) throw new Error(meData.message || "Failed to load profile");
      setUser(meData.user);

      const sumRes = await fetch(`${API_BASE}/dashboard/summary`, { headers: { Authorization: `Bearer ${currentToken}` } });
      const sumData = await sumRes.json();
      if (!sumRes.ok) throw new Error(sumData.message || "Failed to load summary");
      setSummary(sumData.totals || { totalCarbonSavedKg: 0, totalItemsManaged: 0, totalAnalyses: 0 });

      const histRes = await fetch(`${API_BASE}/dashboard/history`, { headers: { Authorization: `Bearer ${currentToken}` } });
      const histData = await histRes.json();
      if (!histRes.ok) throw new Error(histData.message || "Failed to load history");
      setHistory(histData.analyses || []);
    } catch (e) {
      setError(e.message || "Something went wrong");
      logout();
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = mode === "register"
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");
      localStorage.setItem("wastewise_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setName(""); setEmail(""); setPassword("");
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("wastewise_token");
    setToken(""); setUser(null);
    setSummary({ totalCarbonSavedKg: 0, totalItemsManaged: 0, totalAnalyses: 0 });
    setHistory([]); setFile(null); setLatestAnalysis(null);
  }

  async function analyze() {
    if (!file || !token) return;
    setLoading(true); setError("");
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageBase64, mimeType: file.type || "image/jpeg", imageName: file.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Analyze failed");
      setLatestAnalysis(data.analysis || null);
      await loadDashboard(token);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <LoginPage
        mode={mode} setMode={setMode}
        name={name} setName={setName}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        error={error} loading={loading}
        handleAuthSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar user={user} logout={logout} />
      <div className="app-content">
        {error && <div className="container mt-2"><div className="error">{error}</div></div>}
        <Routes>
          <Route path="/dashboard" element={<Dashboard user={user} summary={summary} history={history} />} />
          <Route path="/analyze"   element={<Analyze file={file} setFile={setFile} analyze={analyze} loading={loading} latestAnalysis={latestAnalysis} />} />
          <Route path="/records"   element={<CarbonRecords history={history} />} />
          <Route path="/chatbot"   element={<VoiceChatbot token={token} />} />
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
