import { describe, expect, expectTypeOf, it } from "vitest";
import type { Incident, DiagnosticStep, SavedDocument, Thread, DemoMessage, Activity, IncidentStatus, Severity, CheckStatus } from "@/lib/demo";
import type { IncidentAnalysis, AnalysisSection } from "@/lib/incident-workflow";
import { sampleIncidents } from "@/lib/demo";
import { incidentSchema, stepSchema, type WorkspaceSnapshot } from "@/lib/workspace-schema";

describe("Workspace record compatibility", () => {
  it("shares incident and check types across UI and saved workspace payloads", () => {
    expectTypeOf<Incident>().toEqualTypeOf<WorkspaceSnapshot["incidents"][number]>();
    expectTypeOf<DiagnosticStep>().toEqualTypeOf<WorkspaceSnapshot["stepsByIncident"][string][number]>();
    expectTypeOf<SavedDocument>().toEqualTypeOf<WorkspaceSnapshot["documents"][number]>();
    expectTypeOf<Thread>().toEqualTypeOf<WorkspaceSnapshot["threads"][number]>();
    expectTypeOf<DemoMessage>().toEqualTypeOf<Thread["messages"][number]>();
    expectTypeOf<Activity>().toEqualTypeOf<WorkspaceSnapshot["activities"][number]>();
    expectTypeOf<IncidentAnalysis>().toEqualTypeOf<WorkspaceSnapshot["analyses"][string]>();
    expectTypeOf<AnalysisSection>().toEqualTypeOf<IncidentAnalysis["sections"][number]>();
    expectTypeOf<IncidentStatus>().toEqualTypeOf<Incident["status"]>();
    expectTypeOf<Severity>().toEqualTypeOf<Incident["severity"]>();
    expectTypeOf<CheckStatus>().toEqualTypeOf<DiagnosticStep["status"]>();
    expectTypeOf<Incident["domain"]>().toEqualTypeOf<"RAN" | "Transmission" | "IP" | "Power" | "Core">();
    for (const incident of sampleIncidents) {
      expect(incidentSchema.safeParse(incident).success).toBe(true);
    }
  });

  it("rejects an unsupported domain before saving", () => {
    expect(incidentSchema.shape.domain.safeParse("Unknown").success).toBe(false);
    expect(incidentSchema.shape.domain.parse("Transmission")).toBe("Transmission");
  });

  it("accepts optional diagnostic context without treating a check as verified", () => {
    const step: DiagnosticStep = {
      id: "power", title: "Observe indicator", description: "Authorized visual observation",
      reason: undefined, expected: undefined, status: "Not Started", result: "",
    };
    expect(stepSchema.parse(step).status).toBe("Not Started");
  });
});