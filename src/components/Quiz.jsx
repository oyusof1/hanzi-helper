import { useMemo, useState } from "react";
import { sample, shuffle } from "../lib/data.js";
import { speak } from "../lib/tts.js";

const MODES = [
  ["h2m", "汉字 → meaning"],
  ["m2h", "meaning → 汉字"],
  ["h2p", "汉字 → pinyin"],
];
const ROUND = 10;

function buildQuestion(chars, mode) {
  const correct = chars[Math.floor(Math.random() * chars.length)];
  const key = mode === "h2p" ? "pinyin" : mode === "m2h" ? "hanzi" : "meaning";
  const distractors = sample(
    chars.filter((c) => c[key] !== correct[key]),
    3
  );
  const options = shuffle([correct, ...distractors]);
  return { correct, options, mode };
}

export default function Quiz({ data }) {
  const chars = data.characters;
  const [mode, setMode] = useState("h2m");
  const [q, setQ] = useState(() => buildQuestion(chars, "h2m"));
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const promptText = useMemo(() => {
    if (q.mode === "m2h") return q.correct.meaning;
    return q.correct.hanzi;
  }, [q]);

  function next(newMode = mode) {
    setQ(buildQuestion(chars, newMode));
    setPicked(null);
  }

  function choose(opt) {
    if (picked) return;
    const optVal = q.mode === "h2p" ? opt.pinyin : q.mode === "m2h" ? opt.hanzi : opt.meaning;
    const corVal =
      q.mode === "h2p"
        ? q.correct.pinyin
        : q.mode === "m2h"
        ? q.correct.hanzi
        : q.correct.meaning;
    const ok = optVal === corVal;
    setPicked(opt);
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
    if (q.mode !== "m2h") speak(q.correct.hanzi);
  }

  const optionLabel = (o) =>
    q.mode === "h2p" ? o.pinyin : q.mode === "m2h" ? o.hanzi : o.meaning;
  const correctVal = optionLabel(q.correct);

  const roundDone = score.total > 0 && score.total % ROUND === 0 && picked;

  return (
    <div className="view">
      <div className="toolbar">
        <div className="seg">
          {MODES.map(([id, label]) => (
            <button
              key={id}
              className={mode === id ? "on" : ""}
              onClick={() => {
                setMode(id);
                setScore({ right: 0, total: 0 });
                next(id);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="counter">
          Score {score.right}/{score.total}
          {score.total > 0 &&
            ` · ${Math.round((score.right / score.total) * 100)}%`}
        </div>
      </div>

      <div className="quizprompt">
        {q.mode === "m2h" ? (
          <span className="qmeaning">{promptText}</span>
        ) : (
          <span className="qhanzi" onClick={() => speak(q.correct.hanzi)}>
            {promptText} <small>🔊</small>
          </span>
        )}
      </div>

      <div className="options">
        {q.options.map((o, idx) => {
          let cls = "opt";
          if (picked) {
            if (optionLabel(o) === correctVal) cls += " correct";
            else if (o === picked) cls += " wrong";
          }
          return (
            <button key={idx} className={cls} onClick={() => choose(o)}>
              {optionLabel(o)}
              {picked && optionLabel(o) === correctVal && q.mode === "h2m" && (
                <small className="optsub">{o.pinyin}</small>
              )}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="quizfeedback">
          {optionLabel(picked) === correctVal ? (
            <span className="good">✓ Correct</span>
          ) : (
            <span className="bad">
              ✗ {q.correct.hanzi} = {q.correct.pinyin} · {q.correct.meaning}
            </span>
          )}
          <button className="primary" onClick={() => next()}>
            Next →
          </button>
        </div>
      )}

      {roundDone && (
        <div className="roundbanner">
          Round complete — {score.right}/{score.total} correct
        </div>
      )}
    </div>
  );
}
