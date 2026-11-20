import { createFileRoute } from "@tanstack/react-router";
import { ActivityHistory } from "@/components/field/library";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/history")({
  head: () =>
    pageHead(
      "Activity History",
      "Review this session’s demonstration incidents, diagnostic verifications, reports, and escalations.",
    ),
  component: ActivityHistory,
});
