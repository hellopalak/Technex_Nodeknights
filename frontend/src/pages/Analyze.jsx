import React, { useEffect, useRef, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&family=Rajdhani:wght@500;700&display=swap');

  .container {
    font-family: 'Exo 2', sans-serif;
    background-color: #eef4ea;
    min-height: 100vh;
    padding: 40px 24px;
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

  /* Leaf decorations */
  .leaf-decor {
    position: fixed;
    pointer-events: none;
    z-index: 0;
    opacity: 0.22;
  }

  .card {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(6px);
    border-radius: 16px;
    padding: 36px 40px 64px;
    max-width: 760px;
    margin: 0 auto 20px;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 24px rgba(40,80,40,0.08);
    overflow: hidden;
  }

  .card h3 {
    font-size: 22px;
    font-weight: 700;
    color: #1a3a2a;
    margin-bottom: 6px;
  }

  .text-muted {
    font-size: 18px;
    color: #7a9a7a;
    margin-bottom: 28px;
  }

  .file-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .file-input-wrapper label {
    font-size: 16px;
    font-weight: 600;
    color: #f5f5f5ed;
    margin-bottom: 12px;
    display: block;
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 0;
  }

  .btn-primary, .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Exo 2', sans-serif;
    font-size: 17px;
    font-weight: 700;
    border-radius: 8px;
    padding: 11px 22px;
    cursor: pointer;
    border: none;
    min-width: 210px;
    transition: filter 0.15s, transform 0.1s;
    color: #fff;
    background: linear-gradient(135deg, #3d8b4e, #2a6338);
    box-shadow: 0 3px 10px rgba(40,100,55,0.22);
  }

  .btn-primary:hover:not(:disabled),
  .btn-secondary:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .btn-primary:active:not(:disabled),
  .btn-secondary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled,
  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .mt-1 { margin-top: 12px; }

  .error {
    color: #c0392b;
    font-size: 13px;
    margin-top: 8px;
  }

  /* Illustrated bin in bottom-right of card */
  .card-illustration {
    position: absolute;
    bottom: 8px;
    right: 16px;
    width: 105px;
    pointer-events: none;
  }

  /* Results card */
  .result-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .result-item {
    background: #f2f8ee;
    border-radius: 10px;
    padding: 14px 16px;
  }

  .result-item strong {
    display: block;
    font-size: 11px;
    color: #7a9a7a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 4px;
  }

  .result-item p {
    font-size: 15px;
    font-weight: 700;
    color: #1a3a2a;
    margin: 0;
  }
`;

const LeafDecor = () => (
  <>
    {/* Left side leaves */}
    <svg className="leaf-decor" style={{ left: '-30px', top: '40px', width: '180px', transform: 'rotate(-25deg)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
      <path d="M60 155 C48 135 35 112 44 90" stroke="#357a35" strokeWidth="1.2" fill="none"/>
      <path d="M60 120 C72 104 82 88 76 68" stroke="#357a35" strokeWidth="1.2" fill="none"/>
    </svg>
    <svg className="leaf-decor" style={{ left: '10px', top: '160px', width: '110px', transform: 'rotate(20deg)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
      <path d="M60 155 C48 135 35 112 44 90" stroke="#357a35" strokeWidth="1.2" fill="none"/>
    </svg>
    <svg className="leaf-decor" style={{ left: '-10px', bottom: '60px', width: '150px', transform: 'rotate(-55deg)' }} viewBox="0 0 120 200" fill="none">
      <path d="M60 190 C60 190 10 130 20 70 C30 10 90 5 100 60 C110 115 60 190 60 190Z" fill="#4a8a4a"/>
      <path d="M60 190 C62 140 68 90 78 55" stroke="#357a35" strokeWidth="2" fill="none"/>
      <path d="M60 120 C72 104 82 88 76 68" stroke="#357a35" strokeWidth="1.2" fill="none"/>
    </svg>
    {/* Right side leaves */}
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

const BinIllustration = () => (
  <svg viewBox="0 0 140 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="70" cy="118" rx="52" ry="7" fill="#c8e6b0" opacity="0.7"/>
    <rect x="30" y="60" width="80" height="55" rx="6" fill="#d4b896"/>
    <rect x="30" y="60" width="80" height="55" rx="6" stroke="#b8956e" strokeWidth="1.5"/>
    <rect x="24" y="52" width="92" height="12" rx="5" fill="#c4a882" stroke="#b8956e" strokeWidth="1.5"/>
    <circle cx="70" cy="87" r="16" fill="#5a9a5a" opacity="0.9"/>
    <text x="70" y="93" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">♻</text>
    <rect x="88" y="30" width="28" height="18" rx="3" fill="#6ab0d4" stroke="#4a90b4" strokeWidth="1.2"/>
    {[94,100,106].map(x => <line key={x} x1={x} y1="30" x2={x} y2="48" stroke="#4a90b4" strokeWidth="0.8"/>)}
    {[36,42].map(y => <line key={y} x1="88" y1={y} x2="116" y2={y} stroke="#4a90b4" strokeWidth="0.8"/>)}
    <line x1="102" y1="48" x2="102" y2="58" stroke="#888" strokeWidth="1.5"/>
    <circle cx="30" cy="22" r="10" fill="#f9d44a" opacity="0.9"/>
    {[0,45,90,135,180,225,270,315].map((a, i) => (
      <line key={i}
        x1={30 + Math.cos(a*Math.PI/180)*13} y1={22 + Math.sin(a*Math.PI/180)*13}
        x2={30 + Math.cos(a*Math.PI/180)*16} y2={22 + Math.sin(a*Math.PI/180)*16}
        stroke="#f9d44a" strokeWidth="1.5" strokeLinecap="round"/>
    ))}
    <path d="M50 18 Q53 14 56 18" stroke="#555" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M60 14 Q63 10 66 14" stroke="#555" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M40 118 Q42 112 44 118" stroke="#6aaa40" strokeWidth="1.5" fill="none"/>
    <path d="M95 116 Q97 110 99 116" stroke="#6aaa40" strokeWidth="1.5" fill="none"/>
  </svg>
);

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
      <style>{styles}</style>
      <LeafDecor />

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

        {/* Illustrated bin */}
        <div className="card-illustration">
          <BinIllustration />
        </div>
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
