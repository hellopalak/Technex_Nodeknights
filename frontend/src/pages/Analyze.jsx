import React, { useEffect, useRef, useState } from "react";

export default function Analyze({ file, setFile, analyze, loading, latestAnalysis }) {
  const [source, setSource] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    async function attachStreamToVideo() {
      if (!cameraOpen || !videoRef.current || !streamRef.current) return;
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      try {
        await video.play();
        setCameraReady(true);
      } catch {
        // Fallback for browsers that require metadata/canplay before play().
        video.onloadedmetadata = async () => {
          try {
            await video.play();
            setCameraReady(true);
          } catch {
            setCameraError("Camera preview blocked by browser autoplay/policy.");
            setCameraReady(false);
          }
        };
      }
    }

    attachStreamToVideo();
  }, [cameraOpen]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setCameraOpen(false);
  }

  async function openCamera() {
    setCameraError("");
    setCameraReady(false);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera API is not supported in this browser.");
      return;
    }

    if (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      setCameraError("Camera requires HTTPS (or localhost).");
      return;
    }

    const constraintsList = [
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: true, audio: false },
    ];

    try {
      let stream = null;
      for (const constraints of constraintsList) {
        try {
          // eslint-disable-next-line no-await-in-loop
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (stream) break;
        } catch {
          // Try next constraints variant.
        }
      }

      if (!stream) {
        throw new Error("Unable to open camera with available constraints.");
      }

      const hasLiveVideoTrack = stream.getVideoTracks().some((t) => t.readyState === "live");
      if (!hasLiveVideoTrack) {
        throw new Error("Camera opened but no live video track available.");
      }

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      setCameraError(error.message || "Unable to access camera.");
    }
  }

  function captureFromCamera() {
    const video = videoRef.current;
    if (!cameraReady || !video || video.videoWidth <= 0 || video.videoHeight <= 0) {
      setCameraError("Camera is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Failed to capture image.");
          return;
        }
        const capturedFile = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        setFile(capturedFile);
        setSource("camera");
        stopCamera();
      },
      "image/jpeg",
      0.95
    );
  }

  function handleGallerySelect(event) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setSource(selected ? "gallery" : "");
  }  

  return (
    <div className="container">
      <div className="card">
        <h3>Analyze Waste Image</h3>
        <p className="text-muted">Upload from gallery or take a photo from camera, then run analysis.</p>

        <div className="file-input-wrapper">
          <label>Upload Source</label>
          <div className="row">
            <button type="button" className="btn-secondary" onClick={openCamera} disabled={cameraOpen}>
              Open Camera
            </button>
            <label htmlFor="gallery-input" className="btn-secondary" style={{ margin: 0 }}>
              Choose From Gallery
            </label>
          </div>

          <input
            id="gallery-input"
            type="file"
            accept="image/*"
            onChange={handleGallerySelect}
            style={{ display: "none" }}
          />

          {cameraError && <div className="error mt-1">{cameraError}</div>}

          {cameraOpen && (
            <div style={{ marginTop: "12px" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  maxWidth: "520px",
                  minHeight: "240px",
                  borderRadius: "8px",
                  background: "#000",
                  objectFit: "cover",
                }}
              />
              <div className="row mt-1">
                <button type="button" className="btn-primary" onClick={captureFromCamera} disabled={!cameraReady}>
                  Capture Photo
                </button>
                <button type="button" className="btn-secondary" onClick={stopCamera}>
                  Cancel Camera
                </button>
              </div>
            </div>
          )}

          {file && (
            <p className="text-muted" style={{ fontSize: "13px" }}>
              Selected: {file.name} ({source || "unknown"})
            </p>
          )}
        </div>

        <button
          className="btn-primary"
          type="button"
          onClick={analyze}
          disabled={!file || loading}
          style={{ marginTop: "12px" }}
        >
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>

      {latestAnalysis && (
        <div className="card">
          <h3>Analysis Result</h3>

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
            <strong style={{ display: "block", marginBottom: "8px" }}>Recommended Action</strong>
            <p>{latestAnalysis.recommendedAction}</p>
          </div>

          <div style={{ marginTop: "12px" }}>
            <strong style={{ display: "block", marginBottom: "8px" }}>Details</strong>
            <p>{latestAnalysis.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
