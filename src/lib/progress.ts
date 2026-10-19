import { useSyncExternalStore } from "react";

export type Grade = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export interface Progress {
  name: string;
  grade: Grade;
  xp: number;
  achievements: string[];
  games: Record<string, number>; // 0-100
  maze: { level: number };
  bharat: { done: string[] };
  labs: string[];
  solved: string[];
  submissions: { id: string; problem: string; lang: string; verdict: string; at: number; ms: number }[];
  mathLog: { topic: string; correct: boolean; ms: number }[];
}

const KEY = "vidyaverse-progress-v1";
const DEFAULT: Progress = {
  name: "Student", grade: 7, xp: 0, achievements: [], games: {}, maze: { level: 1 },
  bharat: { done: [] }, labs: [], solved: [], submissions: [], mathLog: [],
};

let state: Progress = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw) };
  } catch { /* ignore */ }
}

export function update(fn: (p: Progress) => Progress) {
  load();
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function addXp(n: number, achievement?: string) {
  update((p) => ({
    ...p, xp: p.xp + n,
    achievements: achievement && !p.achievements.includes(achievement) ? [...p.achievements, achievement] : p.achievements,
  }));
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => { load(); listeners.add(l); l(); return () => listeners.delete(l); },
    () => { load(); return state; },
    () => DEFAULT,
  );
}

export const levelOf = (xp: number) => Math.floor(xp / 200) + 1;
