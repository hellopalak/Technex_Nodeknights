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
const EMPTY_SUMMARY = {
  totalCarbonSavedKg: 0,
  totalItemsManaged: 0,
  totalAnalyses: 0,
  categoryStats: {
    biodegradable: { count: 0, co2SavedKg: 0 },
    hazardous: { count: 0, co2SavedKg: 0 },
    reusable: { count: 0, co2SavedKg: 0 },
  },
  dailyStats: [],
};

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

function App() {
  const [token, setToken] = useState(localStorage.getItem("wastewise_token") || "");
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [history, setHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      loadDashboard(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadDashboard(currentToken) {
    setError("");

    try {
      const meResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const meData = await meResponse.json();
      if (!meResponse.ok) throw new Error(meData.message || "Failed to load profile");
      setUser(meData.user);

      const summaryResponse = await fetch(`${API_BASE}/dashboard/summary`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const summaryData = await summaryResponse.json();
      if (!summaryResponse.ok) throw new Error(summaryData.message || "Failed to load summary");
      setSummary({
        ...EMPTY_SUMMARY,
        ...(summaryData.totals || {}),
        categoryStats: summaryData.categoryStats || EMPTY_SUMMARY.categoryStats,
        dailyStats: summaryData.dailyStats || [],
      });

      const historyResponse = await fetch(`${API_BASE}/dashboard/history`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const historyData = await historyResponse.json();
      if (!historyResponse.ok) throw new Error(historyData.message || "Failed to load history");
      setHistory(historyData.analyses || []);
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
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Authentication failed");

      localStorage.setItem("wastewise_token", data.token);
      setToken(data.token);
      setUser(data.user);

      setName("");
      setEmail("");
      setPassword("");
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("wastewise_token");
    setToken("");
    setUser(null);
    setSummary(EMPTY_SUMMARY);
    setHistory([]);
    setFile(null);
    setLatestAnalysis(null);
  }

  async function analyze() {
    if (!file || !token) return;

    setLoading(true);
    setError("");

    try {
      const imageBase64 = await fileToBase64(file);
      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: file.type || "image/jpeg",
          imageName: file.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Analyze failed");

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
      <div className="app-wrapper">
        <div className="app-content">
          <div className="auth-container">
            <div className="auth-header">
              <h2>♻️ WasteWise</h2>
              <p>{mode === "login" ? "Sign in to your account" : "Create a new account"}</p>
            </div>

            <div className="row mb-2">
              <button
                className={mode === "login" ? "btn-primary" : "btn-secondary"}
                type="button"
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={mode === "register" ? "btn-primary" : "btn-secondary"}
                type="button"
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleAuthSubmit} className="form">
              {mode === "register" && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar user={user} logout={logout} />
      <div className="app-content">
        {error && <div className="container mt-2"><div className="error">{error}</div></div>}
        <Routes>
          <Route path="/dashboard" element={<Dashboard user={user} summary={summary} history={history} />} />
          <Route path="/analyze" element={<Analyze file={file} setFile={setFile} analyze={analyze} loading={loading} latestAnalysis={latestAnalysis} />} />
          <Route path="/records" element={<CarbonRecords history={history} />} />
          <Route path="/chatbot" element={<VoiceChatbot token={token} />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
