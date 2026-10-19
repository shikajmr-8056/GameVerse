import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useProgress } from "@/lib/progress";
import ludo from "@/assets/ludo.jpg";
import maze from "@/assets/maze.jpg";
import carrom from "@/assets/carrom.jpg";
import bharat from "@/assets/bharat.jpg";

export const Route = createFileRoute("/playlab/")({
  head: () => ({
    meta: [
      { title: "PlayLab — VidyaVerse games" },
      { name: "description", content: "Play Math Ludo, MazeBot, Newton's Carrom and Bharat Explorer." },
      { property: "og:title", content: "PlayLab — VidyaVerse games" },
      { property: "og:description", content: "Educational games for Classes 5–12." },
    ],
  }),
  component: PlayLab,
});

const GAMES = [
  { id: "ludo", to: "/playlab/ludo", img: ludo, title: "Math Ludo", grades: "Class 5–12", diff: "Easy → Hard", text: "Roll the dice, solve a maths question in 10 seconds, then move. Play friends or bots." },
  { id: "maze", to: "/playlab/maze", img: maze, title: "MazeBot", grades: "Class 6–12", diff: "Medium", text: "Guide the bot yourself or watch the backtracking algorithm think step by step." },
  { id: "carrom", to: "/playlab/carrom", img: carrom, title: "Newton's Carrom", grades: "Class 7–12", diff: "Medium", text: "Real collisions and friction. Play a match or experiment in Physics Lab." },
  { id: "bharat", to: "/playlab/bharat", img: bharat, title: "Bharat Explorer", grades: "Class 5–10", diff: "Easy → Advanced", text: "Journey across India's regions through missions, stories and badges." },
] as const;

function PlayLab() {
  const p = useProgress();
  return (
    <main className="pb-10">
      <PageHeader title="PlayLab" sub="Games where every move teaches something." />
      <div className="grid gap-5 px-4 sm:grid-cols-2 md:px-8 xl:grid-cols-4">
        {GAMES.map((g) => {
          const prog = g.id === "bharat" ? Math.round((p.bharat.done.length / 6) * 100) : g.id === "maze" ? Math.min(100, (p.maze.level - 1) * 20) : p.games[g.id] ?? 0;
          return (
            <article key={g.id} className="card-surface flex flex-col overflow-hidden">
              <img src={g.img} alt="" loading="lazy" width={992} height={672} className="aspect-[3/2] w-full object-cover" />
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-xl font-bold">{g.title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{g.text}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-muted px-2 py-0.5">{g.grades}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5">{g.diff}</span>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-success">Works offline</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${prog}%` }} /></div>
                <Link to={g.to} className="mt-4 rounded-lg bg-primary py-2 text-center font-semibold text-primary-foreground hover:opacity-90">Play</Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
