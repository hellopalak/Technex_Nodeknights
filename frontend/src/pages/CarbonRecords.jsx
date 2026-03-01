import React from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&family=Rajdhani:wght@500;700&display=swap');

  .container {
    font-family: 'Exo 2', sans-serif;
    background-color: #eef4ea;
    min-height: 100vh;
    padding: 40px 28px;
    position: relative;
    overflow: hidden;
  }

  .container::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 55% 50% at 3% 18%, rgba(160,210,140,0.38) 0%, transparent 65%),
      radial-gradient(ellipse 50% 55% at 97% 8%, rgba(150,200,130,0.30) 0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 82% 94%, rgba(160,205,140,0.26) 0%, transparent 65%),
      radial-gradient(ellipse 45% 45% at 8% 90%, rgba(148,200,128,0.24) 0%, transparent 65%);
  }

  .leaf-decor {
    position: fixed;
    pointer-events: none;
    z-index: 0;
    opacity: 0.22;
  }

  /* CARD */
  .card {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(6px);
    border-radius: 16px;
    padding: 28px 32px 32px;
    max-width: 920px;
    margin: 0 auto 20px;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 24px rgba(40,80,40,0.08);
    overflow: hidden;
  }

  .card h3 {
    font-size: 30px;
    font-weight: 700;
    color: #1a3a2a;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* WOODEN BANNER */
  .carbon-banner {
    background: linear-gradient(90deg, #7a4e2d 0%, #a0633a 30%, #8b5230 60%, #6b3f22 100%);
    border-radius: 15px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.18), 0 3px 8px rgba(80,40,10,0.18);
    position: relative;
    overflow: hidden;
  }
  /* Wood grain lines */
  .carbon-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      92deg,
      transparent,
      transparent 18px,
      rgba(255,255,255,0.04) 18px,
      rgba(255,255,255,0.04) 19px
    );
    border-radius: 10px;
  }
  .carbon-banner-left {
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 1;
  }
  .carbon-banner-globe {
    font-size: 28px;
    line-height: 1;
  }
  .carbon-banner-text {
    font-size: 21px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    letter-spacing: 0.01em;
  }
  .carbon-banner-badge {
    background: rgba(255,255,255,0.15);
    border: 1.5px solid rgba(255,255,255,0.3);
    border-radius: 8px;
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    font-size: 15px;
    color: #fff;
    font-weight: 700;
    line-height: 1.2;
  }

  /* HISTORY LIST */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid #e4ede4;
  }
  .history-item:last-child {
    border-bottom: none;
  }

  .history-item-left {
    flex: 1;
    min-width: 0;
  }

  .history-item-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 21px;
    font-weight: 700;
    color: #2a6338;
    margin-bottom: 4px;
  }

  .history-item-meta {
    font-size: 15px;
    color: #6a8a6a;
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .history-item-meta span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .meta-sep {
    color: #aac4aa;
    margin: 0 2px;
  }

  /* THUMBNAIL BUBBLE */
  .history-item-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-left: 16px;
    flex-shrink: 0;
  }
  .item-bubble {
    width: 52px;
    height: 52px;
    background: #fff;
    border-radius: 50%;
    border: 1.5px solid #d4e8d0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    box-shadow: 0 2px 6px rgba(40,80,40,0.10);
  }
  .item-bin {
    font-size: 18px;
    opacity: 0.7;
  }

  /* EMPTY STATE */
  .text-muted {
    font-size: 14px;
    color: #7a9a7a;
  }

  /* FOREST ILLUSTRATION (bottom-right of card) */
  .forest-illustration {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 120px;
    pointer-events: none;
    opacity: 0.92;
  }
`;

const LeafDecor = () => (
  <>
    <svg className="leaf-decor" style={{ left: '-30px', top: '40px', width: '180px', transform: 'rotate(-25deg)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
      <path d="M60 155 C48 135 35 112 44 90" stroke="#357a35" strokeWidth="1.2" fill="none"/>
      <path d="M60 120 C72 104 82 88 76 68" stroke="#357a35" strokeWidth="1.2" fill="none"/>
    </svg>
    <svg className="leaf-decor" style={{ left: '10px', top: '180px', width: '110px', transform: 'rotate(20deg)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
      <path d="M60 155 C48 135 35 112 44 90" stroke="#357a35" strokeWidth="1.2" fill="none"/>
    </svg>
    <svg className="leaf-decor" style={{ left: '-10px', bottom: '60px', width: '150px', transform: 'rotate(-55deg)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
      <path d="M60 120 C72 104 82 88 76 68" stroke="#357a35" strokeWidth="1.2" fill="none"/>
    </svg>
    <svg className="leaf-decor" style={{ right: '-30px', top: '30px', width: '175px', transform: 'rotate(20deg) scaleX(-1)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
      <path d="M60 155 C48 135 35 112 44 90" stroke="#357a35" strokeWidth="1.2" fill="none"/>
      <path d="M60 120 C72 104 82 88 76 68" stroke="#357a35" strokeWidth="1.2" fill="none"/>
    </svg>
    <svg className="leaf-decor" style={{ right: '40px', top: '130px', width: '95px', transform: 'rotate(-25deg) scaleX(-1)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
    </svg>
    <svg className="leaf-decor" style={{ right: '-15px', bottom: '40px', width: '160px', transform: 'rotate(45deg) scaleX(-1)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
      <path d="M60 155 C48 135 35 112 44 90" stroke="#357a35" strokeWidth="1.2" fill="none"/>
      <path d="M60 120 C72 104 82 88 76 68" stroke="#357a35" strokeWidth="1.2" fill="none"/>
    </svg>
    <svg className="leaf-decor" style={{ right: '140px', bottom: '70px', width: '85px', transform: 'rotate(-15deg) scaleX(-1)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
    </svg>
  </>
);

// Forest + river scene illustration matching bottom-right of screenshot
const ForestIllustration = () => (
  <svg viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ground */}
    <ellipse cx="65" cy="100" rx="60" ry="10" fill="#c8e6b0" opacity="0.6"/>
    {/* River */}
    <path d="M30 105 Q50 88 65 92 Q80 96 100 80" stroke="#7ac8e0" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M32 107 Q52 90 67 94 Q82 98 102 82" stroke="#a8ddf0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    {/* Back trees */}
    <polygon points="55,30 45,70 65,70" fill="#3a7a3a" opacity="0.5"/>
    <polygon points="75,22 63,68 87,68" fill="#2d6b2d" opacity="0.55"/>
    <polygon points="40,38 32,72 48,72" fill="#4a8a3a" opacity="0.45"/>
    {/* Front trees */}
    <polygon points="25,40 14,80 36,80" fill="#3d7a2a"/>
    <polygon points="45,28 32,78 58,78" fill="#2d6b1a"/>
    <polygon points="68,24 54,80 82,80" fill="#3a7a22"/>
    <polygon points="90,35 78,78 102,78" fill="#4a8a30"/>
    <polygon points="108,42 98,80 118,80" fill="#3d7a2a"/>
    {/* Tree trunks */}
    {[[25,80],[45,78],[68,80],[90,78],[108,80]].map(([x,y],i) => (
      <rect key={i} x={x-2} y={y} width="4" height="12" rx="1" fill="#7a5020" opacity="0.8"/>
    ))}
    {/* Highlights on trees */}
    <polygon points="45,28 38,55 52,55" fill="#4a9022" opacity="0.3"/>
    <polygon points="68,24 62,50 74,50" fill="#4a9022" opacity="0.3"/>
  </svg>
);

// Maps category/itemType to an emoji for the bubble
function getItemEmoji(item) {
  const type = (item.itemType || item.category || "").toLowerCase();
  if (type.includes("banana") || type.includes("fruit") || type.includes("biodegradable") || type.includes("food")) {
    return ["🍌","🍎","🥦","🍊","🥕"][Math.abs(item._id?.charCodeAt(0) || 0) % 5];
  }
  if (type.includes("plastic") || type.includes("bottle")) return "🍶";
  if (type.includes("can") || type.includes("metal") || type.includes("recyclable") || type.includes("reusable")) return "🥫";
  if (type.includes("paper") || type.includes("cardboard")) return "📦";
  if (type.includes("glass")) return "🍾";
  if (type.includes("electronic") || type.includes("e-waste")) return "📱";
  return "♻️";
}

export default function CarbonRecords({ history }) {
  const totalCarbonSaved = history.reduce((sum, item) => sum + (Number(item.carbonSavedKg) || 0), 0);

  return (
    <div className="container">
      <style>{styles}</style>
      <LeafDecor />

      <div className="card">
        <h3>🌱 Carbon Records</h3>

        {history.length > 0 && (
          <div className="carbon-banner">
            <div className="carbon-banner-left">
              <span className="carbon-banner-globe">🌍</span>
              <span className="carbon-banner-text">
                Total Carbon Reduced: {totalCarbonSaved.toFixed(2)} kg CO2e
              </span>
            </div>
            <div className="carbon-banner-badge">
              <span>CO₂</span>
              <span>↓</span>
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <p className="text-muted">No carbon records yet. Analyze items to start tracking your environmental impact!</p>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item._id} className="history-item">
                <div className="history-item-left">
                  <div className="history-item-title">
                    ♻️ {item.itemType}
                  </div>
                  <div className="history-item-meta">
                    <span>📁 Category: {item.category}</span>
                    <span className="meta-sep">|</span>
                    <span>🌍 Saved: {item.carbonSavedKg} kg CO2e</span>
                    <span className="meta-sep">|</span>
                    <span>📅 {new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="history-item-right">
                  <div className="item-bubble">{getItemEmoji(item)}</div>
                  <span className="item-bin">🗑️</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Forest illustration */}
        <div className="forest-illustration">
          <ForestIllustration />
        </div>
      </div>
    </div>
  );
}
