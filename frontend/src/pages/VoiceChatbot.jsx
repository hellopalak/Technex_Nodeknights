import { useEffect, useMemo, useRef, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const SILENCE_TIMEOUT_MS = 5000;

export default function VoiceChatbot({ token }) {
  const [sessionId, setSessionId] = useState("eco-default");
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // voice / language state
  const [voiceBotEnabled, setVoiceBotEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isManualListening, setIsManualListening] = useState(false);
  const [lastReply, setLastReply] = useState("");
  const [inputMode, setInputMode] = useState("voice");
  const [language, setLanguage] = useState("auto"); // auto|en|hi


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
      return `Voice mode active (${langLabel}).`; // listening/restarting handled separately
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
    // respect user-selected language unless auto
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
    // set recognition language based on user selection
    if (language === "hi") recognition.lang = "hi-IN";
    else if (language === "en") recognition.lang = "en-US";
    // auto defaults to browser setting (usually en-US)

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
        // keep the bot enabled but restart listening automatically
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
      <div className="card">
        <h3>ECO Voice Chatbot</h3>
        <p className="text-muted">Chat with your AI environmental assistant. ECO automatically uses your waste history as context.</p>

        <div className="form-group">
          <label>Interaction Mode</label>
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

      {!speechSupported && (
        <div className="card">
          <div className="error">
            Your browser does not support voice features (SpeechRecognition and SpeechSynthesis are needed).
          </div>
        </div>
      )}

      {error && (
        <div className="card">
          <div className="error">{error}</div>
        </div>
      )}

      <div className="card">
        <h4>Voice Discussion</h4>
        <p className="text-muted">
          Start discussion to speak with ECO. The bot will listen continuously and
          automatically restart after 5 seconds of silence until you hit Stop.
        </p>
        <div className="voice-controls">
          <button
            className="voice-btn"
            type="button"
            onClick={startVoiceChatbot}
            disabled={!canStartVoiceBot}
          >
            Start Discussion
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
          <span className="text-muted voice-status-text">{statusText}</span>
        </div>
      </div>

      <div className="card">
        <h4>Conversation History</h4>
        <div className="chat-display">
          {chat.length === 0 && (
            <div style={{ textAlign: "center", color: "#999", marginTop: "20px" }}>
              <p>No messages yet. Start chatting!</p>
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
                <strong style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px", display: "block" }}>
                  ECO
                </strong>
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

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
