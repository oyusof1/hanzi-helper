import { useMemo, useState } from "react";
import { stageGroup, stageRank } from "../lib/data.js";
import { speak } from "../lib/tts.js";

export default function Browse({ data }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("stage");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let arr = data.characters.filter(
      (c) =>
        !needle ||
        c.hanzi.includes(needle) ||
        c.pinyin.toLowerCase().includes(needle) ||
        c.meaning.toLowerCase().includes(needle)
    );
    if (sort === "stage")
      arr = [...arr].sort((a, b) => stageRank(b.stage) - stageRank(a.stage));
    else if (sort === "pinyin")
      arr = [...arr].sort((a, b) => a.pinyin.localeCompare(b.pinyin));
    return arr;
  }, [data.characters, q, sort]);

  return (
    <div className="view">
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search hanzi, pinyin, or meaning…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="seg">
          <button className={sort === "stage" ? "on" : ""} onClick={() => setSort("stage")}>
            By stage
          </button>
          <button className={sort === "pinyin" ? "on" : ""} onClick={() => setSort("pinyin")}>
            By pinyin
          </button>
        </div>
        <div className="counter">{list.length} shown</div>
      </div>

      <div className="grid">
        {list.map((c) => (
          <div className="gcard" key={c.hanzi} onClick={() => speak(c.hanzi)}>
            <div className="ghanzi">{c.hanzi}</div>
            <div className="gpinyin">{c.pinyin}</div>
            <div className="gmeaning">{c.meaning}</div>
            <div className={"gstage s-" + stageGroup(c.stage).toLowerCase()}>
              {c.stage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
