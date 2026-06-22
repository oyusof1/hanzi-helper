import { useEffect, useState } from "react";
import {
  chineseVoices,
  ttsSupported,
  setVoice,
  getVoiceURI,
  setRate,
  getRate,
  speak,
} from "../lib/tts.js";

export default function VoiceBar() {
  const [voices, setVoices] = useState([]);
  const [uri, setUri] = useState(getVoiceURI());
  const [rate, setRateState] = useState(getRate());

  useEffect(() => {
    const load = () => setVoices(chineseVoices());
    load();
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  if (!ttsSupported()) {
    return <div className="voicebar muted">TTS unavailable in this browser</div>;
  }

  return (
    <div className="voicebar">
      <span className="hero-icon">🔊</span>
      <select
        value={uri || ""}
        onChange={(e) => {
          setUri(e.target.value);
          setVoice(e.target.value);
        }}
        title="Chinese voice"
      >
        {voices.length === 0 && <option value="">No zh voice found</option>}
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name}
          </option>
        ))}
      </select>
      <input
        type="range"
        min="0.5"
        max="1.2"
        step="0.05"
        value={rate}
        onChange={(e) => {
          const r = Number(e.target.value);
          setRateState(r);
          setRate(r);
        }}
        title={`Speed ${rate.toFixed(2)}×`}
      />
      <button className="mini" onClick={() => speak("你好")} title="Test voice">
        Test
      </button>
    </div>
  );
}
