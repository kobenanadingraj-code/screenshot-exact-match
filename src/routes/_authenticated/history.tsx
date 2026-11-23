import { createFileRoute } from "@tanstack/react-router";
import { ActivityHistory } from "@/components/field/library";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/_authenticated/history")({
  head: () =>
    pageHead(
      "Activity History",
      "Review your saved incidents, diagnostic verifications, reports, and escalations.",
    ),
  component: ActivityHistory,
});
