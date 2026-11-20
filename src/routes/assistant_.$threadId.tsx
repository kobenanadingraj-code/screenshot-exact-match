import { createFileRoute } from "@tanstack/react-router";
import { AssistantWorkspace } from "@/components/field/assistant";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/assistant_/$threadId")({
  head: ({ params }) =>
    pageHead(
      `AI Assistant · ${params.threadId === "demo" ? "Demo scenario" : "Conversation"}`,
      "Structured simulated telecom recommendations, missing information, and engineer-reviewed diagnostic guidance.",
    ),
  component: ThreadPage,
});
function ThreadPage() {
  const { threadId } = Route.useParams();
  return <AssistantWorkspace key={threadId} threadId={threadId} />;
}
