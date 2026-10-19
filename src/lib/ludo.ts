/**
 * Math Ludo rules (shared by every mode):
 * - Each player has 4 tokens. A 6 is needed to leave base.
 * - Tokens travel 51 cells of the common track, then 5 home-column cells, then reach home (progress 56).
 * - Exact roll needed to reach home. Rolling a 6 grants another turn.
 * - Landing on an opponent on a non-safe cell sends it back to base and grants another turn.
 * - Safe cells: each colour's start cell and the four star cells.
 * - First player with all 4 tokens home wins.
 */
export type Color = "red" | "green" | "yellow" | "blue";
export const COLORS: Color[] = ["red", "green", "yellow", "blue"];
export const START: Record<Color, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
export const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
export const HOME = 56;

export const TRACK: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0],
];
export const HOME_COL: Record<Color, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};
export const BASE: Record<Color, [number, number][]> = {
  red: [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]],
  green: [[1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]],
  yellow: [[10.5, 10.5], [10.5, 12.5], [12.5, 10.5], [12.5, 12.5]],
  blue: [[10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]],
};

export interface Player { color: Color; bot: boolean; tokens: number[] } // -1 base, 0..50 track, 51..55 home column, 56 home

export const absCell = (c: Color, p: number) => (p >= 0 && p <= 50 ? (START[c] + p) % 52 : -1);

export function cellOf(c: Color, p: number, i: number): [number, number] {
  if (p < 0) return BASE[c][i];
  if (p <= 50) return TRACK[absCell(c, p)];
  if (p < HOME) return HOME_COL[c][p - 51];
  return [7, 7];
}

export function legalMoves(pl: Player, roll: number): number[] {
  return pl.tokens.flatMap((p, i) => {
    if (p === HOME) return [];
    if (p < 0) return roll === 6 ? [i] : [];
    return p + roll <= HOME ? [i] : [];
  });
}

export interface MoveResult { players: Player[]; captured: boolean; finished: boolean }

export function applyMove(players: Player[], who: number, token: number, roll: number): MoveResult {
  const next = players.map((p) => ({ ...p, tokens: [...p.tokens] }));
  const me = next[who];
  const cur = me.tokens[token];
  const np = cur < 0 ? 0 : cur + roll;
  me.tokens[token] = np;
  let captured = false;
  const cell = absCell(me.color, np);
  if (cell >= 0 && !SAFE.has(cell)) {
    next.forEach((o, oi) => {
      if (oi === who) return;
      o.tokens = o.tokens.map((t) => { if (absCell(o.color, t) === cell) { captured = true; return -1; } return t; });
    });
  }
  return { players: next, captured, finished: me.tokens.every((t) => t === HOME) };
}

/** Bot picks: capture > finish > leave base > advance furthest-behind safe-ish token. */
export function botChoose(players: Player[], who: number, roll: number): number {
  const moves = legalMoves(players[who], roll);
  let best = moves[0], bestScore = -Infinity;
  for (const m of moves) {
    const res = applyMove(players, who, m, roll);
    const np = res.players[who].tokens[m];
    let s = 0;
    if (res.captured) s += 100;
    if (np === HOME) s += 60;
    if (players[who].tokens[m] < 0) s += 40;
    if (SAFE.has(absCell(players[who].color, np))) s += 15;
    s += np / 10;
    if (s > bestScore) { bestScore = s; best = m; }
  }
  return best;
}
