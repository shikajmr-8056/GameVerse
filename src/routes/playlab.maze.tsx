import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { generateMaze, ratInMaze, type Grid, type Step } from "@/lib/maze";
import { useProgress, update, addXp } from "@/lib/progress";

export const Route = createFileRoute("/playlab/maze")({
  head: () => ({
    meta: [
      { title: "MazeBot — Rat in a Maze" },
      { name: "description", content: "Solve mazes and watch the backtracking algorithm work step by step." },
      { property: "og:title", content: "MazeBot — PlayLab" },
      { property: "og:description", content: "Learn recursion and backtracking visually." },
    ],
  }),
  component: Maze,
});

type Mode = "play" | "solve" | "edit";

function Maze() {
  const prog = useProgress();
  const level = prog.maze.level;
  const size = Math.min(7 + level * 2, 21);
  const [grid, setGrid] = useState<Grid>(() => generateMaze(9));
  const [mode, setMode] = useState<Mode>("play");
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [dead, setDead] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<[number, number][]>([]);
  const [current, setCurrent] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState("Use arrow keys or the buttons to reach the flag.");
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(80);
  const [count, setCount] = useState(0);
  const gen = useRef<Generator<Step> | null>(null);
  const n = grid.length;
  const end: [number, number] = [n - 1, n - 1];

  const resetViz = () => { gen.current = null; setRunning(false); setVisited(new Set()); setDead(new Set()); setPath([]); setCurrent(null); setCount(0); };
  const newMaze = (s = size) => { setGrid(generateMaze(s)); setPos([0, 0]); resetViz(); setStatus("New maze ready."); };
  useEffect(() => { newMaze(size); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [level]);

  function stepOnce(): boolean {
    if (!gen.current) gen.current = ratInMaze(grid, [0, 0], end);
    const { value, done } = gen.current.next();
    if (done || !value) { setRunning(false); return false; }
    setCount((c) => c + 1);
    if (value.kind === "visit") { setCurrent([value.r, value.c]); setVisited((v) => new Set(v).add(`${value.r},${value.c}`)); setStatus(`Visit (${value.r},${value.c}) — depth ${value.depth}. Try Down, Right, Up, Left.`); }
    if (value.kind === "back") { setDead((d) => new Set(d).add(`${value.r},${value.c}`)); setStatus(`Dead end at (${value.r},${value.c}). Backtrack!`); }
    if (value.kind === "found") { setPath(value.path); setCurrent(null); setRunning(false); setStatus(`Path found: ${value.path.length} cells.`); return false; }
    if (value.kind === "fail") { setRunning(false); setStatus("No path exists — this maze is unsolvable."); return false; }
    return true;
  }

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => { if (!stepOnce()) clearInterval(iv); }, speed);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, speed, grid]);

  function moveBy(dr: number, dc: number) {
    if (mode !== "play") return;
    const [r, c] = pos; const nr = r + dr, nc = c + dc;
    if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] === 1) return;
    setPos([nr, nc]);
    if (nr === end[0] && nc === end[1]) {
      setStatus(`Level ${level} complete! +20 XP`);
      addXp(20, level >= 3 ? "Maze Master" : undefined);
      update((p) => ({ ...p, maze: { level: p.maze.level + 1 } }));
    }
  }
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const m: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (m[e.key] && mode === "play") { e.preventDefault(); moveBy(...m[e.key]); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });

  const onPath = new Set(path.map(([r, c]) => `${r},${c}`));
  const cell = Math.floor(560 / n);

  return (
    <main className="pb-10">
      <PageHeader title="MazeBot" back="/playlab" sub={`Level ${level} · ${n}×${n} maze`} />
      <div className="grid gap-6 px-4 md:px-8 xl:grid-cols-[auto_1fr]">
        <div className="card-surface p-3">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, ${cell}px)` }}>
            {grid.flatMap((row, r) => row.map((v, c) => {
              const k = `${r},${c}`;
              const isStart = r === 0 && c === 0, isEnd = r === end[0] && c === end[1];
              const cls = v === 1 ? "bg-foreground" : onPath.has(k) ? "bg-success" : current && current[0] === r && current[1] === c ? "bg-primary" : dead.has(k) ? "bg-destructive/30" : visited.has(k) ? "bg-primary/30" : "bg-card";
              return (
                <button key={k} aria-label={`cell ${r},${c}`} disabled={mode !== "edit" || isStart || isEnd}
                  onClick={() => { setGrid((g) => g.map((rw, i) => rw.map((x, j) => (i === r && j === c ? 1 - x : x)))); resetViz(); }}
                  className={`flex items-center justify-center text-xs ${cls}`} style={{ width: cell, height: cell }}>
                  {mode === "play" && pos[0] === r && pos[1] === c ? "🤖" : isEnd ? "🏁" : isStart && mode !== "play" ? "S" : ""}
                </button>
              );
            }))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="card-surface space-y-3 p-5">
            <div className="flex flex-wrap gap-2">
              {(["play", "solve", "edit"] as Mode[]).map((m) => (
                <button key={m} onClick={() => { setMode(m); resetViz(); setPos([0, 0]); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mode === m ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m === "play" ? "Play manually" : m === "solve" ? "Auto solve" : "Edit walls"}
                </button>
              ))}
            </div>
            {mode === "play" && (
              <div className="grid w-40 grid-cols-3 gap-1">
                <span /><Btn onClick={() => moveBy(-1, 0)}>↑</Btn><span />
                <Btn onClick={() => moveBy(0, -1)}>←</Btn><Btn onClick={() => moveBy(1, 0)}>↓</Btn><Btn onClick={() => moveBy(0, 1)}>→</Btn>
              </div>
            )}
            {mode !== "play" && (
              <div className="flex flex-wrap items-center gap-2">
                <Btn onClick={() => setRunning((x) => !x)}>{running ? "Pause" : "Run"}</Btn>
                <Btn onClick={() => { setRunning(false); stepOnce(); }}>Step</Btn>
                <Btn onClick={resetViz}>Reset</Btn>
                <label className="flex items-center gap-2 text-sm">Speed
                  <input type="range" min={10} max={400} value={410 - speed} onChange={(e) => setSpeed(410 - Number(e.target.value))} />
                </label>
              </div>
            )}
            <div className="flex gap-2"><Btn onClick={() => newMaze()}>New maze</Btn><Btn onClick={() => { setPos([0, 0]); resetViz(); }}>Restart</Btn></div>
            <p className="rounded-lg bg-muted p-3 font-mono text-sm" aria-live="polite">{status}</p>
            {mode !== "play" && <p className="text-xs text-muted-foreground">Operations: {count}. Orange = current, light = visited, red = dead end, green = solution.</p>}
          </div>
          <div className="card-surface space-y-2 p-5 text-sm">
            <h2 className="text-lg font-bold">How backtracking works</h2>
            <p><b>Recursion:</b> solve(cell) asks solve(neighbour) for each direction — the same question, one step smaller.</p>
            <p><b>Visited set:</b> each cell is marked so the bot never walks in circles.</p>
            <p><b>Backtracking:</b> when all four directions fail, the cell is removed from the path and we return to the previous cell.</p>
            <p><b>Complexity:</b> each cell is visited at most once, so time is O(rows × cols) and the call stack can grow up to that too.</p>
            <pre className="overflow-x-auto rounded-lg bg-ide p-3 font-mono text-xs text-ide-foreground">{`solve(r, c):
  if outside or wall or visited: return false
  mark visited; path.push(r,c)
  if (r,c) == goal: return true
  for dir in [Down, Right, Up, Left]:
    if solve(next): return true
  path.pop()   # backtrack
  return false`}</pre>
          </div>
        </div>
      </div>
    </main>
  );
}

function Btn(p: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={p.onClick} className="rounded-lg border bg-card px-3 py-1.5 text-sm font-semibold hover:bg-muted">{p.children}</button>;
}
