import React from "react";

export default function Analyze({ file, setFile, analyze, loading, latestAnalysis }) {
  return (
    <div className="container">
      <div className="card">
        <h3>🔍 Analyze Waste Image</h3>
        <p className="text-muted">Upload an image to analyze the waste item and get recommendations</p>
        
        <div className="file-input-wrapper">
          <label htmlFor="image-input">Select Image</label>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && <p className="text-muted" style={{ fontSize: "13px" }}>Selected: {file.name}</p>}
        </div>

        <button
          className="btn-primary"
          type="button"
          onClick={analyze}
          disabled={!file || loading}
          style={{ marginTop: "12px" }}
        >
          {loading ? "🔄 Analyzing..." : "✨ Analyze Image"}
        </button>
      </div>

      {latestAnalysis && (
        <div className="card">
          <h3>📈 Analysis Result</h3>
          
          <div className="result-grid">
            <div className="result-item">
              <strong>Item Type</strong>
              <p>{latestAnalysis.itemType}</p>
            </div>
            <div className="result-item">
              <strong>Category</strong>
              <p>{latestAnalysis.category}</p>
            </div>
            <div className="result-item">
              <strong>Confidence</strong>
              <p>{(Number(latestAnalysis.confidence || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="result-item">
              <strong>Carbon Reduced</strong>
              <p>{latestAnalysis.carbonSavedKg} kg CO2e</p>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <strong style={{ display: "block", marginBottom: "8px" }}>💡 Recommended Action</strong>
            <p>{latestAnalysis.recommendedAction}</p>
          </div>

          <div style={{ marginTop: "12px" }}>
            <strong style={{ display: "block", marginBottom: "8px" }}>📝 Details</strong>
            <p>{latestAnalysis.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
