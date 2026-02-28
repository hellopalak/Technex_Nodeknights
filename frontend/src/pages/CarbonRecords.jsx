import React from "react";

export default function CarbonRecords({ history }) {
  const totalCarbonSaved = history.reduce((sum, item) => sum + (Number(item.carbonSavedKg) || 0), 0);

  return (
    <div className="container">
      <div className="card">
        <h3>🌱 Carbon Records</h3>
        
        {history.length > 0 && (
          <div style={{ 
            background: "#e8f5e9", 
            padding: "12px", 
            borderRadius: "6px", 
            marginBottom: "16px",
            textAlign: "center"
          }}>
            <strong style={{ color: "#2d7a4f" }}>
              Total Carbon Reduced: {totalCarbonSaved.toFixed(2)} kg CO2e
            </strong>
          </div>
        )}

        {history.length === 0 ? (
          <p className="text-muted">No carbon records yet. Analyze items to start tracking your environmental impact!</p>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item._id} className="history-item">
                <strong>♻️ {item.itemType}</strong>
                <p>
                  📁 Category: {item.category} | 🌍 Saved: {item.carbonSavedKg} kg CO2e | 📅 {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
