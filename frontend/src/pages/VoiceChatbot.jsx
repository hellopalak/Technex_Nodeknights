import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const awaitingReplyRef = useRef(false);
  const chatBottomRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = Boolean(SpeechRecognition && window.speechSynthesis);
  const voiceBotBusy = loading || awaitingReplyRef.current || isSpeaking;
  const canStartVoiceBot = speechSupported && !voiceBotEnabled && !isManualListening;
  const canStopVoiceBot = voiceBotEnabled || isListening || isSpeaking || isManualListening;

  const statusText = useMemo(() => {
    if (!speechSupported) return "Voice is not supported in this browser.";
    if (isListening) return "Listening...";
    if (isManualListening) return "Listening once for mic input...";
    if (isSpeaking) return "Speaking...";
    if (loading) return "ECO is typing...";
    if (voiceBotEnabled) return "Voice bot is active.";
    return "Idle";
  }, [isListening, isManualListening, isSpeaking, loading, speechSupported, voiceBotEnabled]);

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
      recognition.stop();
    }, 3000);
  }

  function speakText(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
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

  function stopSpeaking() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

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
        body: JSON.stringify({ message, sessionId }),
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
      if (voiceBotEnabled && !isSpeaking && !isListening) {
        startListening();
      }
    }
  }

  function stopListening() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setIsManualListening(false);
    recognitionRef.current = null;
  }

  function stopVoiceBot() {
    setVoiceBotEnabled(false);
    stopListening();
    stopSpeaking();
  }

  function startListening({ singleUse = false } = {}) {
    if (!speechSupported || loading || awaitingReplyRef.current || isListening || isManualListening) return;
    if (!singleUse && !voiceBotEnabled) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

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
      if (!singleUse && voiceBotEnabled && !loading && !awaitingReplyRef.current && !isSpeaking) {
        setTimeout(() => {
          startListening();
        }, 200);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function startVoiceChatbot() {
    if (!speechSupported) return;
    setVoiceBotEnabled(true);
    startListening();
  }

  function captureVoiceInput() {
    startListening({ singleUse: true });
  }

  async function handleTextSubmit(event) {
    event.preventDefault();
    const message = messageInput.trim();
    if (!message) return;
    setMessageInput("");
    await sendMessage(message);
  }

  return (
    <div className="container">
      <div className="card">
        <h3>ECO Voice Chatbot</h3>
        <p className="text-muted">Chat with your AI environmental assistant. ECO automatically uses your waste history as context.</p>

        <div className="form-group">
          <label htmlFor="session-id">Session ID</label>
          <input
            id="session-id"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="eco-default"
          />
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
        <h4>Voice Controls</h4>
        <div className="voice-controls">
          <button
            className="voice-btn"
            type="button"
            onClick={startVoiceChatbot}
            disabled={!canStartVoiceBot}
          >
            Start Voice Bot
          </button>
          <button
            className="voice-btn"
            type="button"
            onClick={stopVoiceBot}
            disabled={!canStopVoiceBot}
          >
            Stop Voice Bot
          </button>
          <button
            className="voice-btn"
            type="button"
            onClick={captureVoiceInput}
            disabled={!speechSupported || voiceBotEnabled || voiceBotBusy || isManualListening}
          >
            Use Mic For Text
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
        <h4>Send Message</h4>
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
    </div>
  );
}
