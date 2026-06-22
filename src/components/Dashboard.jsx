import { useMemo } from "react";
import { stageGroup, STAGE_ORDER, stageRank } from "../lib/data.js";

const STAGE_COLORS = {
  Novice: "#64748b",
  Apprentice: "#e11d48",
  Journeyman: "#f59e0b",
  Expert: "#10b981",
  Master: "#6366f1",
};

export default function Dashboard({ data, onNav }) {
  const { characters, readable, corpusCount } = data;

  const stageCounts = useMemo(() => {
    const m = new Map();
    for (const c of characters) {
      const g = stageGroup(c.stage);
      m.set(g, (m.get(g) || 0) + 1);
    }
    return [...m.entries()].sort(
      (a, b) => stageRank(a[0] + " I") - stageRank(b[0] + " I")
    );
  }, [characters]);

  const detailCounts = useMemo(() => {
    const m = new Map();
    for (const c of characters) m.set(c.stage, (m.get(c.stage) || 0) + 1);
    return STAGE_ORDER.filter((s) => m.has(s)).map((s) => [s, m.get(s)]);
  }, [characters]);

  const max = Math.max(...stageCounts.map(([, n]) => n), 1);
  const scraped = new Date(data.scrapedAt);

  return (
    <div className="view">
      <div className="cards">
        <Stat big label="Characters learned" value={characters.length} />
        <Stat
          label="Readable sentences"
          value={readable.length}
          sub={`of ${corpusCount.toLocaleString()} in corpus`}
          onClick={() => onNav("reading")}
        />
        <Stat label="SRS stages reached" value={stageCounts.length} />
        <Stat
          label="Data updated"
          value={scraped.toLocaleDateString()}
          sub={scraped.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        />
      </div>

      <section className="panel">
        <h2>Progress by SRS stage</h2>
        <div className="bars">
          {stageCounts.map(([stage, n]) => (
            <div className="barrow" key={stage}>
              <span className="barlabel">{stage}</span>
              <div className="bartrack">
                <div
                  className="barfill"
                  style={{
                    width: `${(n / max) * 100}%`,
                    background: STAGE_COLORS[stage] || "#64748b",
                  }}
                />
              </div>
              <span className="barval">{n}</span>
            </div>
          ))}
        </div>
        <div className="chips">
          {detailCounts.map(([s, n]) => (
            <span className="chip" key={s}>
              {s} <b>{n}</b>
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Jump in</h2>
        <div className="actiongrid">
          <button className="action" onClick={() => onNav("flashcards")}>
            <b>Flashcards</b>
            <span>Drill all {characters.length} characters with audio</span>
          </button>
          <button className="action" onClick={() => onNav("quiz")}>
            <b>Quiz</b>
            <span>Test meaning &amp; pinyin recall</span>
          </button>
          <button className="action" onClick={() => onNav("reading")}>
            <b>Reading</b>
            <span>{readable.length} sentences you can fully read</span>
          </button>
          <button className="action" onClick={() => onNav("browse")}>
            <b>Browse</b>
            <span>Search &amp; listen to your full list</span>
          </button>
        </div>
      </section>

      <p className="credit">
        Sentences: {data.corpusCredit.source}. {data.corpusCredit.license}
      </p>
    </div>
  );
}

function Stat({ label, value, sub, big, onClick }) {
  return (
    <div
      className={"statcard" + (onClick ? " clickable" : "")}
      onClick={onClick}
    >
      <div className={big ? "statval big" : "statval"}>{value}</div>
      <div className="statlabel">{label}</div>
      {sub && <div className="statsub">{sub}</div>}
    </div>
  );
}
