import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/playlab/carrom")({
  head: () => ({
    meta: [
      { title: "Newton's Carrom — VidyaVerse" },
      { name: "description", content: "Newton's Carrom: the carrom game for Classes 5–12." },
      { property: "og:title", content: "Newton's Carrom — VidyaVerse" },
      { property: "og:description", content: "Newton's Carrom: the carrom game." },
    ],
  }),
  component: () => (
    <main>
      <PageHeader title="Newton's Carrom" sub="Coming soon — the carrom game is still being built." />
    </main>
  ),
});
