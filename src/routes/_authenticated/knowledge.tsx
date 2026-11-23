import { createFileRoute } from "@tanstack/react-router";
import { Knowledge } from "@/components/field/library";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/_authenticated/knowledge")({
  head: () =>
    pageHead(
      "Knowledge Base",
      "Browse clearly identified sample telecom references for transmission, RAN, power, and incident handover.",
    ),
  component: Knowledge,
});
