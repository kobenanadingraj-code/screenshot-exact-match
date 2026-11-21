import { reportFromIncident } from "./incident-workflow";
export type IncidentStatus =
  "New" | "Under Analysis" | "In Progress" | "Pending Escalation" | "Resolved" | "Closed";
export type Severity = "Critical" | "High" | "Medium" | "Low";
export type CheckStatus = "Not Started" | "In Progress" | "Verified" | "Not Applicable";
export interface Incident {
  id: string;
  site: string;
  location: string;
  category: string;
  model: string;
  domain: string;
  description: string;
  alarms: string;
  date: string;
  severity: Severity;
  status: IncidentStatus;
  observations: string;
  attachments: string[];
}
export interface DiagnosticStep {
  id: string;
  title: string;
  description: string;
  reason?: string;
  expected?: string;
  status: CheckStatus;
  result: string;
}
export interface DemoMessage {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
  time: string;
}
export interface Thread {
  id: string;
  title: string;
  messages: DemoMessage[];
}
export interface Activity {
  id: string;
  title: string;
  type: string;
  incident: string;
  time: string;
}
export interface SavedDocument {
  source?: string;
  id: string;
  kind: "report" | "escalation";
  incidentId: string;
  title: string;
  content: string;
  validated: boolean;
  date: string;
}

export const sampleIncidents: Incident[] = [
  {
    id: "INC-2026-001",
    site: "SITE-DEMO-001",
    location: "Abidjan · Demonstration site",
    category: "Transmission equipment",
    model: "Not provided",
    domain: "Transmission",
    description: "Loss of communication with supervision.",
    alarms: "Communication unavailable",
    date: "2026-11-20T08:42",
    severity: "High",
    status: "Under Analysis",
    observations:
      "Physical equipment status not yet verified. No confirmed root cause. No corrective action confirmed.",
    attachments: [],
  },
  {
    id: "INC-2026-002",
    site: "ABJ-PLT-024",
    location: "Plateau, Abidjan · Sample",
    category: "BBU",
    model: "Sample BBU unit",
    domain: "RAN",
    description: "Intermittent radio unit connectivity reported in this simulated record.",
    alarms: "Radio link unavailable (sample)",
    date: "2026-11-20T09:10",
    severity: "Critical",
    status: "In Progress",
    observations: "Illustrative record. No real network data.",
    attachments: [],
  },
  {
    id: "INC-2026-003",
    site: "YAM-CTR-012",
    location: "Yamoussoukro · Sample",
    category: "Rectifier",
    model: "Sample power module",
    domain: "Power",
    description: "Power supply warning in a simulated site record.",
    alarms: "DC supply warning (sample)",
    date: "2026-11-20T07:50",
    severity: "Medium",
    status: "Pending Escalation",
    observations: "Illustrative record. No real measurements.",
    attachments: [],
  },
  {
    id: "INC-2026-004",
    site: "BKE-NTH-008",
    location: "Bouaké · Sample",
    category: "Fiber link",
    model: "Sample optical link",
    domain: "Transmission",
    description: "Optical link interruption in sample historical record.",
    alarms: "Loss of signal (sample)",
    date: "2026-11-19T16:30",
    severity: "Low",
    status: "Resolved",
    observations: "Resolved status belongs only to this clearly simulated historical record.",
    attachments: [],
  },
  {
    id: "INC-2026-005",
    site: "ABJ-COC-031",
    location: "Cocody, Abidjan · Sample",
    category: "IP router",
    model: "Sample router",
    domain: "IP",
    description: "Routing adjacency alarm in demonstration record.",
    alarms: "Neighbor unavailable (sample)",
    date: "2026-11-20T10:20",
    severity: "High",
    status: "New",
    observations: "Illustrative record. Verification pending.",
    attachments: [],
  },
];
export const initialSteps: DiagnosticStep[] = [
  {
    id: "physical",
    title: "Verify physical equipment status",
    description:
      "Observe power indicators and visible condition. Record observations; do not infer power status remotely.",
    status: "Not Started",
    result: "",
  },
  {
    id: "power",
    title: "Check the local power supply",
    description:
      "Qualified personnel only: record a safe, authorized supply check using the applicable site procedure.",
    status: "Not Started",
    result: "",
  },
  {
    id: "link",
    title: "Verify the supervision path",
    description:
      "Review authorized interface status and reachability results. Do not change configuration.",
    status: "Not Started",
    result: "",
  },
  {
    id: "alarms",
    title: "Review alarms and event timestamps",
    description:
      "Capture the exact alarm text, start time, and relevant logs from available equipment.",
    status: "Not Started",
    result: "",
  },
  {
    id: "impact",
    title: "Confirm service impact with NOC",
    description: "Ask NOC to verify affected services and correlate network events.",
    status: "Not Started",
    result: "",
  },
];
export const initialActivities: Activity[] = [
  {
    id: "a1",
    title: "Demonstration incident opened",
    type: "Incident",
    incident: "SITE-DEMO-001",
    time: "2026-11-20T08:42:00",
  },
  {
    id: "a2",
    title: "Sample diagnostic checklist prepared",
    type: "Diagnosis",
    incident: "SITE-DEMO-001",
    time: "2026-11-20T09:05:00",
  },
  {
    id: "a3",
    title: "Illustrative report template available",
    type: "Report",
    incident: "BKE-NTH-008",
    time: "2026-11-20T09:22:00",
  },
];
export function validateVerification(status: CheckStatus, result: string): string | null {
  return status === "Verified" && result.trim().length < 3
    ? "Record your observed result before marking this step verified."
    : null;
}
export function canConfirmDocument(validated: boolean): boolean {
  return validated;
}
export function verifiedResults(steps: DiagnosticStep[]): string {
  const verified = steps.filter((step) => step.status === "Verified" && step.result.trim());
  return verified.length
    ? verified.map((step) => `${step.title}: ${step.result}`).join("\n")
    : "No results have been manually verified by the engineer.";
}
export function buildDocument(
  kind: "report" | "escalation",
  incident: Incident,
  steps: DiagnosticStep[],
): string {
  const verified = verifiedResults(steps);
  return kind === "report"
    ? reportFromIncident(incident, steps)
    : `AFFECTED EQUIPMENT\n${incident.category} · ${incident.model}\n\nALARM DESCRIPTION\n${incident.alarms || "Not provided."}\n\nINCIDENT START TIME\n${incident.date.replace("T", " ")} — supplied demonstration record; timezone not provided.\n\nIMPACT\nService impact not confirmed. NOC correlation requested.\n\nTESTS PERFORMED AND RESULTS\n${verified}\n\nACTIONS ALREADY TAKEN\nNo corrective action confirmed.\n\nOUTSTANDING QUESTIONS\nIs the device powered? Is the supervision path reachable? Which services are affected?\n\nSUPPORT REQUESTED\nPlease correlate network events, verify impact, and advise on the supervision path.\n\nATTACHED EVIDENCE\n${incident.attachments.length ? incident.attachments.join(", ") : "No evidence attached."}\n\nENGINEER VALIDATION\nPending explicit engineer validation.`;
}
export function demoResponse(prompt: string, incident: Incident): string {
  const heading = /report/i.test(prompt)
    ? "Intervention report preparation"
    : /escalat|noc/i.test(prompt)
      ? "NOC escalation preparation"
      : /alarm/i.test(prompt)
        ? "Alarm review"
        : /checklist|diagnos/i.test(prompt)
          ? "Diagnostic checklist"
          : "Incident analysis";
  return `## ${heading}\n**Simulated response · human validation required**\n\n### 1. Confirmed facts from the supplied record\n- Site: **${incident.site}**.\n- Equipment: ${incident.category}.\n- Recorded issue: ${incident.description}\n- Observed alarm: ${incident.alarms || "Not provided"}.\n\n### 2. Missing information\n- Physical equipment and power status.\n- Exact equipment model, interface state, and alarm logs.\n- Verified service impact and supervision path reachability.\n\n### 3. Possible hypotheses — not confirmed\nA local power issue, supervision transport interruption, or a device/interface fault could explain the observation. No root cause can be confirmed from the current information.\n\n### 4. Recommended verification\n1. Inspect physical indicators using authorized site safety procedures.\n2. Record local power and interface observations.\n3. Review exact alarm timestamps and approved reachability tests.\n4. Ask NOC to correlate events and confirm affected services.\n\n### 5. Expected results and escalation\nEach check should produce a recorded observation, not an assumed outcome. Escalate if the supervision loss persists, access is unavailable, or service impact is confirmed.\n\n**No tests have been performed automatically. No corrective action or resolution is confirmed.**\n\n_This is a fixed demonstration template, not a connected AI or live network analysis._`;
}
export const knowledgeCategories = [
  "All topics",
  "RAN and Radio",
  "Transmission",
  "IP Networking",
  "Power Systems",
  "BTS Equipment",
  "BBU / RRU / AAU",
  "Fiber Optics",
  "Site Maintenance",
  "Alarm Management",
];
export const knowledgeArticles = [
  {
    id: "k1",
    title: "Supervision connectivity: first observations",
    category: "Transmission",
    minutes: 6,
    description:
      "A sample checklist for organizing equipment status, path information, and alarm evidence.",
    content:
      "Record the exact alarm, start time, equipment identity, and available supervision observations. Separate known facts from assumptions. Physical state, power, and interface status require engineer verification. Use your organization's approved procedures for any tests or changes.",
  },
  {
    id: "k2",
    title: "Radio unit alarms and evidence collection",
    category: "RAN and Radio",
    minutes: 8,
    description: "Structure radio observations before requesting specialist support.",
    content:
      "Record the affected unit identifier and alarm wording. Document observed indicators and timestamps. Request NOC correlation to determine service impact. This sample is not an official vendor troubleshooting procedure.",
  },
  {
    id: "k3",
    title: "Safe power-system documentation",
    category: "Power Systems",
    minutes: 5,
    description: "Document a power-related incident with safety and traceability in mind.",
    content:
      "Only qualified, authorized personnel should inspect electrical systems. Record observations and measurements with units, time, and method. Never assume a power fault without evidence. Consult the approved site safety process.",
  },
  {
    id: "k4",
    title: "IP reachability and routing observations",
    category: "IP Networking",
    minutes: 7,
    description: "Capture interface and reachability evidence without assuming a root cause.",
    content:
      "Record approved reachability test results and interface states. Distinguish a failed test from a confirmed fault. Keep equipment identifiers and timestamps with each observation. Do not change routing configuration without authorization.",
  },
  {
    id: "k5",
    title: "Fiber-link incident handover",
    category: "Fiber Optics",
    minutes: 4,
    description: "Prepare a concise handover for optical transport support.",
    content:
      "Collect exact loss-of-signal alarms, affected endpoint identifiers, and relevant timestamps. Follow approved optical safety procedures. Record only measurements actually taken; never invent optical power readings.",
  },
  {
    id: "k6",
    title: "Building an effective NOC escalation",
    category: "Alarm Management",
    minutes: 5,
    description: "Separate verified findings, outstanding questions, and support requests.",
    content:
      "Include site, incident reference, affected equipment, exact alarms, start time, verified tests, and actual actions. Mark missing information as unknown. State the support requested and attach available evidence. Engineer validation is required before handover.",
  },
];
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | AI FIELD ASSISTANT` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | AI FIELD ASSISTANT` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
