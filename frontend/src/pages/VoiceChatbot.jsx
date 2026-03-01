import { useEffect, useMemo, useRef, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const SILENCE_TIMEOUT_MS = 5000;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&family=Rajdhani:wght@500;700&display=swap');

  .container {
    font-family: 'Exo 2', sans-serif;
    background-color: #eef4ea;
    min-height: 100vh;
    padding: 32px 24px 60px;
    position: relative;
    overflow: hidden;
  }

  /* ── background watercolour glow ── */
  .container::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 55% 50% at 3% 18%, rgba(160,210,140,0.38) 0%, transparent 65%),
      radial-gradient(ellipse 50% 55% at 97% 8%,  rgba(150,200,130,0.30) 0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 82% 94%, rgba(160,205,140,0.26) 0%, transparent 65%),
      radial-gradient(ellipse 45% 45% at 8%  90%, rgba(148,200,128,0.24) 0%, transparent 65%);
  }

  /* ── leaf decorations ── */
  .leaf-decor {
    position: fixed;
    pointer-events: none;
    z-index: 0;
    opacity: 0.22;
  }

  /* ── corner icons ── */
  .corner-icon {
    position: fixed;
    pointer-events: none;
    z-index: 2;
    opacity: 0.85;
    font-size: 30px;
  }

  /* ── shared card base ── */
  .card {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(6px);
    border-radius: 14px;
    padding: 24px 28px;
    max-width: 920px;
    margin: 0 auto 18px;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 20px rgba(40,80,40,0.09);
    overflow: hidden;
  }

  .card h3 {
    font-size: 30px;
    font-weight: 800;
    color: #1a3a2a;
    margin: 0 0 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .card h4 {
    font-size: 24px;
    font-weight: 800;
    color: #1a3a2a;
    margin: 0 0 6px;
  }

  .text-muted {
    font-size: 14.5px;
    color: #6a8a6a;
    margin: 0 0 14px;
    line-height: 1.5;
  }

  /* ── form elements (wooden style) ── */
  .form-group {
    margin-bottom: 14px;
  }
  .form-group label {
    font-size: 18px;
    font-weight: 700;
    color: #3a5a3a;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 5px;
  }
  .form-group input,
  .form-group select {
    width: 100%;
    font-family: 'Exo 2', sans-serif;
    font-size: 16.5px;
    font-weight: 600;
    color: #3a3a2a;
    border: none;
    border-radius: 8px;
    padding: 10px 14px;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    /* wood texture */
    background:
      repeating-linear-gradient(
        92deg,
        transparent, transparent 20px,
        rgba(120,70,20,0.04) 20px, rgba(120,70,20,0.04) 21px
      ),
      linear-gradient(180deg, #d4b896 0%, #c8a87a 40%, #b8986a 100%);
    box-shadow: inset 0 1px 4px rgba(80,40,10,0.18), 0 2px 6px rgba(80,40,10,0.10);
  }
  .form-group select {
    background-image:
      repeating-linear-gradient(
        92deg,
        transparent, transparent 20px,
        rgba(120,70,20,0.04) 20px, rgba(120,70,20,0.04) 21px
      ),
      linear-gradient(180deg, #c8b8a0 0%, #b8a888 100%);
    cursor: pointer;
  }

  /* ── mode toggle ── */
  .mode-toggle {
    display: flex;
    gap: 8px;
  }
  .mode-btn {
    font-family: 'Exo 2', sans-serif;
    font-size: 16px;
    font-weight: 700;
    border: none;
    border-radius: 20px;
    padding: 7px 20px;
    cursor: pointer;
    transition: all 0.15s;
    background: #d4e8cc;
    color: #2a5a2a;
  }
  .mode-btn.active {
    background: linear-gradient(135deg, #3d8b4e, #2a6338);
    color: #fff;
    box-shadow: 0 3px 8px rgba(40,100,55,0.25);
  }
  .mode-btn:hover:not(.active) {
    background: #bcd8b0;
  }

  /* ── VOICE DISCUSSION card (forest background) ── */
  .card.voice-card {
    background:
      linear-gradient(rgba(10,30,10,0.55), rgba(10,30,10,0.55)),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'%3E%3Crect width='800' height='200' fill='%23143a14'/%3E%3Cellipse cx='80' cy='200' rx='55' ry='80' fill='%23194a19'/%3E%3Cellipse cx='160' cy='200' rx='45' ry='95' fill='%23205220'/%3E%3Cellipse cx='240' cy='200' rx='60' ry='85' fill='%231a4a1a'/%3E%3Cellipse cx='340' cy='200' rx='50' ry='90' fill='%23246024'/%3E%3Cellipse cx='430' cy='200' rx='55' ry='80' fill='%231e521e'/%3E%3Cellipse cx='520' cy='200' rx='48' ry='88' fill='%23205820'/%3E%3Cellipse cx='610' cy='200' rx='52' ry='82' fill='%231a4c1a'/%3E%3Cellipse cx='700' cy='200' rx='58' ry='78' fill='%23226022'/%3E%3Cellipse cx='780' cy='200' rx='44' ry='90' fill='%231e541e'/%3E%3C/svg%3E")
      center bottom / cover no-repeat;
    color: #e8f4e0;
    padding-bottom: 32px;
  }
  .card.voice-card h4 { color: #e8f4e0; }
  .card.voice-card .text-muted { color: #b0d0a0; }

  /* recycling badge top-right of voice card */
  .voice-card-badge {
    position: absolute;
    top: 14px;
    right: 18px;
    font-size: 26px;
    opacity: 0.9;
  }

  /* ── voice control buttons ── */
  .voice-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 14px;
  }
  .voice-btn {
    font-family: 'Exo 2', sans-serif;
    font-size: 17px;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    padding: 9px 18px;
    cursor: pointer;
    transition: filter 0.15s, transform 0.1s;
    background: #d4e0cc;
    color: #2a4a2a;
    box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  }
  .voice-btn:first-child {
    background: linear-gradient(135deg, #3d8b4e, #2a6338);
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 3px 10px rgba(40,100,55,0.30);
  }
  .voice-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  .voice-btn:active:not(:disabled) { transform: translateY(0); }
  .voice-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; filter: none; }

  /* ── status bar (wooden) ── */
  .voice-status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 8px;
    padding: 9px 14px;
    background:
      repeating-linear-gradient(
        92deg,
        transparent, transparent 20px,
        rgba(120,70,20,0.05) 20px, rgba(120,70,20,0.05) 21px
      ),
      linear-gradient(180deg, #d4b896 0%, #c0a070 100%);
    box-shadow: inset 0 1px 4px rgba(80,40,10,0.15);
  }
  .voice-status-text { font-size: 13px; color: #5a3a10; font-weight: 600; }
  .status-badge {
    font-size: 17px;
    font-weight: 700;
    border-radius: 20px;
    padding: 3px 10px;
    color: #fff;
  }
  .status-listening { background: #e05050; animation: pulse 1s infinite; }
  .status-speaking  { background: #3d8b4e; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

  /* ── CONVERSATION HISTORY card ── */
  .card.chat-card {
    background: rgba(232,245,225,0.95);
  }
  .card.chat-card h4 { color: #1a3a2a; }
  .chat-card-badge {
    position: absolute;
    top: 14px;
    right: 18px;
    font-size: 22px;
    opacity: 0.85;
  }
  .chat-empty {
    text-align: center;
    padding: 24px 0 8px;
    font-size: 17px;
    font-weight: 700;
    color: #3a7a3a;
    font-style: italic;
  }

  /* ── chat bubbles ── */
  .chat-display {
    max-height: 320px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-right: 4px;
  }
  .chat-message {
    display: flex;
  }
  .chat-message.user     { justify-content: flex-end; }
  .chat-message.assistant{ justify-content: flex-start; }
  .chat-bubble {
    max-width: 75%;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 17px;
    line-height: 1.5;
    color: #1a3a1a;
  }
  .chat-message.user .chat-bubble {
    background: linear-gradient(135deg, #3d8b4e, #2a6338);
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .chat-message.assistant .chat-bubble {
    background: #fff;
    border: 1.5px solid #c8e0c0;
    border-bottom-left-radius: 4px;
  }

  /* ── text input card ── */
  .chat-input-area {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .chat-input-area input {
    flex: 1;
    font-family: 'Exo 2', sans-serif;
    font-size: 18px;
    border: 1.5px solid #c0d8b8;
    border-radius: 8px;
    padding: 10px 14px;
    outline: none;
    background: #f4faf0;
    color: #1a3a1a;
  }
  .chat-input-area input:focus { border-color: #3d8b4e; }
  .chat-input-area button {
    font-family: 'Exo 2', sans-serif;
    font-size: 17px;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    padding: 10px 18px;
    cursor: pointer;
    background: linear-gradient(135deg, #3d8b4e, #2a6338);
    color: #fff;
    box-shadow: 0 2px 8px rgba(40,100,55,0.2);
    transition: filter 0.15s;
  }
  .chat-input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
  .chat-input-area button:hover:not(:disabled) { filter: brightness(1.08); }
  .chat-mic-btn {
    background: #d4e8cc !important;
    color: #2a5a2a !important;
    box-shadow: none !important;
  }

  .error {
    color: #c0392b;
    font-size: 13px;
    font-weight: 600;
  }

  /* ── forest illustration (bottom-left corner) ── */
  .corner-forest {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 130px;
    pointer-events: none;
    z-index: 2;
    opacity: 0.9;
  }
  .corner-globe {
    position: fixed;
    bottom: 8px;
    right: 12px;
    font-size: 48px;
    pointer-events: none;
    z-index: 2;
    opacity: 0.8;
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
    </svg>
  </>
);

const ForestCorner = () => (
  <svg className="corner-forest" viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="65" cy="100" rx="60" ry="10" fill="#c8e6b0" opacity="0.6"/>
    <path d="M30 105 Q50 88 65 92 Q80 96 100 80" stroke="#7ac8e0" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7"/>
    <polygon points="25,40 14,80 36,80" fill="#3d7a2a"/>
    <polygon points="45,28 32,78 58,78" fill="#2d6b1a"/>
    <polygon points="68,24 54,80 82,80" fill="#3a7a22"/>
    <polygon points="90,35 78,78 102,78" fill="#4a8a30"/>
    <polygon points="108,42 98,80 118,80" fill="#3d7a2a"/>
    {[[25,80],[45,78],[68,80],[90,78],[108,80]].map(([x,y],i)=>(
      <rect key={i} x={x-2} y={y} width="4" height="12" rx="1" fill="#7a5020" opacity="0.8"/>
    ))}
    {/* windmill */}
    <line x1="12" y1="50" x2="12" y2="80" stroke="#aaa" strokeWidth="1.5"/>
    <polygon points="12,50 8,38 16,38" fill="#ccc" opacity="0.8"/>
    <polygon points="12,50 4,54 4,46" fill="#ccc" opacity="0.8"/>
    <polygon points="12,50 20,54 20,46" fill="#ccc" opacity="0.8"/>
    {/* solar panel */}
    <rect x="2" y="72" width="16" height="9" rx="2" fill="#6ab0d4" stroke="#4a90b4" strokeWidth="0.8"/>
    <line x1="10" y1="72" x2="10" y2="81" stroke="#4a90b4" strokeWidth="0.5"/>
    <line x1="2" y1="76" x2="18" y2="76" stroke="#4a90b4" strokeWidth="0.5"/>
  </svg>
);

export default function VoiceChatbot({ token }) {
  const [sessionId, setSessionId] = useState("eco-default");
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [voiceBotEnabled, setVoiceBotEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isManualListening, setIsManualListening] = useState(false);
  const [lastReply, setLastReply] = useState("");
  const [inputMode, setInputMode] = useState("voice");
  const [language, setLanguage] = useState("auto");

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const silenceTriggeredRef = useRef(false);
  const awaitingReplyRef = useRef(false);
  const chatBottomRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = Boolean(SpeechRecognition && window.speechSynthesis);
  const voiceBotBusy = loading || awaitingReplyRef.current || isSpeaking;
  const canStartVoiceBot = speechSupported && !voiceBotEnabled && !isListening && !isManualListening;
  const canStopVoiceBot = voiceBotEnabled || isListening || isSpeaking || isManualListening;

  const statusText = useMemo(() => {
    if (!speechSupported) return "Voice is not supported in this browser.";
    if (isListening) return "Listening...";
    if (isManualListening) return "Listening once for mic input...";
    if (isSpeaking) return "Speaking...";
    if (loading) return "ECO is typing...";
    if (voiceBotEnabled) {
      const langLabel = language === "auto" ? "auto" : language === "hi" ? "Hindi" : "English";
      return `Voice mode active (${langLabel}).`;
    }
    return "Idle";
  }, [isListening, isManualListening, isSpeaking, loading, speechSupported, voiceBotEnabled, language]);

  useEffect(() => {
    return () => {
      stopVoiceBot();
    };
  }, [sessionId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  function setSilenceTimeout(recognition) {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      silenceTriggeredRef.current = true;
      recognition.stop();
    }, SILENCE_TIMEOUT_MS);
  }

  function detectSpeechLang(text) {
    return /[\u0900-\u097F]/.test(String(text || "")) ? "hi-IN" : "en-US";
  }

  function speakText(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (language === "en") utterance.lang = "en-US";
    else if (language === "hi") utterance.lang = "hi-IN";
    else utterance.lang = detectSpeechLang(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (voiceBotEnabled && !isListening && !awaitingReplyRef.current) {
        startListening();
      }
    };
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  const stopSpeaking = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  async function sendMessage(rawText) {
    const message = rawText.trim();
    if (!message || !token) return;

    awaitingReplyRef.current = true;
    setLoading(true);
    setError("");
    setChat((prev) => [...prev, { role: "user", text: message }]);

    try {
      const response = await fetch(`${API_BASE}/voice/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, sessionId, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get ECO response.");

      const reply = String(data.reply || "").trim();
      setLastReply(reply);
      setChat((prev) => [...prev, { role: "assistant", text: reply }]);
      if (reply) {
        speakText(reply);
      }
    } catch (e) {
      setError(e.message || "Failed to get ECO response.");
    } finally {
      awaitingReplyRef.current = false;
      setLoading(false);
    }
  }

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    silenceTriggeredRef.current = false;
    setIsListening(false);
    setIsManualListening(false);
    recognitionRef.current = null;
  }, []);

  const stopVoiceBot = useCallback(() => {
    setVoiceBotEnabled(false);
    stopListening();
    stopSpeaking();
  }, [stopListening]);

  function startListening({ singleUse = false, ignoreVoiceEnabled = false } = {}) {
    if (!speechSupported || loading || awaitingReplyRef.current || isListening || isManualListening) return;
    if (!singleUse && !voiceBotEnabled && !ignoreVoiceEnabled) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    if (language === "hi") recognition.lang = "hi-IN";
    else if (language === "en") recognition.lang = "en-US";

    silenceTriggeredRef.current = false;

    recognition.onstart = () => {
      if (singleUse) {
        setIsManualListening(true);
      } else {
        setIsListening(true);
      }
      setSilenceTimeout(recognition);
    };

    recognition.onspeechstart = () => {
      setSilenceTimeout(recognition);
    };

    recognition.onresult = (event) => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        recognition.stop();
        if (singleUse) {
          setMessageInput(transcript.trim());
        } else {
          sendMessage(transcript);
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setIsManualListening(false);
    };

    recognition.onend = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsListening(false);
      setIsManualListening(false);
      if (!singleUse && silenceTriggeredRef.current) {
        if (voiceBotEnabled) {
          startListening();
        }
      }
      silenceTriggeredRef.current = false;
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  const switchMode = useCallback((nextMode) => {
    setInputMode(nextMode);
    if (nextMode === "text") {
      stopVoiceBot();
    }
  }, []);

  const startVoiceChatbot = useCallback(() => {
    if (!speechSupported) return;
    setInputMode("voice");
    setVoiceBotEnabled(true);
    startListening({ ignoreVoiceEnabled: true });
  }, [speechSupported]);

  const captureVoiceInput = useCallback(() => {
    startListening({ singleUse: true });
  }, []);

  const handleTextSubmit = useCallback(async (event) => {
    event.preventDefault();
    const message = messageInput.trim();
    if (!message) return;
    setMessageInput("");
    await sendMessage(message);
  }, [messageInput]);

  return (
    <div className="container">
      <style>{styles}</style>
      <LeafDecor />
      <ForestCorner />
      <div className="corner-globe">🌍</div>

      {/* ── Settings card ── */}
      <div className="card">
        <h3>ECO Voice Chatbot 🌿</h3>
        <p className="text-muted">Chat with your AI environmental assistant. ECO automatically uses your waste history as context.</p>

        <div className="form-group">
          <label>Interaction Mode 🌿</label>
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${inputMode === "voice" ? "active" : ""}`}
              onClick={() => switchMode("voice")}
            >
              Voice
            </button>
            <button
              type="button"
              className={`mode-btn ${inputMode === "text" ? "active" : ""}`}
              onClick={() => switchMode("text")}
            >
              Write
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="session-id">Session ID</label>
          <input
            id="session-id"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="eco-default"
          />
        </div>
        <div className="form-group">
          <label htmlFor="language-select">Language</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="auto">Automatic</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>

      {/* ── Speech not supported ── */}
      {!speechSupported && (
        <div className="card">
          <div className="error">
            Your browser does not support voice features (SpeechRecognition and SpeechSynthesis are needed).
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="card">
          <div className="error">{error}</div>
        </div>
      )}

      {/* ── Voice Discussion card (forest background) ── */}
      <div className="card voice-card">
        <span className="voice-card-badge">♻️</span>
        <h4>Voice Discussion</h4>
        <p className="text-muted">
          Start discussion to speak with ECO. The bot will listen continuously and
          automatically restart after 5 seconds of silence until you hit Stop.
        </p>
        <div className="voice-controls">
          <button
            className="voice-btn"
            type="button"
            onClick={startVoiceChatbot}
            disabled={!canStartVoiceBot}
          >
            Start Discussion 🎙️
          </button>
          <button
            className="voice-btn"
            type="button"
            onClick={stopVoiceBot}
            disabled={!canStopVoiceBot}
          >
            Stop Bot
          </button>
          <button
            className="voice-btn"
            type="button"
            onClick={() => speakText(lastReply)}
            disabled={!lastReply}
          >
            Replay Response
          </button>
          <button
            className="voice-btn"
            type="button"
            onClick={stopSpeaking}
            disabled={!isSpeaking}
          >
            Stop Speaking
          </button>
        </div>
        <div className="voice-status-row">
          {isListening && <span className="status-badge status-listening">Listening</span>}
          {isSpeaking && <span className="status-badge status-speaking">Speaking</span>}
          {isManualListening && <span className="status-badge status-listening">Mic Input</span>}
          <span className="voice-status-text">{statusText}</span>
        </div>
      </div>

      {/* ── Conversation History ── */}
      <div className="card chat-card">
        <span className="chat-card-badge">♻️</span>
        <h4>Conversation History</h4>
        <div className="chat-display">
          {chat.length === 0 && (
            <div className="chat-empty">
              Let's chat about a greener world! 🌱
            </div>
          )}
          {chat.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`chat-message ${item.role}`}>
              <div className="chat-bubble">
                <strong style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px", display: "block" }}>
                  {item.role === "assistant" ? "ECO" : "You"}
                </strong>
                {item.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="chat-bubble">
                <strong style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px", display: "block" }}>ECO</strong>
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* ── Text input ── */}
      {inputMode === "text" && (
        <div className="card">
          <h4>Write To ECO</h4>
          <form onSubmit={handleTextSubmit} className="chat-input-area">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Ask me something about waste management..."
            />
            <button
              type="button"
              className="voice-btn chat-mic-btn"
              onClick={captureVoiceInput}
              disabled={!speechSupported || voiceBotEnabled || voiceBotBusy || isManualListening}
            >
              Mic
            </button>
            <button type="submit" disabled={loading || !messageInput.trim()}>
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
