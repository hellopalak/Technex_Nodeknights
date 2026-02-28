import React from "react";

export default function Dashboard({ user, summary, history }) {
  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>👋 Welcome back, {user?.name || "User"}!</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Items Managed</h4>
          <div className="stat-value">{summary.totalItemsManaged}</div>
        </div>
        <div className="stat-card">
          <h4>Carbon Emitted Reduced</h4>
          <div className="stat-value">{Number(summary.totalCarbonSavedKg || 0).toFixed(2)}</div>
          <div className="stat-unit">kg CO2e</div>
        </div>
        <div className="stat-card">
          <h4>Total Analyses</h4>
          <div className="stat-value">{summary.totalAnalyses}</div>
        </div>
      </div>

      <div className="card">
        <h3>📊 Recent Activity</h3>
        {history.length === 0 ? (
          <p className="text-muted">No analysis history yet. Start by analyzing an image!</p>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item._id} className="history-item">
                <strong>{item.itemType}</strong>
                <p>
                  📁 {item.category} | 🌱 {item.carbonSavedKg} kg | 📅 {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
