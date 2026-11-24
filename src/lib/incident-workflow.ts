import type { Incident, DiagnosticStep, SavedDocument, Severity } from "./demo";
import type { WorkspaceSnapshot } from "./workspace-schema";

export type IncidentAnalysis = WorkspaceSnapshot["analyses"][string];
export type AnalysisSection = IncidentAnalysis["sections"][number];
export function incidentSource(incident: Incident): string {
  return JSON.stringify(incident);
}
export function nextIncidentId(incidents: Incident[], year = new Date().getFullYear()): string {
  const prefix = `INC-${year}-`;
  const maximum = incidents.reduce(
    (max, incident) =>
      incident.id.startsWith(prefix)
        ? Math.max(max, Number(incident.id.slice(prefix.length)) || 0)
        : max,
    0,
  );
  return `${prefix}${String(maximum + 1).padStart(3, "0")}`;
}
export function localDateTime(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
export function validateIncident(incident: Incident): string | null {
  if (!incident.site.trim()) return "Site ID is required.";
  if (!incident.category.trim()) return "Equipment category is required.";
  if (incident.description.trim().length < 3)
    return "Incident description must contain at least 3 characters.";
  if (!incident.date || Number.isNaN(Date.parse(incident.date)))
    return "A valid incident date and time is required.";
  if (!["RAN", "Transmission", "IP", "Power", "Core"].includes(incident.domain))
    return "Select a valid network domain.";
  if (!["Low", "Medium", "High", "Critical"].includes(incident.severity))
    return "Select a valid severity.";
  return null;
}
export function filterIncidents(
  incidents: Incident[],
  search: string,
  status: string,
  severity: string,
  sort: string,
): Incident[] {
  return incidents
    .filter(
      (incident) =>
        `${incident.id} ${incident.site} ${incident.category} ${incident.domain}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (status === "All statuses" || incident.status === status) &&
        (severity === "All severities" || incident.severity === severity),
    )
    .sort(
      (a, b) =>
        (sort === "Oldest first" ? 1 : -1) * a.date.localeCompare(b.date) ||
        a.id.localeCompare(b.id),
    );
}
export function dashboardStats(incidents: Incident[], documents: SavedDocument[]) {
  const open = incidents.filter((i) => !["Resolved", "Closed"].includes(i.status));
  return {
    total: incidents.length,
    open: open.length,
    critical: open.filter((i) => i.severity === "Critical").length,
    reports: documents.filter(
      (d) => d.kind === "report" && incidents.some((i) => i.id === d.incidentId),
    ).length,
    pending: incidents.filter((i) => i.status === "Pending Escalation").length,
  };
}
export function domainDistribution(incidents: Incident[]) {
  return [
    { title: "RAN & Radio", domains: ["RAN"], className: "ran" },
    { title: "Transmission", domains: ["Transmission"], className: "transmission" },
    { title: "Power Systems", domains: ["Power"], className: "power" },
    { title: "IP & Core", domains: ["IP", "Core"], className: "other" },
  ].map((group) => ({
    ...group,
    percentage: incidents.length
      ? Math.round(
          (100 * incidents.filter((i) => group.domains.includes(i.domain)).length) /
            incidents.length,
        )
      : 0,
  }));
}
export function diagnosisForIncident(incident: Incident): DiagnosticStep[] {
  const domainStep: Record<string, { title: string; reason: string; expected: string }> = {
    Transmission: {
      title: "Verify the transmission and supervision path",
      reason: "Distinguish a transport-path issue from equipment or supervision-only loss.",
      expected: "Recorded authorized interface and reachability results; no assumed link state.",
    },
    RAN: {
      title: "Review radio unit and fronthaul connectivity",
      reason: "Correlate the supplied radio alarm with affected unit and fronthaul observations.",
      expected: "Exact affected unit identifiers and observed fronthaul/interface states.",
    },
    IP: {
      title: "Review IP interfaces and routing adjacency",
      reason:
        "Distinguish interface, adjacency, and management-path observations without altering configuration.",
      expected: "Approved reachability results and recorded interface/adjacency states.",
    },
    Power: {
      title: "Review power-system indicators and authorized readings",
      reason:
        "Check whether the reported issue correlates with the local supply without assuming an electrical fault.",
      expected: "Actual indicators or safely obtained readings, with units and time if taken.",
    },
    Core: {
      title: "Correlate core-network alarms and dependencies",
      reason: "Determine which service dependencies require NOC review.",
      expected: "Exact alarms, affected functions, and NOC-confirmed dependency observations.",
    },
  };
  const domain = domainStep[incident.domain] ?? domainStep["Transmission"];
  const base = [
    {
      id: "physical",
      title: "Verify physical equipment status",
      description: "Observe accessible indicators using approved site safety procedures.",
      reason: `Establish the actual condition of ${incident.category} rather than inferring it from the reported alarm.`,
      expected:
        "Recorded indicator states and visible condition, including inaccessible or unknown conditions.",
    },
    {
      id: "power",
      title: "Check the local power supply",
      description: "Only qualified, authorized personnel may perform electrical checks.",
      reason:
        "Determine whether available power observations are relevant to the reported incident.",
      expected: "Actual safe observations or authorized readings; never an invented voltage.",
    },
    {
      id: "domain",
      title: domain?.title ?? "Review network path",
      description: "Read authorized status information and logs; do not modify configuration.",
      reason: domain?.reason ?? "Gather domain-specific evidence.",
      expected: domain?.expected ?? "A recorded observation.",
    },
    {
      id: "alarms",
      title: "Review alarms and event timestamps",
      description: `Capture exact alarm text for ${incident.site} and correlate event times.`,
      reason: "Establish the alarm sequence and distinguish current alarms from historical events.",
      expected: "Recorded alarm text, timestamps, and available event evidence.",
    },
    {
      id: "impact",
      title: "Confirm service impact with NOC",
      description: "Request NOC correlation before declaring service impact or resolution.",
      reason: "Determine affected services and whether specialist escalation is required.",
      expected: "NOC-confirmed impact or an explicit record that impact remains unknown.",
    },
  ];
  return base.map((step) => ({ ...step, status: "Not Started", result: "" }));
}
export function generateIncidentAnalysis(incident: Incident): IncidentAnalysis {
  const steps = diagnosisForIncident(incident);
  const missing = [
    "Verified root-cause evidence and service-impact confirmation.",
    "Relevant interface states, event timestamps, and authorized test results.",
  ];
  if (!incident.location.trim()) missing.unshift("Site location.");
  if (!incident.alarms.trim()) missing.unshift("Exact observed alarm text.");
  if (!incident.observations.trim()) missing.unshift("Technician observations.");
  if (!incident.model.trim() || incident.model === "Not provided")
    missing.unshift("Equipment model.");
  const hypotheses: Record<string, string> = {
    Transmission:
      "A transmission-path interruption, supervision interface issue, or local equipment/power issue could be relevant.",
    RAN: "A radio-unit, fronthaul, synchronization, or local equipment/power issue could be relevant.",
    IP: "An IP interface, routing adjacency, management reachability, or local equipment issue could be relevant.",
    Power:
      "A supply, distribution, or alarm-reporting issue could be relevant; no electrical measurement has been inferred.",
    Core: "A core service dependency, control-plane connectivity, or alarm correlation issue could be relevant.",
  };
  return {
    incidentId: incident.id,
    source: incidentSource(incident),
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: "facts",
        title: "A. Confirmed facts",
        text: `Facts copied from the engineer-supplied record, not independently verified:\nIncident: ${incident.id}\nSite: ${incident.site}\nLocation: ${incident.location || "Not provided"}\nEquipment: ${incident.category} · ${incident.model}\nNetwork domain: ${incident.domain}\nSeverity: ${incident.severity}\nReported issue: ${incident.description}\nObserved alarms: ${incident.alarms || "Not provided"}\nTechnician observations: ${incident.observations || "Not provided"}\nRecorded status: ${incident.status}. This analysis does not confirm resolution.`,
      },
      {
        id: "missing",
        title: "B. Missing information",
        text:
          missing.join("\n") +
          "\nOnly recorded observations are available; no additional measurements have been inferred.",
      },
      {
        id: "hypotheses",
        title: "C. Possible technical hypotheses",
        text: `HYPOTHESES ONLY — NOT CONFIRMED. ${hypotheses[incident.domain] ?? "Additional technical evidence is needed."} The supplied issue “${incident.description}” does not establish any of these as a root cause.`,
      },
      {
        id: "steps",
        title: "D. Recommended verification steps",
        text: steps.map((s, index) => `${index + 1}. ${s.title}: ${s.description}`).join("\n"),
      },
      {
        id: "expected",
        title: "E. Expected results",
        text: steps
          .map((s) => `${s.title}: ${s.expected ?? "Recorded engineer observation."}`)
          .join("\n"),
      },
      {
        id: "escalation",
        title: "F. Escalation conditions",
        text: "Escalate to NOC if the reported issue persists, service impact is confirmed, safe access is unavailable, or the available evidence is insufficient. Priority requires engineer review; no impact is assumed.",
      },
      {
        id: "next",
        title: "G. Recommended next action",
        text: `Open the ${incident.domain} diagnostic checklist for ${incident.site}. Perform only authorized checks, enter actual observed results, and manually validate each completed verification before preparing the intervention report.`,
      },
    ],
  };
}
export function canSetIncidentStatus(
  status: string,
  confirmed: boolean,
  steps: DiagnosticStep[],
): boolean {
  return (
    confirmed &&
    (!["Resolved", "Closed"].includes(status) ||
      steps.some((step) => step.status === "Verified" && step.result.trim().length >= 3))
  );
}
export function reportFromIncident(incident: Incident, steps: DiagnosticStep[]): string {
  const verified = steps.filter(
    (step) => step.status === "Verified" && step.result.trim().length >= 3,
  );
  const checklist = steps.length
    ? steps
        .map((s) => `${s.title}: ${s.status}${s.status === "Verified" ? ` — ${s.result}` : ""}`)
        .join("\n")
    : "No diagnostic checks recorded.";
  return `INCIDENT REFERENCE\n${incident.id}\n\nSITE INFORMATION\n${incident.site} · ${incident.location || "Not provided"}\n\nINCIDENT DESCRIPTION\n${incident.description}\n\nEQUIPMENT INVOLVED\n${incident.category} · ${incident.model} · ${incident.domain}\n\nTECHNICIAN OBSERVATIONS\n${incident.observations || "Not provided."}\nObserved alarms: ${incident.alarms || "Not provided."}\n\nDIAGNOSTIC STEPS\n${checklist}\n\nDIAGNOSTIC PROCESS\nReview of provided observations. Unperformed checks are not recorded as completed.\n\nVERIFIED RESULTS\n${verified.length ? verified.map((s) => `${s.title}: ${s.result}`).join("\n") : "No results have been manually verified by the engineer."}\n\nACTIONS ACTUALLY PERFORMED\n${verified.length ? `Manually recorded verification actions:\n${verified.map((s) => s.title).join("\n")}\n` : ""}No corrective action confirmed. Add only actions actually performed during engineer review.\n\nOUTSTANDING ISSUES\nRoot cause not confirmed by this demonstration. Reported issue: ${incident.description}\n${steps.filter((s) => !["Verified", "Not Applicable"].includes(s.status)).length} verification steps still await completion.\n\nRESOLUTION STATUS\n${incident.status}. No AI-confirmed resolution.\n\nRECOMMENDATIONS — HUMAN REVIEW REQUIRED\n${diagnosisForIncident(
    incident,
  )
    .map((s) => s.title)
    .join("\n")}\n\nTECHNICIAN VALIDATION\nPending explicit engineer validation.`;
}
