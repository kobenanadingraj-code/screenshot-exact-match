import { createFileRoute } from "@tanstack/react-router";
import { DocumentsWorkspace } from "@/components/field/documents";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/_authenticated/escalations")({
  head: () =>
    pageHead(
      "NOC Escalation",
      "Prepare evidence-led NOC escalation documents with priority, outstanding questions, and engineer validation.",
    ),
  component: EscalationsPage,
});
function EscalationsPage() {
  return <DocumentsWorkspace kind="escalation" />;
}
