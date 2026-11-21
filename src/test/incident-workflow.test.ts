import { describe, expect, it } from "vitest";
import { sampleIncidents, type Incident } from "@/lib/demo";
import {
  nextIncidentId,
  validateIncident,
  filterIncidents,
  dashboardStats,
  diagnosisForIncident,
  generateIncidentAnalysis,
  reportFromIncident,
  canSetIncidentStatus,
} from "@/lib/incident-workflow";
const sample = sampleIncidents[0];
if (!sample) throw new Error("Demo incident required");
const incident: Incident = {
  ...sample,
  id: "INC-2026-006",
  site: "TEST-IP-001",
  model: "Engineer supplied router",
  domain: "IP",
  category: "IP router",
  description: "OSPF adjacency unavailable",
  alarms: "Neighbor down",
  observations: "Interface LED observed lit; no reachability test performed.",
  date: "2026-11-21T21:00",
  status: "New",
};
describe("Complete local incident workflow", () => {
  it("generates nonduplicated IDs after deletion and uses the current requested year", () => {
    expect(nextIncidentId([{ ...incident, id: "INC-2026-007" }, sample], 2026)).toBe(
      "INC-2026-008",
    );
    expect(nextIncidentId([incident], 2027)).toBe("INC-2027-001");
  });
  it("validates required site, equipment, description, and date fields", () => {
    expect(validateIncident(incident)).toBeNull();
    expect(validateIncident({ ...incident, site: "" })).toBe("Site ID is required.");
    expect(validateIncident({ ...incident, category: "" })).toBe("Equipment category is required.");
    expect(validateIncident({ ...incident, description: "" })).toBe(
      "Incident description must contain at least 3 characters.",
    );
    expect(validateIncident({ ...incident, date: "" })).toBe(
      "A valid incident date and time is required.",
    );
  });
  it("filters by search, severity, and status and sorts by incident date", () => {
    const rows = [sample, incident];
    expect(
      filterIncidents(rows, "TEST-IP", "New", "High", "Newest first").map((i) => i.id),
    ).toEqual(["INC-2026-006"]);
    expect(filterIncidents(rows, "", "All statuses", "Critical", "Newest first")).toEqual([]);
    expect(
      filterIncidents(rows, "", "All statuses", "All severities", "Oldest first").map((i) => i.id),
    ).toEqual(["INC-2026-001", "INC-2026-006"]);
  });
  it("derives live KPI counts from created, updated, deleted, and linked report records", () => {
    expect(dashboardStats([sample, incident], [])).toEqual({
      total: 2,
      open: 2,
      critical: 0,
      reports: 0,
      pending: 0,
    });
    expect(
      dashboardStats([{ ...incident, status: "Pending Escalation", severity: "Critical" }], []),
    ).toEqual({ total: 1, open: 1, critical: 1, reports: 0, pending: 1 });
    expect(
      dashboardStats(
        [{ ...incident, status: "Resolved" }],
        [
          {
            id: "RPT-1",
            kind: "report",
            incidentId: incident.id,
            title: "Report",
            content: "",
            validated: false,
            date: incident.date,
          },
        ],
      ),
    ).toEqual({ total: 1, open: 0, critical: 0, reports: 1, pending: 0 });
    expect(dashboardStats([], [])).toEqual({
      total: 0,
      open: 0,
      critical: 0,
      reports: 0,
      pending: 0,
    });
  });
  it("builds seven analysis sections from the actual IP incident without asserting unknown measurements", () => {
    const result = generateIncidentAnalysis(incident);
    expect(result.incidentId).toBe("INC-2026-006");
    expect(result.sections.map((s) => s.id)).toEqual([
      "facts",
      "missing",
      "hypotheses",
      "steps",
      "expected",
      "escalation",
      "next",
    ]);
    expect(result.sections[0]?.text).toContain(
      "Interface LED observed lit; no reachability test performed.",
    );
    expect(result.sections[0]?.text).toContain("Neighbor down");
    expect(result.sections[2]?.text).toContain("HYPOTHESES ONLY — NOT CONFIRMED");
    expect(result.sections[3]?.text).toContain("Review IP interfaces and routing adjacency");
  });
  it("creates manual diagnostic checks with a reason and expected observation, never a performed status", () => {
    const steps = diagnosisForIncident(incident);
    expect(steps.every((s) => s.status === "Not Started" && s.result === "")).toBe(true);
    expect(steps.every((s) => Boolean(s.reason && s.expected))).toBe(true);
    expect(steps[2]?.title).toBe("Review IP interfaces and routing adjacency");
  });
  it("generates the report from the correct incident and only manually verified outcomes", () => {
    const steps = diagnosisForIncident(incident).map((s, index) =>
      index === 0
        ? { ...s, status: "Verified" as const, result: "Indicator green at 21:05" }
        : { ...s, result: "UNVERIFIED ASSUMPTION" },
    );
    const report = reportFromIncident(incident, steps);
    expect(report).toContain("INC-2026-006");
    expect(report).toContain("TEST-IP-001");
    expect(report).toContain("OSPF adjacency unavailable");
    expect(report).toContain("Indicator green at 21:05");
    expect(report).not.toContain("UNVERIFIED ASSUMPTION");
    expect(report).toContain("New. No AI-confirmed resolution.");
  });
  it("requires explicit engineer confirmation and recorded verified evidence for resolution", () => {
    const steps = diagnosisForIncident(incident);
    expect(canSetIncidentStatus("Resolved", true, steps)).toBe(false);
    expect(canSetIncidentStatus("Closed", true, steps)).toBe(false);
    const verified = steps.map((s, index) =>
      index === 0
        ? { ...s, status: "Verified" as const, result: "Authorized verification performed" }
        : s,
    );
    expect(canSetIncidentStatus("Resolved", false, verified)).toBe(false);
    expect(canSetIncidentStatus("Resolved", true, verified)).toBe(true);
  });
});
