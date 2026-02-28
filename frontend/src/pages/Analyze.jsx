import React from "react";

export default function Analyze({ file, setFile, analyze, loading, latestAnalysis }) {
  return (
    <div className="container">
      <div className="card">
        <h3>Analyze Image</h3>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="button" onClick={analyze} disabled={!file || loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {latestAnalysis && (
        <div className="card">
          <h3>Latest Result</h3>
          <p>Item: {latestAnalysis.itemType}</p>
          <p>Category: {latestAnalysis.category}</p>
          <p>Confidence: {(Number(latestAnalysis.confidence || 0) * 100).toFixed(1)}%</p>
          <p>Best Action: {latestAnalysis.recommendedAction}</p>
          <p>Carbon Saved: {latestAnalysis.carbonSavedKg} kg CO2e</p>
          <p>Reason: {latestAnalysis.reason}</p>
        </div>
      )}
    </div>
  );
}
