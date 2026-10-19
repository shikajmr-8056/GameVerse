import { Link, useRouterState } from "@tanstack/react-router";
import { Gamepad2, Cpu, Code2, FolderKanban, Compass, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useProgress, update, levelOf, type Grade } from "@/lib/progress";

const NAV = [
  { to: "/", label: "Explore", icon: Compass, exact: true },
  { to: "/playlab", label: "PlayLab", icon: Gamepad2 },
  { to: "/circuitverse", label: "CircuitVerse", icon: Cpu },
  { to: "/codeverse", label: "CodeVerse", icon: Code2 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const p = useProgress();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const lvl = levelOf(p.xp);
  const pct = ((p.xp % 200) / 200) * 100;

  const side = (
    <nav className="flex h-full flex-col gap-1 p-4" aria-label="Explore & Labs">
      <div className="mb-6 px-2">
        <div className="font-display text-xl font-bold">VidyaVerse</div>
        <div className="text-xs opacity-60">Explore & Labs</div>
      </div>
      {NAV.map((n) => {
        const active = "exact" in n ? path === n.to : path.startsWith(n.to);
        return (
          <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-sidebar-accent text-primary" : "hover:bg-sidebar-accent/60"}`}>
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
      <div className="mt-auto rounded-xl bg-sidebar-accent p-3 text-sm">
        <input aria-label="Your name" value={p.name} onChange={(e) => update((s) => ({ ...s, name: e.target.value }))}
          className="w-full bg-transparent font-semibold outline-none" />
        <label className="mt-2 flex items-center justify-between text-xs opacity-80">
          Class
          <select value={p.grade} onChange={(e) => update((s) => ({ ...s, grade: Number(e.target.value) as Grade }))}
            className="rounded bg-sidebar px-2 py-1">
            {[5, 6, 7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <div className="mt-3 flex justify-between text-xs"><span>Level {lvl}</span><span>{p.xp} XP</span></div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sidebar"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
        <div className="mt-2 text-xs opacity-60">{p.achievements.length} achievements</div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-sidebar text-sidebar-foreground lg:block">{side}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 bg-sidebar text-sidebar-foreground">{side}</aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b px-4 py-3 lg:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <span className="font-display font-bold">VidyaVerse</span>
          {open && <X className="hidden" />}
        </header>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, back, right }: { title: string; sub?: string; back?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-6 pb-4 md:px-8">
      <div>
        {back && <Link to={back} className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>}
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
