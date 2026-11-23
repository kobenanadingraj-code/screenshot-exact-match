import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDemo } from "@/lib/demo-context";
import { filterIncidents } from "@/lib/incident-workflow";
import { pageHead } from "@/lib/demo";
import { PageHeading } from "@/components/field/shared";
import {
  NewIncident,
  IncidentTable,
  IncidentFilters,
  DownloadIncidents,
} from "@/components/field/incidents";
export const Route = createFileRoute("/_authenticated/incidents")({
  head: () =>
    pageHead(
      "Incident Management",
      "Create, track, and document telecom incidents with engineer-controlled statuses.",
    ),
  component: IncidentsPage,
});
function IncidentsPage() {
  const { incidents } = useDemo();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [severity, setSeverity] = useState("All severities");
  const [sort, setSort] = useState("Newest first");
  const filtered = filterIncidents(incidents, search, status, severity, sort);
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
        severity={severity}
        setSeverity={setSeverity}
        sort={sort}
        setSort={setSort}
      />
      <div className="panel">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs">{filtered.length} incidents</span>
          <DownloadIncidents incidents={filtered} />
        </div>
        <IncidentTable incidents={filtered} />
      </div>
    </>
  );
}
