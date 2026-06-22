import { useEffect, useState } from "react";
import { loadData } from "./lib/data.js";
import Dashboard from "./components/Dashboard.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Quiz from "./components/Quiz.jsx";
import Reading from "./components/Reading.jsx";
import Browse from "./components/Browse.jsx";
import VoiceBar from "./components/VoiceBar.jsx";

const TABS = [
  ["dashboard", "Dashboard"],
  ["flashcards", "Flashcards"],
  ["quiz", "Quiz"],
  ["reading", "Reading"],
  ["browse", "Browse"],
];

export default function App() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    loadData().then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="loading">Failed to load data: {err}</div>;
  if (!data) return <div className="loading">Loading your characters…</div>;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          汉字 <span>Helper</span>
        </div>
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "tab active" : "tab"}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <VoiceBar />
      </header>

      <main className="content">
        {tab === "dashboard" && <Dashboard data={data} onNav={setTab} />}
        {tab === "flashcards" && <Flashcards data={data} />}
        {tab === "quiz" && <Quiz data={data} />}
        {tab === "reading" && <Reading data={data} />}
        {tab === "browse" && <Browse data={data} />}
      </main>
    </div>
  );
}
