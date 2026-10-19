import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/playlab/bharat")({
  head: () => ({
    meta: [
      { title: "Bharat Explorer — VidyaVerse" },
      { name: "description", content: "Bharat Explorer: the India exploration game for Classes 5–12." },
      { property: "og:title", content: "Bharat Explorer — VidyaVerse" },
      { property: "og:description", content: "Bharat Explorer: the India exploration game." },
    ],
  }),
  component: () => (
    <main>
      <PageHeader title="Bharat Explorer" sub="Coming soon — the India exploration game is still being built." />
    </main>
  ),
});
