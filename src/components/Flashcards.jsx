import { useMemo, useState } from "react";
import { shuffle, stageGroup } from "../lib/data.js";
import { speak } from "../lib/tts.js";

const GROUPS = ["All", "Novice", "Apprentice", "Journeyman", "Expert", "Master"];

export default function Flashcards({ data }) {
  const [group, setGroup] = useState("All");
  const [dir, setDir] = useState("hanzi"); // hanzi-first or meaning-first
  const [order, setOrder] = useState(() => shuffle(data.characters));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, again: 0 });

  const deck = useMemo(() => {
    const filtered =
      group === "All"
        ? order
        : order.filter((c) => stageGroup(c.stage) === group);
    return filtered.length ? filtered : order;
  }, [order, group]);

  const card = deck[i % deck.length];

  function advance(which) {
    setStats((s) => ({ ...s, [which]: s[which] + 1 }));
    setFlipped(false);
    setI((n) => (n + 1) % deck.length);
  }

  function reshuffle() {
    setOrder(shuffle(data.characters));
    setI(0);
    setFlipped(false);
    setStats({ known: 0, again: 0 });
  }

  return (
    <div className="view">
      <div className="toolbar">
        <div className="seg">
          {GROUPS.map((g) => (
            <button
              key={g}
              className={group === g ? "on" : ""}
              onClick={() => {
                setGroup(g);
                setI(0);
                setFlipped(false);
              }}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="seg">
          <button
            className={dir === "hanzi" ? "on" : ""}
            onClick={() => setDir("hanzi")}
          >
            汉字 → meaning
          </button>
          <button
            className={dir === "meaning" ? "on" : ""}
            onClick={() => setDir("meaning")}
          >
            meaning → 汉字
          </button>
        </div>
        <button className="mini" onClick={reshuffle}>
          ⟳ Shuffle
        </button>
      </div>

      <div className="counter">
        {(i % deck.length) + 1} / {deck.length} &nbsp;·&nbsp; ✓ {stats.known}
        &nbsp; ✗ {stats.again}
      </div>

      <div
        className={"flashcard" + (flipped ? " flipped" : "")}
        onClick={() => setFlipped((f) => !f)}
      >
        {dir === "hanzi" ? (
          <>
            <div className="fc-front">
              <div className="bighanzi">{card.hanzi}</div>
              <button
                className="speakbtn"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(card.hanzi);
                }}
              >
                🔊
              </button>
            </div>
            {flipped && (
              <div className="fc-back">
                <div className="pinyin">{card.pinyin}</div>
                <div className="meaning">{card.meaning}</div>
                <div className="stage">{card.stage}</div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="fc-front">
              <div className="meaning big">{card.meaning}</div>
            </div>
            {flipped && (
              <div className="fc-back">
                <div className="bighanzi">{card.hanzi}</div>
                <div className="pinyin">{card.pinyin}</div>
                <button
                  className="speakbtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(card.hanzi);
                  }}
                >
                  🔊
                </button>
              </div>
            )}
          </>
        )}
        {!flipped && <div className="hint">click to reveal</div>}
      </div>

      <div className="cardactions">
        <button className="again" onClick={() => advance("again")}>
          ✗ Again
        </button>
        <button className="known" onClick={() => advance("known")}>
          ✓ Got it
        </button>
      </div>
    </div>
  );
}
