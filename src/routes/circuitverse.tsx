import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/circuitverse")({
  head: () => ({
    meta: [
      { title: "CircuitVerse — VidyaVerse" },
      { name: "description", content: "CircuitVerse: the circuit simulator for Classes 5–12." },
      { property: "og:title", content: "CircuitVerse — VidyaVerse" },
      { property: "og:description", content: "CircuitVerse: the circuit simulator." },
    ],
  }),
  component: () => (
    <main>
      <PageHeader title="CircuitVerse" sub="Coming soon — the circuit simulator is still being built." />
    </main>
  ),
});
