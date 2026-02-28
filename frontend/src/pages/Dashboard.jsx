import React from "react";

export default function Dashboard({ user, summary, history, logout }) {
  return (
    <div className="container">
      <div className="row">
        <h2>{user?.name ? `${user.name} Dashboard` : "Dashboard"}</h2>
        <button type="button" onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <p>Total Items: {summary.totalItemsManaged}</p>
        <p>Total Carbon Saved: {Number(summary.totalCarbonSavedKg || 0).toFixed(2)} kg</p>
        <p>Total Analyses: {summary.totalAnalyses}</p>
      </div>

      <div className="card">
        <h3>History</h3>
        {history.length === 0 && <p>No history yet.</p>}
        {history.map((item) => (
          <div key={item._id} className="history-item">
            <strong>{item.itemType}</strong>
            <p>{item.category} | {item.carbonSavedKg} kg | {new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
