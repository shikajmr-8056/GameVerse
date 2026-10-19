import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/codeverse")({
  head: () => ({
    meta: [
      { title: "CodeVerse — VidyaVerse" },
      { name: "description", content: "CodeVerse: the coding lab for Classes 5–12." },
      { property: "og:title", content: "CodeVerse — VidyaVerse" },
      { property: "og:description", content: "CodeVerse: the coding lab." },
    ],
  }),
  component: () => (
    <main>
      <PageHeader title="CodeVerse" sub="Coming soon — the coding lab is still being built." />
    </main>
  ),
});
