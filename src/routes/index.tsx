import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Cpu, Code2, Trophy } from "lucide-react";
import { useProgress, levelOf } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VidyaVerse Explore & Labs — Learn by playing, building, coding" },
      { name: "description", content: "Math Ludo, MazeBot, Newton's Carrom, a circuit simulator and a coding lab for Classes 5–12." },
      { property: "og:title", content: "VidyaVerse Explore & Labs" },
      { property: "og:description", content: "Educational games, a circuit lab and coding challenges for Indian school students." },
    ],
  }),
  component: Index,
});

const MODS = [
  { to: "/playlab", title: "PlayLab", icon: Gamepad2, tone: "bg-play", text: "Four learning games: Math Ludo, MazeBot, Newton's Carrom and Bharat Explorer." },
  { to: "/circuitverse", title: "CircuitVerse", icon: Cpu, tone: "bg-circuit", text: "Build circuits with batteries, resistors, LEDs and capacitors and watch them really run." },
  { to: "/codeverse", title: "CodeVerse", icon: Code2, tone: "bg-code", text: "Lessons and coding challenges in Python, JavaScript and HTML with a real judge." },
] as const;

function Index() {
  const p = useProgress();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Namaste, {p.name}</p>
      <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">What will you explore today?</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {MODS.map((m) => (
          <Link key={m.to} to={m.to} className="card-surface group p-6 transition-transform hover:-translate-y-1">
            <div className={`inline-flex rounded-xl ${m.tone} p-3 text-primary-foreground`}><m.icon className="h-6 w-6" /></div>
            <h2 className="mt-4 text-2xl font-bold">{m.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-primary group-hover:underline">Open →</span>
          </Link>
        ))}
      </div>
      <section className="card-surface mt-8 grid gap-4 p-6 sm:grid-cols-4">
        <Stat label="Level" value={levelOf(p.xp)} />
        <Stat label="XP" value={p.xp} />
        <Stat label="Problems solved" value={p.solved.length} />
        <Stat label="Missions done" value={p.bharat.done.length} />
      </section>
      {p.achievements.length > 0 && (
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-primary" /> Achievements</h2>
          <div className="mt-3 flex flex-wrap gap-2">{p.achievements.map((a) => <span key={a} className="rounded-full bg-accent px-3 py-1 text-sm">{a}</span>)}</div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div><div className="text-3xl font-bold font-display">{value}</div><div className="text-sm text-muted-foreground">{label}</div></div>;
}
