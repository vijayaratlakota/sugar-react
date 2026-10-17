import { useEffect, useMemo, useState } from "react";
import { DISCLAIMER, Food, makeRounds, todaySeed } from "./foods";
import { getTop, saveScore, Score, track } from "./api";
import { makeShareCard } from "./shareCard";

type Phase = "intro" | "play" | "reveal" | "done";
const CTA = "https://steerclub.com/buy/glp1-specialist";

export default function App() {
  const seed = useMemo(() => todaySeed(), []);
  const rounds = useMemo(() => makeRounds(seed, 10), [seed]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Food | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [name, setName] = useState("");
  const [top, setTop] = useState<Score[]>([]);
  const [saved, setSaved] = useState(false);

  const score = results.filter(Boolean).length;
  const grid = results.map((r) => (r ? "🟩" : "🟥")).join("");

  useEffect(() => {
    if (phase === "done") getTop().then(setTop).catch(() => {});
  }, [phase, saved]);

  function start() {
    track("started");
    setPhase("play");
  }

  function choose(f: Food) {
    if (phase !== "play") return;
    const [a, b] = rounds[i];
    const higher = a.gi >= b.gi ? a : b;
    setPicked(f);
    setResults((r) => [...r, f.id === higher.id]);
    setPhase("reveal");
  }

  function next() {
    setPicked(null);
    if (i + 1 >= rounds.length) {
      track("finished");
      setPhase("done");
    } else {
      setI(i + 1);
      setPhase("play");
    }
  }

  async function onSave() {
    if (!name.trim()) return;
    await saveScore(name.trim(), score * 10);
    setSaved(true);
  }

  async function onShare() {
    track("shared");
    const text = `I spotted ${score}/${rounds.length} sugar spikes in today's Guess the Sugar 🍚🍌\n${grid}\nCan you beat me?`;
    const url = window.location.origin;
    try {
      const file = await makeShareCard(name, score, rounds.length, grid);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text}\n${url}` });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "Guess the Sugar", text, url });
        return;
      }
    } catch {
      return; // user closed the share sheet
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank");
  }

  return (
    <main className="wrap">
      <header className="top">
        <span className="logo">steer</span>
        <span className="muted">Daily · {seed}</span>
      </header>

      {phase === "intro" && (
        <section className="intro fade-up">
          <h1>Idli or poha?<br />Which spikes more?</h1>
          <p className="lead">10 quick picks. Spot the food that raises your blood sugar faster. 60 seconds.</p>
          <button className="btn primary big" onClick={start}>Play today&apos;s round</button>
        </section>
      )}

      {(phase === "play" || phase === "reveal") && (
        <section className="play">
          <div className="bar"><div className="fill" style={{ width: `${(i / rounds.length) * 100}%` }} /></div>
          <p className="q">Which spikes your sugar more?</p>
          <div className="cards">
            {rounds[i].map((f) => {
              const [a, b] = rounds[i];
              const isHigher = f.gi === Math.max(a.gi, b.gi);
              const show = phase === "reveal";
              const cls = ["card", show ? (isHigher ? "hi" : "lo") : "", picked?.id === f.id ? "picked" : ""].join(" ");
              return (
                <button key={f.id + i} className={cls} onClick={() => choose(f)}>
                  <span className="emoji">{f.emoji}</span>
                  <span className="name">{f.name}</span>
                  {show && (
                    <span className="info fade-in">
                      GI {f.gi}{f.verify ? " (approx.)" : ""} · {f.note}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {phase === "reveal" && (
            <button className="btn dark fade-up" onClick={next}>
              {results[results.length - 1] ? "Nice! " : "Not quite. "}Next →
            </button>
          )}
        </section>
      )}

      {phase === "done" && (
        <section className="done pop">
          <div className="result">
            <p>You spotted</p>
            <p className="big-score">{score}/{rounds.length}</p>
            <p className="grid">{grid}</p>
          </div>

          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Your name for the leaderboard" />
          <div className="row">
            <button className="btn dark" onClick={onSave} disabled={saved}>{saved ? "Saved ✓" : "Save score"}</button>
            <button className="btn primary" onClick={onShare}>Challenge a friend</button>
          </div>

          {top.length > 0 && (
            <div className="board">
              <p className="board-title">Today&apos;s top 10</p>
              <ol>
                {top.map((t, k) => (
                  <li key={k}><span>{k + 1}. {t.name}</span><span>{t.score}</span></li>
                ))}
              </ol>
            </div>
          )}

          <a className="cta" href={CTA} target="_blank" rel="noreferrer" onClick={() => track("cta_click")}>
            Curious what your own numbers say? Talk to a Steer GLP-1 specialist →
          </a>
          <p className="disclaimer">{DISCLAIMER}</p>
        </section>
      )}
    </main>
  );
}
