import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  CircleHelp,
  FlaskConical,
  ListChecks,
  ScanLine,
  ArrowRight,
  CircleAlert,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDemo } from "@/lib/demo-context";
import {
  initialSteps,
  validateVerification,
  type DiagnosticStep,
  type CheckStatus,
} from "@/lib/demo";
import { PageHeading, IncidentPicker, SafetyNote, Status } from "./shared";
import { toast } from "sonner";

function VerificationStep({
  step,
  onSave,
}: {
  step: DiagnosticStep;
  onSave: (step: DiagnosticStep) => void;
}) {
  const [result, setResult] = useState(step.result);
  const [status, setStatus] = useState<CheckStatus>(step.status);
  return (
    <div className="checklist-step">
      <div className="flex justify-between items-start gap-2">
        <h4>{step.title}</h4>
        {step.status === "Verified" && <CheckCircle2 className="size-4 text-success shrink-0" />}
      </div>
      <p>{step.description}</p>
      <Textarea
        aria-label={`Observed result: ${step.title}`}
        value={result}
        onChange={(e) => setResult(e.target.value)}
        placeholder="Your observed result…"
        className="mt-3 text-[11px] min-h-16"
      />
      <div className="flex gap-2 mt-2">
        <select
          className="select-control text-[10px] h-8"
          aria-label={`Verification status: ${step.title}`}
          value={status}
          onChange={(e) => setStatus(e.target.value as CheckStatus)}
        >
          {["Not Started", "In Progress", "Verified", "Not Applicable"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const error = validateVerification(status, result);
            if (error) {
              toast.error(error);
              return;
            }
            onSave({ ...step, status, result });
            toast.success("Engineer verification saved for this demo session.");
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
export function Diagnosis() {
  const {
    incidents,
    activeIncidentId,
    setActiveIncidentId,
    stepsByIncident,
    setStepsByIncident,
    addActivity,
  } = useDemo();
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState(false);
  const incident = incidents.find((i) => i.id === activeIncidentId) ?? incidents[0];
  if (!incident) return <p>No incident available.</p>;
  const steps = stepsByIncident[incident.id] ?? initialSteps.map((s) => ({ ...s }));
  const verified = steps.filter((s) => s.status === "Verified").length;
  return (
    <>
      <PageHeading
        title="Smart Diagnosis"
        subtitle="Separate what you know from what needs verification."
      >
        <div className="w-full sm:w-72">
          <IncidentPicker
            incidents={incidents}
            value={incident.id}
            onChange={(id) => {
              setActiveIncidentId(id);
              setSuggestion(false);
            }}
          />
        </div>
      </PageHeading>
      <div className="diagnosis-grid">
        <aside className="panel panel-padding space-y-6">
          <div>
            <h2 className="text-sm font-semibold mb-3">Incident summary</h2>
            <span className="technical text-primary">{incident.site}</span>
            <p className="text-[11px] text-muted-foreground leading-7 mt-3">
              {incident.description}
            </p>
            <Status value={incident.severity} />
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="text-xs font-medium">Equipment details</h3>
            <p className="text-xs text-muted-foreground leading-7 mt-2">
              {incident.category}
              <br />
              Model: {incident.model}
              <br />
              Domain: {incident.domain}
            </p>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="text-xs font-medium">Observed alarms</h3>
            <p className="text-xs text-warning leading-7 mt-2">
              {incident.alarms || "Not provided"}
            </p>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="text-xs font-medium">Technical observations</h3>
            <p className="text-xs text-muted-foreground leading-7 mt-2">
              {incident.observations || "Not provided"}
            </p>
          </div>
          <Button asChild variant="outline" className="w-full text-xs">
            <Link to="/incidents/$incidentId" params={{ incidentId: incident.id }}>
              View incident
              <ArrowRight />
            </Link>
          </Button>
        </aside>
        <section className="panel panel-padding">
          <div className="flex gap-2 items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex gap-2 items-center">
              <ScanLine className="size-4 text-primary" />
              Diagnostic analysis
            </h2>
            <span className="demo-pill">SIMULATED</span>
          </div>
          <SafetyNote />
          {[
            {
              title: "Confirmed facts",
              icon: CheckCircle2,
              tone: "text-success",
              text: `The supplied record reports: ${incident.description} The observed alarm is “${incident.alarms || "not provided"}”. Equipment category: ${incident.category}.`,
            },
            {
              title: "Missing information",
              icon: CircleHelp,
              tone: "text-info",
              text: "Physical state, power availability, exact model, interface status, alarm timestamps, supervision path reachability, and verified service impact have not been supplied.",
            },
            {
              title: "Possible technical hypotheses",
              icon: FlaskConical,
              tone: "text-warning",
              text: "Hypotheses only — not confirmed: local power interruption, supervision-path loss, or an equipment/interface issue. The current observations do not establish a root cause.",
            },
            {
              title: "Recommended verification steps",
              icon: ListChecks,
              tone: "text-primary",
              text: "Inspect physical indicators, safely review the local supply, gather interface and path evidence, review exact alarms, and correlate with NOC. Use authorized procedures and record actual observations.",
            },
            {
              title: "Expected results",
              icon: ScanLine,
              tone: "text-info",
              text: "Each verification should produce an observable result, including time and method where available. An unsuccessful test is evidence, not a confirmed diagnosis.",
            },
            {
              title: "Escalation conditions",
              icon: CircleAlert,
              tone: "text-warning",
              text: "Escalate if loss of supervision persists, safe access is unavailable, the available evidence is insufficient, or NOC confirms significant service impact.",
            },
          ].map((section, index) => (
            <div className="analysis-section" key={section.title}>
              <h3>
                <section.icon className={`size-4 ${section.tone}`} />
                {index + 1}. {section.title}
              </h3>
              <p>{section.text}</p>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full text-xs"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(() => {
                setBusy(false);
                setSuggestion(true);
                addActivity("Sample next verification requested", "Diagnosis", incident.site);
              }, 650);
            }}
          >
            {busy ? <LoaderCircle className="animate-spin" /> : <ScanLine />}Suggest next
            verification
          </Button>
          {suggestion && (
            <div className="safety-note mt-4">
              Sample suggestion:{" "}
              {steps.find((s) => s.status === "Not Started")?.title ??
                "Review recorded evidence with NOC."}{" "}
              No check has been marked completed.
            </div>
          )}
        </section>
        <aside className="panel panel-padding">
          <h2 className="text-sm font-semibold mb-3">Engineer verification</h2>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
            <span>Manually verified</span>
            <span>
              {verified} / {steps.length}
            </span>
          </div>
          <progress className="w-full h-1.5 accent-primary" max={steps.length} value={verified} />
          <p className="text-[10px] text-muted-foreground leading-6 mt-3">
            Only you can validate a performed check.
          </p>
          {steps.map((step) => (
            <VerificationStep
              key={`${incident.id}-${step.id}`}
              step={step}
              onSave={(updated) => {
                setStepsByIncident((prev) => ({
                  ...prev,
                  [incident.id]: steps.map((s) => (s.id === updated.id ? updated : s)),
                }));
                addActivity(
                  `Engineer marked check ${updated.status.toLowerCase()}`,
                  "Diagnosis",
                  incident.site,
                );
              }}
            />
          ))}
          <Button asChild className="w-full mt-5 text-xs">
            <Link to="/reports">
              Prepare intervention report
              <ArrowRight />
            </Link>
          </Button>
        </aside>
      </div>
    </>
  );
}
