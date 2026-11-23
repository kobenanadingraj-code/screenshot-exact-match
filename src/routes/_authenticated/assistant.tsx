import { createFileRoute, Navigate } from "@tanstack/react-router";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/_authenticated/assistant")({
  head: () =>
    pageHead(
      "AI Assistant",
      "Your telecom copilot for structured incident analysis and technical documentation.",
    ),
  component: AssistantEntry,
});
function AssistantEntry() {
  return <Navigate to="/assistant/$threadId" params={{ threadId: "demo" }} replace />;
}
