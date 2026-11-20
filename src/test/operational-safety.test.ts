import { describe, it, expect } from "vitest";
import {
  sampleIncidents,
  initialSteps,
  validateVerification,
  verifiedResults,
  canConfirmDocument,
  buildDocument,
  demoResponse,
} from "@/lib/demo";

describe("Telecom operational safeguards", () => {
  it("starts all demo verification checks as Not Started", () => {
    expect(initialSteps.map((step) => step.status)).toEqual([
      "Not Started",
      "Not Started",
      "Not Started",
      "Not Started",
      "Not Started",
    ]);
  });
  it("requires an observed result before an engineer marks a test Verified", () => {
    expect(validateVerification("Verified", "")).toBe(
      "Record your observed result before marking this step verified.",
    );
    expect(validateVerification("Verified", "Power indicator observed on")).toBeNull();
  });
  it("requires explicit human validation to confirm a document", () => {
    expect(canConfirmDocument(false)).toBe(false);
    expect(canConfirmDocument(true)).toBe(true);
  });
  it("does not treat an unverified observation as a performed test", () => {
    const steps = [
      {
        id: "power",
        title: "Check power",
        description: "",
        status: "In Progress" as const,
        result: "Assumed power available",
      },
    ];
    expect(verifiedResults(steps)).toBe("No results have been manually verified by the engineer.");
  });
  it("includes only a manually verified result in reported test outcomes", () => {
    expect(
      verifiedResults([
        {
          id: "power",
          title: "Check power",
          description: "",
          status: "Verified",
          result: "Indicator observed on at 10:05",
        },
      ]),
    ).toBe("Check power: Indicator observed on at 10:05");
  });
  it("uses the requested complete SITE-DEMO-001 scenario without a confirmed root cause or action", () => {
    const demo = sampleIncidents[0];
    expect(demo?.site).toBe("SITE-DEMO-001");
    expect(demo?.category).toBe("Transmission equipment");
    expect(demo?.description).toBe("Loss of communication with supervision.");
    expect(demo?.observations).toBe(
      "Physical equipment status not yet verified. No confirmed root cause. No corrective action confirmed.",
    );
  });
  it("report generation never automatically resolves a fault or records a corrective action", () => {
    const demo = sampleIncidents[0];
    if (!demo) throw new Error("Required demo incident missing");
    const before = structuredClone(initialSteps);
    const report = buildDocument("report", demo, initialSteps);
    expect(report).toContain("No corrective action confirmed.");
    expect(report).toContain("Under Analysis. No AI-confirmed resolution.");
    expect(initialSteps).toEqual(before);
    expect(demo.status).toBe("Under Analysis");
  });
  it("escalation leaves missing service impact and attached evidence unknown", () => {
    const demo = sampleIncidents[0];
    if (!demo) throw new Error("Required demo incident missing");
    const result = buildDocument("escalation", demo, initialSteps);
    expect(result).toContain("Service impact not confirmed. NOC correlation requested.");
    expect(result).toContain("No evidence attached.");
  });
  it("assistant analysis does not mutate verification statuses or incident resolution", () => {
    const demo = sampleIncidents[0];
    if (!demo) throw new Error("Required demo incident missing");
    const before = structuredClone(demo);
    demoResponse("Analyze a telecom incident", demo);
    expect(demo).toEqual(before);
    expect(initialSteps.every((step) => step.status === "Not Started")).toBe(true);
  });
});
