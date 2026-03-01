import React from "react";

const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&family=Rajdhani:wght@500;700&display=swap');

  .db-root {
    min-height: 100vh;
    background: #e8f2e8;
    font-family: 'Exo 2', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  /* ── SVG leaf edges ── */
  .db-leaf-edge {
    position: fixed; top: 0; z-index: 0;
    pointer-events: none; opacity: 0.17;
  }
  .db-leaf-edge.left  { left: -40px; }
  .db-leaf-edge.right { right: -40px; }

  .db-content {
    position: relative; z-index: 1;
    max-width: 1050px; margin: 0 auto;
    padding: 28px 24px 60px;
    animation: dbFadeUp 0.5s ease both;
  }
  @keyframes dbFadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* Welcome */
  .db-welcome { margin-bottom: 22px; }
  .db-welcome h2 {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2rem; font-weight: 700; color: #1a5c30;
  }

  /* ── Stat cards ── */
  .db-stats-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 16px; margin-bottom: 22px;
  }
  .db-stat-card {
    border-radius: 14px; padding: 18px 18px 16px;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 20px rgba(10,50,20,0.3);
    transition: transform 0.2s; min-height: 130px;
  }
  .db-stat-card:hover { transform: translateY(-3px); }
  .db-stat-card:nth-child(1) { background: linear-gradient(135deg, #2d7a3a 0%, #1a4d22 100%); }
  .db-stat-card:nth-child(2) { background: linear-gradient(135deg, #1e6b38 0%, #0e3d20 100%); }
  .db-stat-card:nth-child(3) { background: linear-gradient(135deg, #155228 0%, #0a3318 100%); }

  .db-stat-label {
    font-size: 1.0rem; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 6px;
  }
  .db-stat-value {
    font-family: 'Rajdhani', sans-serif;
    font-size: 3.2rem; font-weight: 700; color: #fff; line-height: 1;
  }
  .db-stat-unit { font-size: 0.78rem; color: rgba(255,255,255,0.5); margin-top: 2px; }
  .db-stat-bottom-icons {
    display: flex; align-items: center; gap: 6px; margin-top: 10px;
  }
  .db-stat-bottom-icons span { font-size: 1.3rem; opacity: 0.55; }
  .db-stat-arrow { font-size: 1.1rem; color: #4ade80; opacity: 0.9; }

  /* Right illustrated art */
  .db-stat-art {
    position: absolute; right: 14px; bottom: 10px;
    display: flex; gap: 5px; align-items: flex-end; opacity: 0.35;
  }
  .db-stat-art span { font-size: 2rem; line-height: 1; }
  .db-stat-art span:last-child { font-size: 2.4rem; }

  .db-co2-art {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    display: flex; flex-direction: column; align-items: center; opacity: 0.35;
  }
  .db-co2-art .cloud { font-size: 2.8rem; line-height: 1; }
  .db-co2-art .co2-lbl {
    font-size: 0.6rem; font-weight: 700; color: white;
    letter-spacing: 1px; margin-top: -4px;
  }

  /* ── Section cards ── */
  .db-card {
    background: rgba(255,255,255,0.88);
    border: 1.5px solid rgba(34,197,94,0.15);
    border-radius: 14px; padding: 20px;
    margin-bottom: 18px;
    box-shadow: 0 3px 16px rgba(10,50,20,0.07);
  }
  .db-card h3 {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.7rem; font-weight: 700; color: #1a3a25;
    margin: 0 0 16px;
  }

  /* ── Category cards ── */
  .db-cat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .db-cat-item {
    border-radius: 10px; padding: 14px 12px;
    border: 1.5px solid; position: relative;
    min-height: 90px; transition: transform 0.18s;
  }
  .db-cat-item:hover { transform: translateY(-2px); }
  .db-cat-item.bio    { background: #fffbf0; border-color: #c8922a; }
  .db-cat-item.reuse  { background: #f0f9ff; border-color: #2ea8d4; }
  .db-cat-item.hazard { background: #fff5f5; border-color: #d44040; }

  .db-cat-badge {
    font-size: 1.0rem; font-weight: 800; letter-spacing: 2px;
    text-transform: uppercase; margin-bottom: 5px; display: block;
  }
  .bio .db-cat-badge    { color: #a0720a; }
  .reuse .db-cat-badge  { color: #0878a8; }
  .hazard .db-cat-badge { color: #c82020; }

  .db-cat-count { font-size: 0.88rem; color: #3a5a42; font-weight: 500; margin-bottom: 2px; }
  .db-cat-co2   { font-size: 0.76rem; color: #5a7a65; }

  .db-cat-art {
    position: absolute; right: 8px; bottom: 6px;
    opacity: 0.28; line-height: 1; text-align: right;
  }

  /* ── Two col ── */
  .db-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

  /* ── Empty state ── */
  .db-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 16px 0 8px;
    color: #7aab8a; font-size: 0.88rem; text-align: center;
  }
  .db-empty-art {
    font-size: 1rem; line-height: 1;
    display: flex; gap: 4px; align-items: flex-end; opacity: 0.5;
  }

  /* ── Activity list ── */
  .db-activity-list { display: flex; flex-direction: column; gap: 8px; }
  .db-activity-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    background: rgba(34,197,94,0.04);
    border: 1px solid rgba(34,197,94,0.1);
    border-radius: 8px; transition: background 0.15s;
  }
  .db-activity-item:hover { background: rgba(34,197,94,0.09); }
  .db-act-clock { font-size: 1rem; opacity: 0.45; flex-shrink: 0; }
  .db-act-body  { flex: 1; }
  .db-act-body strong {
    display: block; font-size: 0.88rem; color: #1a3a25;
    font-weight: 600; text-transform: capitalize;
  }
  .db-act-body p { font-size: 0.74rem; color: #5a7a65; margin: 0; }
  .db-act-icon { font-size: 1.1rem; opacity: 0.5; flex-shrink: 0; }

  .db-badge {
    font-size: 0.7rem; padding: 3px 8px; border-radius: 20px;
    font-weight: 700; letter-spacing: 0.5px; flex-shrink: 0;
    text-transform: capitalize;
  }
  .db-badge-bio     { background: #fef3c7; color: #a16207; }
  .db-badge-reuse   { background: #e0f2fe; color: #0369a1; }
  .db-badge-hazard  { background: #fee2e2; color: #b91c1c; }
  .db-badge-default { background: #dcfce7; color: #15803d; }

  /* ── Daily list ── */
  .db-daily-list { display: flex; flex-direction: column; gap: 8px; }
  .db-daily-item {
    padding: 10px 12px;
    background: rgba(34,197,94,0.04);
    border: 1px solid rgba(34,197,94,0.1);
    border-radius: 8px;
    display: flex; align-items: center; gap: 10px;
  }
  .db-daily-icon { font-size: 1.3rem; opacity: 0.5; flex-shrink: 0; }
  .db-daily-body strong { font-size: 0.88rem; color: #1a3a25; display: block; }
  .db-daily-body p { font-size: 0.74rem; color: #5a7a65; margin: 0; }

  @media (max-width: 768px) {
    .db-stats-grid, .db-cat-grid, .db-two-col { grid-template-columns: 1fr; }
  }
    @media (max-width: 768px) {
  .db-stats-grid {
    grid-template-columns: 1fr;
  }
  .db-cat-grid {
    grid-template-columns: 1fr;
  }
  .db-two-col {
    grid-template-columns: 1fr;
  }
}
`;

// Left/right SVG leaf illustrations
const LeafSVG = ({ side }) => {
  const isLeft = side === "left";
  return (
    <svg
      className={`db-leaf-edge ${side}`}
      width="180" height="600"
      viewBox="0 0 180 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isLeft ? (
        <>
          <ellipse cx="60" cy="100" rx="12" ry="55" fill="#2d7a3a" transform="rotate(-20 60 100)"/>
          <ellipse cx="40" cy="100" rx="3" ry="50" fill="#1a5c30" transform="rotate(-20 40 100)"/>
          <ellipse cx="90" cy="180" rx="14" ry="65" fill="#3a8a45" transform="rotate(15 90 180)"/>
          <ellipse cx="70" cy="180" rx="3" ry="60" fill="#1a5c30" transform="rotate(15 70 180)"/>
          <ellipse cx="30" cy="270" rx="11" ry="50" fill="#2d7a3a" transform="rotate(-30 30 270)"/>
          <ellipse cx="12" cy="270" rx="2.5" ry="46" fill="#1a5c30" transform="rotate(-30 12 270)"/>
          <ellipse cx="110" cy="330" rx="16" ry="72" fill="#4a9a55" transform="rotate(25 110 330)"/>
          <ellipse cx="88" cy="330" rx="3.5" ry="68" fill="#2d7a3a" transform="rotate(25 88 330)"/>
          <ellipse cx="50" cy="420" rx="13" ry="58" fill="#2d7a3a" transform="rotate(-15 50 420)"/>
          <ellipse cx="32" cy="420" rx="3" ry="54" fill="#1a5c30" transform="rotate(-15 32 420)"/>
          <ellipse cx="120" cy="500" rx="18" ry="78" fill="#3a8a45" transform="rotate(20 120 500)"/>
          <ellipse cx="96" cy="500" rx="4" ry="74" fill="#2d7a3a" transform="rotate(20 96 500)"/>
          <ellipse cx="20" cy="570" rx="10" ry="44" fill="#2d7a3a" transform="rotate(-25 20 570)"/>
        </>
      ) : (
        <>
          <ellipse cx="120" cy="90" rx="13" ry="58" fill="#2d7a3a" transform="rotate(20 120 90)"/>
          <ellipse cx="140" cy="90" rx="3" ry="53" fill="#1a5c30" transform="rotate(20 140 90)"/>
          <ellipse cx="90" cy="170" rx="15" ry="66" fill="#3a8a45" transform="rotate(-18 90 170)"/>
          <ellipse cx="110" cy="170" rx="3.5" ry="62" fill="#1a5c30" transform="rotate(-18 110 170)"/>
          <ellipse cx="150" cy="260" rx="12" ry="52" fill="#2d7a3a" transform="rotate(28 150 260)"/>
          <ellipse cx="166" cy="260" rx="2.5" ry="48" fill="#1a5c30" transform="rotate(28 166 260)"/>
          <ellipse cx="70" cy="340" rx="17" ry="74" fill="#4a9a55" transform="rotate(-22 70 340)"/>
          <ellipse cx="92" cy="340" rx="4" ry="70" fill="#2d7a3a" transform="rotate(-22 92 340)"/>
          <ellipse cx="130" cy="430" rx="14" ry="60" fill="#2d7a3a" transform="rotate(16 130 430)"/>
          <ellipse cx="148" cy="430" rx="3" ry="56" fill="#1a5c30" transform="rotate(16 148 430)"/>
          <ellipse cx="60" cy="505" rx="19" ry="80" fill="#3a8a45" transform="rotate(-20 60 505)"/>
          <ellipse cx="84" cy="505" rx="4.5" ry="76" fill="#2d7a3a" transform="rotate(-20 84 505)"/>
          <ellipse cx="160" cy="572" rx="11" ry="46" fill="#2d7a3a" transform="rotate(24 160 572)"/>
        </>
      )}
    </svg>
  );
};

function getBadgeClass(category) {
  const c = (category || "").toLowerCase();
  if (c.includes("bio"))                              return "db-badge-bio";
  if (c.includes("reuse") || c.includes("recyclable")) return "db-badge-reuse";
  if (c.includes("hazard"))                           return "db-badge-hazard";
  return "db-badge-default";
}

function getActivityIcon(itemType) {
  const t = (itemType || "").toLowerCase();
  if (t.includes("paper") || t.includes("cardboard")) return "📄";
  if (t.includes("plastic") || t.includes("bottle"))  return "🧴";
  if (t.includes("electronic") || t.includes("battery")) return "🖥️";
  if (t.includes("vegetable") || t.includes("food") || t.includes("peel")) return "🥦";
  if (t.includes("glass"))  return "🍶";
  if (t.includes("metal"))  return "🔧";
  if (t.includes("cloth"))  return "👕";
  return "🗑️";
}

const clockIcons = ["🕐","🕒","🕔","🕖","🕗","🕘","🕙","🕚"];

export default function Dashboard({ user, summary, history }) {
  const categoryStats = summary?.categoryStats || {
    biodegradable: { count: 0, co2SavedKg: 0 },
    hazardous:     { count: 0, co2SavedKg: 0 },
    reusable:      { count: 0, co2SavedKg: 0 },
  };
  const dailyStats = Array.isArray(summary?.dailyStats) ? summary.dailyStats : [];

  return (
    <>
      <style>{dashStyles}</style>
      <div className="db-root">

        {/* SVG leaf edges */}
        <LeafSVG side="left" />
        <LeafSVG side="right" />

        <div className="db-content">

          {/* Welcome */}
          <div className="db-welcome">
            <h2>Welcome back, {user?.name || "User"}!</h2>
          </div>

          {/* Stat Cards */}
          <div className="db-stats-grid">

            {/* Card 1 */}
            <div className="db-stat-card">
              <div className="db-stat-label">Total Items Managed</div>
              <div className="db-stat-value">{summary.totalItemsManaged ?? 0}</div>
              <div className="db-stat-bottom-icons">
                <span className="db-stat-arrow">↑</span>
                <span>🗑️</span>
              </div>
              <div className="db-stat-art">
                <span>📄</span><span>🧴</span><span>🍶</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="db-stat-card">
              <div className="db-stat-label">Carbon Emitted Reduced</div>
              <div className="db-stat-value">{Number(summary.totalCarbonSavedKg || 0).toFixed(2)}</div>
              <div className="db-stat-bottom-icons">
                <span>📉</span>
                <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.5)", fontWeight:700, letterSpacing:"1px" }}>kg CO₂e</span>
              </div>
              <div className="db-co2-art">
                <span className="cloud">☁️</span>
                <span className="co2-lbl">CO₂</span>
                <span style={{ fontSize:"1.6rem", marginTop:"2px" }}>🌍</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="db-stat-card">
              <div className="db-stat-label">Total Analyses</div>
              <div className="db-stat-value">{summary.totalAnalyses ?? 0}</div>
              <div className="db-stat-bottom-icons">
                <span>📊</span><span>🔗</span>
              </div>
              <div className="db-stat-art">
                <span>⚙️</span><span>🔬</span>
              </div>
            </div>

          </div>

          {/* Category Dataset */}
          <div className="db-card">
            <h3>Category Dataset</h3>
            <div className="db-cat-grid">

              <div className="db-cat-item bio">
                <span className="db-cat-badge">Biodegradable</span>
                <div className="db-cat-count">{categoryStats.biodegradable.count} items</div>
                <div className="db-cat-co2">{Number(categoryStats.biodegradable.co2SavedKg || 0).toFixed(2)} kg CO₂e saved</div>
                <div className="db-cat-art" style={{ fontSize:"2.2rem" }}>🌱<br/>♻️</div>
              </div>

              <div className="db-cat-item reuse">
                <span className="db-cat-badge">Reusable</span>
                <div className="db-cat-count">{categoryStats.reusable.count} items</div>
                <div className="db-cat-co2">{Number(categoryStats.reusable.co2SavedKg || 0).toFixed(2)} kg CO₂e saved</div>
                <div className="db-cat-art" style={{ fontSize:"2.4rem" }}>☕🛍️</div>
              </div>

              <div className="db-cat-item hazard">
                <span className="db-cat-badge">Hazardous</span>
                <div className="db-cat-count">{categoryStats.hazardous.count} items</div>
                <div className="db-cat-co2">{Number(categoryStats.hazardous.co2SavedKg || 0).toFixed(2)} kg CO₂e saved</div>
                <div className="db-cat-art" style={{ fontSize:"2.6rem" }}>☣️</div>
              </div>

            </div>
          </div>

          {/* Two col */}
          <div className="db-two-col">

            {/* Daily Segregation */}
            <div className="db-card">
              <h3>Daily Segregation Dataset</h3>
              {dailyStats.length === 0 ? (
                <div className="db-empty">
                  <div className="db-empty-art">
                    <span style={{ fontSize:"2rem" }}>☀️</span>
                    <span style={{ fontSize:"3.5rem" }}>🗑️</span>
                    <span style={{ fontSize:"3rem" }}>♻️</span>
                  </div>
                  <span>No daily dataset available yet.</span>
                </div>
              ) : (
                <div className="db-daily-list">
                  {dailyStats.map((row) => (
                    <div key={row.day} className="db-daily-item">
                      <span className="db-daily-icon">📅</span>
                      <div className="db-daily-body">
                        <strong>{row.day}</strong>
                        <p>Total: {row.totalItems} &nbsp;🌱{row.biodegradable} &nbsp;♻️{row.reusable} &nbsp;☣️{row.hazardous}</p>
                        <p>CO₂ saved: {Number(row.totalCo2SavedKg || 0).toFixed(2)} kg CO₂e</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="db-card">
              <h3>Recent Activity</h3>
              {history.length === 0 ? (
                <div className="db-empty">
                  <div className="db-empty-art">
                    <span style={{ fontSize:"3rem" }}>📋</span>
                    <span style={{ fontSize:"2rem" }}>🌿</span>
                  </div>
                  <span>No analysis history yet. Start by analyzing an image!</span>
                </div>
              ) : (
                <div className="db-activity-list">
                  {history.map((item, i) => (
                    <div key={item._id} className="db-activity-item">
                      <span className="db-act-clock">{clockIcons[i % clockIcons.length]}</span>
                      <div className="db-act-body">
                        <strong>{item.itemType}</strong>
                        <p>Carbon saved: {item.carbonSavedKg} kg &nbsp;·&nbsp; {new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="db-act-icon">{getActivityIcon(item.itemType)}</span>
                      <span className={`db-badge ${getBadgeClass(item.category)}`}>{item.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
