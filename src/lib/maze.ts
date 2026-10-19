export type Grid = number[][]; // 0 open, 1 wall
export type Step =
  | { kind: "visit"; r: number; c: number; depth: number }
  | { kind: "back"; r: number; c: number }
  | { kind: "found"; path: [number, number][] }
  | { kind: "fail" };

const DIRS: [number, number, string][] = [[1, 0, "Down"], [0, 1, "Right"], [-1, 0, "Up"], [0, -1, "Left"]];

/** Classic Rat-in-a-Maze recursive backtracking, written as a generator so every real operation can be visualised. */
export function* ratInMaze(g: Grid, start: [number, number], end: [number, number]): Generator<Step> {
  const n = g.length, m = g[0].length;
  const visited = g.map((row) => row.map(() => false));
  const path: [number, number][] = [];
  function* solve(r: number, c: number): Generator<Step, boolean> {
    if (r < 0 || c < 0 || r >= n || c >= m || g[r][c] === 1 || visited[r][c]) return false;
    visited[r][c] = true;
    path.push([r, c]);
    yield { kind: "visit", r, c, depth: path.length };
    if (r === end[0] && c === end[1]) return true;
    for (const [dr, dc] of DIRS) if (yield* solve(r + dr, c + dc)) return true;
    path.pop();
    yield { kind: "back", r, c };
    return false;
  }
  if (yield* solve(start[0], start[1])) yield { kind: "found", path: [...path] };
  else yield { kind: "fail" };
}

export function solvePath(g: Grid, s: [number, number], e: [number, number]) {
  for (const st of ratInMaze(g, s, e)) if (st.kind === "found") return st.path;
  return null;
}

/** Random maze via randomized DFS carving on an odd-sized grid; always solvable. */
export function generateMaze(size: number): Grid {
  const n = size % 2 ? size : size + 1;
  const g: Grid = Array.from({ length: n }, () => Array(n).fill(1));
  const stack: [number, number][] = [[0, 0]];
  g[0][0] = 0;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const opts = DIRS.map(([dr, dc]) => [r + dr * 2, c + dc * 2, r + dr, c + dc]).filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < n && nc < n && g[nr][nc] === 1);
    if (!opts.length) { stack.pop(); continue; }
    const [nr, nc, wr, wc] = opts[Math.floor(Math.random() * opts.length)];
    g[wr][wc] = 0; g[nr][nc] = 0; stack.push([nr, nc]);
  }
  // open a few extra walls for loops
  for (let i = 0; i < n; i++) { const r = Math.floor(Math.random() * n), c = Math.floor(Math.random() * n); if (r % 2 !== c % 2) g[r][c] = 0; }
  return g;
}
