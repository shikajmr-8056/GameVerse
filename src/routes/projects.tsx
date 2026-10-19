import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — VidyaVerse" },
      { name: "description", content: "Your VidyaVerse projects." },
      { property: "og:title", content: "Projects — VidyaVerse" },
      { property: "og:description", content: "Your VidyaVerse projects." },
    ],
  }),
  component: () => (
    <main>
      <PageHeader title="Projects" sub="Projects stay in the main VidyaVerse app. This page keeps its place in the menu unchanged." />
    </main>
  ),
});
