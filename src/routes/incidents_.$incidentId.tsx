import { createFileRoute } from "@tanstack/react-router";
import { IncidentDetail } from "@/components/field/incident-detail";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/incidents_/$incidentId")({
  head: ({ params }) =>
    pageHead(
      `Incident ${params.incidentId}`,
      "Review incident observations, timeline, diagnostic actions, and engineer-validated documents.",
    ),
  component: IncidentPage,
});
function IncidentPage() {
  const { incidentId } = Route.useParams();
  return <IncidentDetail key={incidentId} incidentId={incidentId} />;
}
