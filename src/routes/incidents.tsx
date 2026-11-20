import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/lib/demo-context";
import { pageHead } from "@/lib/demo";
import { PageHeading } from "@/components/field/shared";
import {
  NewIncident,
  IncidentTable,
  IncidentFilters,
  DownloadIncidents,
} from "@/components/field/incidents";
export const Route = createFileRoute("/incidents")({
  head: () =>
    pageHead(
      "Incident Management",
      "Create, track, and document simulated telecom incidents with engineer-controlled statuses.",
    ),
  component: IncidentsPage,
});
function IncidentsPage() {
  const { incidents } = useDemo();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const filtered = incidents.filter(
    (i) =>
      `${i.id} ${i.site} ${i.category} ${i.domain}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All statuses" || i.status === status),
  );
  return (
    <>
      <PageHeading
        title="Incident Management"
        subtitle="A complete picture of your field incidents."
      >
        <NewIncident />
      </PageHeading>
      <IncidentFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />
      <div className="panel">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs">{filtered.length} demonstration incidents</span>
          <DownloadIncidents incidents={filtered} />
        </div>
        <IncidentTable incidents={filtered} />
      </div>
    </>
  );
}
