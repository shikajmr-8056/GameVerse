import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { COLORS, SAFE, TRACK, HOME_COL, START, cellOf, legalMoves, applyMove, botChoose, type Player, type Color } from "@/lib/ludo";
import { makeQuestion, type MathQ } from "@/lib/math-questions";
import { useProgress, update, addXp } from "@/lib/progress";

export const Route = createFileRoute("/playlab/ludo")({
  head: () => ({
    meta: [
      { title: "Math Ludo — PlayLab" },
      { name: "description", content: "Ludo with a 10-second maths challenge before every move." },
      { property: "og:title", content: "Math Ludo — PlayLab" },
      { property: "og:description", content: "Solve maths to move your tokens." },
    ],
  }),
  component: LudoPage,
});

const FILL: Record<Color, string> = { red: "fill-ludo-red", green: "fill-ludo-green", yellow: "fill-ludo-yellow", blue: "fill-ludo-blue" };
const BG: Record<Color, string> = { red: "bg-ludo-red", green: "bg-ludo-green", yellow: "bg-ludo-yellow", blue: "bg-ludo-blue" };
type Phase = "setup" | "roll" | "question" | "choose" | "over";
const S = 40;

function LudoPage() {
  const prog = useProgress();
  const [seats, setSeats] = useState<("human" | "bot" | "off")[]>(["human", "bot", "bot", "bot"]);
  const [diff, setDiff] = useState<1 | 2 | 3>(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [roll, setRoll] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [q, setQ] = useState<MathQ | null>(null);
  const [left, setLeft] = useState(10);
  const [msg, setMsg] = useState("");
  const [winner, setWinner] = useState<Color | null>(null);
  const turnId = useRef(0);
  const qStart = useRef(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => clearTimers, []);

  const cur = players[turn];

  const nextTurn = useCallback((ps: Player[], again: boolean) => {
    clearTimers();
    turnId.current++;
    setQ(null);
    setPhase("roll");
    if (!again) setTurn((t) => (t + 1) % ps.length);
  }, []);

  function start() {
    const ps = COLORS.map((c, i) => ({ c, s: seats[i] })).filter((x) => x.s !== "off").map(({ c, s }) => ({ color: c, bot: s === "bot", tokens: [-1, -1, -1, -1] }));
    if (ps.length < 2) { setMsg("Choose at least 2 players."); return; }
    clearTimers(); turnId.current++;
    setPlayers(ps); setTurn(0); setPhase("roll"); setWinner(null); setMsg("Red starts. Roll the dice!");
  }

  function doRoll() {
    if (phase !== "roll" || rolling) return;
    setRolling(true);
    const id = turnId.current;
    later(() => {
      if (id !== turnId.current) return;
      const v = 1 + Math.floor(Math.random() * 6);
      setRoll(v); setRolling(false);
      const question = makeQuestion(prog.grade, diff);
      setQ(question); setLeft(10); qStart.current = Date.now(); setPhase("question");
    }, 600);
  }

  // countdown
  useEffect(() => {
    if (phase !== "question") return;
    const id = turnId.current;
    const iv = window.setInterval(() => {
      if (id !== turnId.current) return;
      const remain = 10 - Math.floor((Date.now() - qStart.current) / 1000);
      setLeft(Math.max(0, remain));
      if (remain <= 0) { clearInterval(iv); answer(null, id); }
    }, 200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function answer(v: number | null, id = turnId.current) {
    if (id !== turnId.current || phase !== "question" || !q || !cur) return;
    turnId.current++; // lock this question
    const ok = v === q.answer;
    const ms = Date.now() - qStart.current;
    if (!cur.bot) update((p) => ({ ...p, mathLog: [...p.mathLog.slice(-199), { topic: q.topic, correct: ok, ms }] }));
    if (!ok) {
      setMsg(`${cap(cur.color)}: ${v === null ? "time up" : "wrong"} — answer was ${q.answer}. Turn skipped.`);
      later(() => nextTurn(players, false), 1200);
      setPhase("choose");
      return;
    }
    if (!cur.bot) addXp(5);
    const moves = legalMoves(cur, roll);
    if (moves.length === 0) { setMsg(`${cap(cur.color)}: correct! But no legal move with ${roll}.`); setPhase("choose"); later(() => nextTurn(players, false), 1200); return; }
    setMsg(`${cap(cur.color)}: correct! ${cur.bot ? "" : "Pick a token to move."}`);
    setPhase("choose");
    if (cur.bot || moves.length === 1) later(() => move(cur.bot ? botChoose(players, turn, roll) : moves[0]), 600);
  }

  function move(token: number) {
    if (!cur || !legalMoves(cur, roll).includes(token)) return;
    clearTimers();
    const res = applyMove(players, turn, token, roll);
    setPlayers(res.players);
    if (res.finished) {
      setWinner(cur.color); setPhase("over"); setMsg(`${cap(cur.color)} wins!`);
      if (!cur.bot) { addXp(50, "Ludo Champion"); update((p) => ({ ...p, games: { ...p.games, ludo: 100 } })); }
      return;
    }
    if (res.captured) setMsg(`${cap(cur.color)} captured a token! Extra turn.`);
    nextTurn(res.players, roll === 6 || res.captured);
  }

  // bot driver
  useEffect(() => {
    if (!cur?.bot) return;
    const id = turnId.current;
    if (phase === "roll") later(() => id === turnId.current && doRoll(), 800);
    if (phase === "question" && q) {
      const acc = diff === 1 ? 0.6 : diff === 2 ? 0.75 : 0.9;
      const delay = 1500 + Math.random() * 3500;
      later(() => answer(Math.random() < acc ? q.answer : q.options.find((o) => o !== q.answer)!, id), delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, turn, q, cur?.bot]);

  const choosable = phase === "choose" && cur && !cur.bot && q === q ? legalMoves(cur, roll) : [];

  return (
    <main className="pb-10">
      <PageHeader title="Math Ludo" back="/playlab" sub="Roll, answer within 10 seconds, then move. Wrong answer or time up skips your move." />
      <div className="grid gap-6 px-4 md:px-8 xl:grid-cols-[minmax(0,640px)_1fr]">
        <div className="card-surface p-3">
          <svg viewBox={`0 0 ${15 * S} ${15 * S}`} className="w-full" role="img" aria-label="Ludo board">
            <rect width={15 * S} height={15 * S} className="fill-card" />
            {(["red", "green", "blue", "yellow"] as Color[]).map((c) => {
              const [r0, c0] = c === "red" ? [0, 0] : c === "green" ? [0, 9] : c === "blue" ? [9, 0] : [9, 9];
              return <g key={c}><rect x={c0 * S} y={r0 * S} width={6 * S} height={6 * S} className={FILL[c]} /><rect x={c0 * S + S * 0.6} y={r0 * S + S * 0.6} width={4.8 * S} height={4.8 * S} rx={12} className="fill-card" /></g>;
            })}
            {TRACK.map(([r, c], i) => {
              const startOf = COLORS.find((col) => START[col] === i);
              return <g key={i}><rect x={c * S} y={r * S} width={S} height={S} className={`${startOf ? FILL[startOf] : "fill-card"} stroke-border`} strokeWidth={1} />
                {SAFE.has(i) && !startOf && <text x={c * S + S / 2} y={r * S + S * 0.68} textAnchor="middle" fontSize={20} className="fill-muted-foreground">★</text>}</g>;
            })}
            {COLORS.map((c) => HOME_COL[c].map(([r, cc], i) => <rect key={c + i} x={cc * S} y={r * S} width={S} height={S} className={`${FILL[c]} stroke-border`} strokeWidth={1} opacity={0.8} />))}
            <polygon points={`${6 * S},${6 * S} ${9 * S},${6 * S} ${7.5 * S},${7.5 * S}`} className={FILL.green} />
            <polygon points={`${9 * S},${6 * S} ${9 * S},${9 * S} ${7.5 * S},${7.5 * S}`} className={FILL.yellow} />
            <polygon points={`${6 * S},${9 * S} ${9 * S},${9 * S} ${7.5 * S},${7.5 * S}`} className={FILL.blue} />
            <polygon points={`${6 * S},${6 * S} ${6 * S},${9 * S} ${7.5 * S},${7.5 * S}`} className={FILL.red} />
            {players.map((pl, pi) => pl.tokens.map((t, ti) => {
              const [r, c] = cellOf(pl.color, t, ti);
              const off = t >= 0 ? (ti - 1.5) * 4 : 0;
              const can = pi === turn && choosable.includes(ti);
              const cx = t < 0 ? c * S : c * S + S / 2 + off, cy = t < 0 ? r * S : r * S + S / 2 + off;
              return (
                <g key={pl.color + ti} onClick={() => can && move(ti)} className={can ? "cursor-pointer" : ""} style={{ transition: "transform .3s" }}>
                  {can && <circle cx={cx} cy={cy} r={17} className="fill-none stroke-foreground animate-pulse" strokeWidth={3} />}
                  <circle cx={cx} cy={cy} r={13} className={`${FILL[pl.color]} stroke-foreground`} strokeWidth={2} />
                  <circle cx={cx} cy={cy} r={5} className="fill-card" />
                </g>
              );
            }))}
          </svg>
        </div>

        <div className="space-y-4">
          {phase === "setup" || phase === "over" ? (
            <div className="card-surface space-y-4 p-5">
              {winner && <div className={`rounded-lg ${BG[winner]} p-4 text-center text-xl font-bold text-primary-foreground`}>🏆 {cap(winner)} wins!</div>}
              <h2 className="text-xl font-bold">Match setup</h2>
              <p className="text-sm text-muted-foreground">Offline pass-and-play and bots. Online rooms need the VidyaVerse game server, which isn't connected yet.</p>
              {COLORS.map((c, i) => (
                <label key={c} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-medium"><span className={`h-4 w-4 rounded-full ${BG[c]}`} />{cap(c)}</span>
                  <select value={seats[i]} onChange={(e) => setSeats((s) => s.map((x, j) => (j === i ? (e.target.value as "human") : x)))} className="rounded-md border bg-card px-2 py-1">
                    <option value="human">Human</option><option value="bot">Bot</option><option value="off">Empty</option>
                  </select>
                </label>
              ))}
              <label className="flex items-center justify-between">Difficulty
                <select value={diff} onChange={(e) => setDiff(Number(e.target.value) as 1)} className="rounded-md border bg-card px-2 py-1">
                  <option value={1}>Easy</option><option value={2}>Medium</option><option value={3}>Hard</option>
                </select>
              </label>
              <p className="text-xs text-muted-foreground">Questions match Class {prog.grade} (change in the sidebar).</p>
              <button onClick={start} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground">Start match</button>
              {msg && <p className="text-sm text-destructive">{phase === "setup" ? msg : ""}</p>}
            </div>
          ) : cur && (
            <div className="card-surface space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg font-bold"><span className={`h-5 w-5 rounded-full ${BG[cur.color]}`} />{cap(cur.color)}'s turn {cur.bot && "(bot)"}</span>
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 bg-card font-display text-3xl font-bold ${rolling ? "animate-spin" : ""}`}>{rolling ? "?" : roll || "–"}</div>
              </div>
              {phase === "roll" && !cur.bot && <button onClick={doRoll} disabled={rolling} className="w-full rounded-lg bg-primary py-3 text-lg font-semibold text-primary-foreground">Roll dice</button>}
              {phase === "question" && q && (
                <div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{q.topic}</span><span className={`font-bold ${left <= 3 ? "text-destructive" : ""}`}>{left}s</span></div>
                  <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${left * 10}%` }} /></div>
                  <p className="my-4 text-center font-display text-2xl font-bold">{q.text}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((o) => <button key={o} disabled={cur.bot} onClick={() => answer(o)} className="rounded-lg border-2 py-3 text-lg font-semibold hover:border-primary disabled:opacity-60">{o}</button>)}
                  </div>
                  {cur.bot && <p className="mt-2 text-center text-sm text-muted-foreground">Bot is thinking…</p>}
                </div>
              )}
              <p className="min-h-6 text-sm">{msg}</p>
              <button onClick={() => { clearTimers(); turnId.current++; setPhase("setup"); setPlayers([]); }} className="text-sm text-muted-foreground underline">End match</button>
            </div>
          )}
          <details className="card-surface p-4 text-sm">
            <summary className="cursor-pointer font-semibold">Rules</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Roll a 6 to bring a token out. A 6 gives another turn.</li>
              <li>Answer the maths question within 10 seconds to move.</li>
              <li>Land on an opponent (not on a star or start cell) to send it home and roll again.</li>
              <li>Exact roll needed to reach the centre. First to bring all 4 home wins.</li>
            </ul>
          </details>
        </div>
      </div>
    </main>
  );
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
