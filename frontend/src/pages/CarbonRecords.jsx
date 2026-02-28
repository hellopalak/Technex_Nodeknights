import React from "react";

export default function CarbonRecords({ history }) {
  return (
    <div className="container">
      <div className="card">
        <h3>Carbon Records</h3>
        {history.length === 0 && <p>No records yet.</p>}
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
