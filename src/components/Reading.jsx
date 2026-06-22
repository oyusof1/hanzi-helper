import { useMemo, useState } from "react";
import { isHan, shuffle } from "../lib/data.js";
import { speak } from "../lib/tts.js";

const LEVELS = [
  ["all", "All"],
  ["short", "Short (≤4)"],
  ["med", "Medium (5–7)"],
  ["long", "Long (8+)"],
];

function inLevel(n, level) {
  if (level === "short") return n <= 4;
  if (level === "med") return n >= 5 && n <= 7;
  if (level === "long") return n >= 8;
  return true;
}

export default function Reading({ data }) {
  const { readable, byChar } = data;
  const [level, setLevel] = useState("all");
  const [showEn, setShowEn] = useState(false);

  const pool = useMemo(
    () => shuffle(readable.filter((s) => inLevel(s.n, level))),
    [readable, level]
  );
  const [idx, setIdx] = useState(0);
  const sentence = pool[idx % (pool.length || 1)];

  function next() {
    setShowEn(false);
    setIdx((n) => n + 1);
  }

  if (!pool.length) {
    return (
      <div className="view">
        <div className="empty">No sentences at this level yet — learn a few more characters!</div>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="toolbar">
        <div className="seg">
          {LEVELS.map(([id, label]) => (
            <button
              key={id}
              className={level === id ? "on" : ""}
              onClick={() => {
                setLevel(id);
                setIdx(0);
                setShowEn(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="counter">{pool.length} sentences available</div>
      </div>

      <div className="readingcard">
        <div className="sentence">
          {[...sentence.zh].map((ch, k) =>
            isHan(ch) ? (
              <span className="zchar" key={k}>
                <span className="ruby">{byChar.get(ch)?.pinyin || ""}</span>
                <span className="zh" onClick={() => speak(ch)}>
                  {ch}
                </span>
              </span>
            ) : (
              <span className="punct" key={k}>
                {ch}
              </span>
            )
          )}
        </div>

        <div className="readactions">
          <button className="primary" onClick={() => speak(sentence.zh)}>
            🔊 Play sentence
          </button>
          <button className="ghost" onClick={() => setShowEn((s) => !s)}>
            {showEn ? "Hide" : "Show"} translation
          </button>
          <button className="ghost" onClick={next}>
            Next →
          </button>
        </div>

        {showEn && <div className="translation">{sentence.en}</div>}
      </div>

      <p className="hint center">
        Hover shows each character's base pinyin · click a character to hear it
      </p>
    </div>
  );
}
