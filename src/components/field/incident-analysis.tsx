import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ScanLine, LoaderCircle, Pencil, Save, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDemo } from "@/lib/demo-context";
import type { Incident } from "@/lib/demo";
import { generateIncidentAnalysis, incidentSource } from "@/lib/incident-workflow";
import { SafetyNote } from "./shared";
import { toast } from "sonner";

export function IncidentAnalysisPanel({ incident }: { incident: Incident }) {
  const { analyses, setAnalyses, initializeDiagnosis, setActiveIncidentId, addActivity } =
    useDemo();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const analysis = analyses[incident.id];
  const stale = analysis && analysis.source !== incidentSource(incident);
  return (
    <section className="panel panel-padding mt-5" aria-label="AI incident analysis">
      <div className="flex justify-between gap-3 items-center flex-wrap mb-4">
        <h2 className="text-sm font-semibold">AI Incident Analysis</h2>
        <span className="demo-pill">AI-ASSISTED DEMONSTRATION OUTPUT</span>
      </div>
      <SafetyNote>
        Local demonstration based on the supplied incident. Hypotheses are not confirmed root
        causes; no live AI is connected.
      </SafetyNote>
      <div className="flex gap-2 flex-wrap mt-4">
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 600));
              setAnalyses((prev) => ({
                ...prev,
                [incident.id]: generateIncidentAnalysis(incident),
              }));
              initializeDiagnosis(incident);
              setActiveIncidentId(incident.id);
              addActivity(
                "AI-assisted demonstration analysis generated",
                "AI Analysis",
                incident.site,
              );
              setEditing(false);
              toast.success("Incident-specific demonstration analysis generated.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <LoaderCircle className="animate-spin" /> : <ScanLine />}
          {busy ? "Analyzing incident…" : "Analyze Incident with AI"}
        </Button>
        {analysis && (
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? <Save /> : <Pencil />}
            {editing ? "Save analysis edits" : "Edit analysis"}
          </Button>
        )}
      </div>
      {stale && (
        <p className="text-xs text-warning mt-4">
          Incident data changed. Regenerate this analysis before using it as a current assessment.
        </p>
      )}
      {busy && (
        <p role="status" className="text-xs text-muted-foreground py-5">
          Organizing the supplied facts, missing information, and verification steps…
        </p>
      )}
      {analysis && !busy && (
        <>
          <div>
            {analysis.sections.map((section) => (
              <div key={section.id} className="analysis-section">
                <h3>{section.title}</h3>
                {editing ? (
                  <Textarea
                    aria-label={section.title}
                    value={section.text}
                    className="text-xs leading-7 min-h-28"
                    onChange={(e) =>
                      setAnalyses((prev) => ({
                        ...prev,
                        [incident.id]: {
                          ...analysis,
                          sections: analysis.sections.map((s) =>
                            s.id === section.id ? { ...s, text: e.target.value } : s,
                          ),
                        },
                      }))
                    }
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{section.text}</p>
                )}
              </div>
            ))}
          </div>
          <Button
            asChild
            onClick={() => {
              setActiveIncidentId(incident.id);
              initializeDiagnosis(incident);
            }}
          >
            <Link to="/diagnosis">
              <ListChecks />
              View Diagnostic Checklist
            </Link>
          </Button>
        </>
      )}
    </section>
  );
}
