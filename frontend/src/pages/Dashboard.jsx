import React from "react";

export default function Dashboard({ user, summary, history }) {
  const categoryStats = summary?.categoryStats || {
    biodegradable: { count: 0, co2SavedKg: 0 },
    hazardous: { count: 0, co2SavedKg: 0 },
    reusable: { count: 0, co2SavedKg: 0 },
  };
  const dailyStats = Array.isArray(summary?.dailyStats) ? summary.dailyStats : [];

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Welcome back, {user?.name || "User"}!</h2>
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
        <h3>Category Dataset</h3>
        <div className="result-grid">
          <div className="result-item">
            <strong>Biodegradable</strong>
            <p>{categoryStats.biodegradable.count} items</p>
            <p>{Number(categoryStats.biodegradable.co2SavedKg || 0).toFixed(2)} kg CO2e saved</p>
          </div>
          <div className="result-item">
            <strong>Reusable</strong>
            <p>{categoryStats.reusable.count} items</p>
            <p>{Number(categoryStats.reusable.co2SavedKg || 0).toFixed(2)} kg CO2e saved</p>
          </div>
          <div className="result-item">
            <strong>Hazardous</strong>
            <p>{categoryStats.hazardous.count} items</p>
            <p>{Number(categoryStats.hazardous.co2SavedKg || 0).toFixed(2)} kg CO2e saved</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Daily Segregation Dataset</h3>
        {dailyStats.length === 0 ? (
          <p className="text-muted">No daily dataset available yet.</p>
        ) : (
          <div className="history-list">
            {dailyStats.map((dayRow) => (
              <div key={dayRow.day} className="history-item">
                <strong>{dayRow.day}</strong>
                <p>
                  Total: {dayRow.totalItems} | Biodegradable: {dayRow.biodegradable} | Reusable: {dayRow.reusable} | Hazardous: {dayRow.hazardous}
                </p>
                <p>CO2 saved: {Number(dayRow.totalCo2SavedKg || 0).toFixed(2)} kg CO2e</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Recent Activity</h3>
        {history.length === 0 ? (
          <p className="text-muted">No analysis history yet. Start by analyzing an image!</p>
        ) : (
          <div className="history-list">
            {history.map((item) => ( 
              <div key={item._id} className="history-item">
                <strong>{item.itemType}</strong>
                <p>
                  Category: {item.category} | Carbon saved: {item.carbonSavedKg} kg | Day: {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
