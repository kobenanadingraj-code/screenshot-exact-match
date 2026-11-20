import { createFileRoute } from "@tanstack/react-router";
import { DocumentsWorkspace } from "@/components/field/documents";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/reports")({
  head: () =>
    pageHead(
      "Intervention Reports",
      "Prepare, review, and export simulated telecom intervention reports in PDF and DOCX.",
    ),
  component: ReportsPage,
});
function ReportsPage() {
  return <DocumentsWorkspace kind="report" />;
}
