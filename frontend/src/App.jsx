import { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import CarbonRecords from "./pages/CarbonRecords";

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
      setSummary(summaryData.totals || { totalCarbonSavedKg: 0, totalItemsManaged: 0, totalAnalyses: 0 });

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
    setSummary({ totalCarbonSavedKg: 0, totalItemsManaged: 0, totalAnalyses: 0 });
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
      if (!response.ok) throw new Error(data.message || "Analyze failed");

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
      <div className="container">
        <h1>Waste Analyzer</h1>
        <div className="row">
          <button type="button" onClick={() => setMode("login")} disabled={mode === "login"}>Login</button>
          <button type="button" onClick={() => setMode("register")} disabled={mode === "register"}>Register</button>
        </div>

        <form onSubmit={handleAuthSubmit} className="form">
          {mode === "register" && (
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>{loading ? "Please wait..." : mode}</button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <nav className="nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/analyze">Analyze</Link>
        <Link to="/records">Carbon Records</Link>
      </nav>

      {error && <p className="error">{error}</p>}

      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} summary={summary} history={history} logout={logout} />} />
        <Route path="/analyze" element={<Analyze file={file} setFile={setFile} analyze={analyze} loading={loading} latestAnalysis={latestAnalysis} />} />
        <Route path="/records" element={<CarbonRecords history={history} />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
