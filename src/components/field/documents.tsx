import { useState } from "react";
import {
  FileText,
  Network,
  Download,
  Save,
  Pencil,
  ScanLine,
  CheckCircle2,
  LoaderCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-context";
import { buildDocument, canConfirmDocument, type SavedDocument } from "@/lib/demo";
import { exportDocument } from "@/lib/document-export";
import { PageHeading, IncidentPicker, SafetyNote, Status } from "./shared";
import { toast } from "sonner";

export function DocumentsWorkspace({ kind }: { kind: "report" | "escalation" }) {
  const {
    incidents,
    activeIncidentId,
    setActiveIncidentId,
    stepsByIncident,
    engineer,
    documents,
    setDocuments,
    addActivity,
  } = useDemo();
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [priority, setPriority] = useState("P2 — High");
  const [exportBusy, setExportBusy] = useState(false);
  const incident = incidents.find((i) => i.id === activeIncidentId) ?? incidents[0];
  if (!incident) return <p>No incident available.</p>;
  const isReport = kind === "report";
  const title = isReport ? "Intervention Reports" : "NOC Escalation";
  const text = content || buildDocument(kind, incident, stepsByIncident[incident.id] ?? []);
  const reference = `${isReport ? "RPT" : "ESC"}-${incident.id.replace("INC-", "")}`;
  function draft(): SavedDocument {
    return {
      id: reference,
      kind,
      incidentId: incident?.id ?? "",
      title: isReport ? "Telecom intervention report" : "NOC escalation summary",
      content: `${!isReport ? `ESCALATION PRIORITY\n${priority}\n\n` : ""}${text}`,
      validated,
      date: new Date().toISOString(),
    };
  }
  function save(confirmed: boolean) {
    if (confirmed && !canConfirmDocument(validated)) {
      toast.error("Explicit engineer validation is required before confirming this record.");
      return;
    }
    const saved = { ...draft(), validated: confirmed };
    setDocuments((prev) => [saved, ...prev.filter((d) => d.id !== saved.id)]);
    addActivity(
      `${isReport ? "Report" : "Escalation"} ${confirmed ? "engineer-validated" : "draft saved"}`,
      isReport ? "Report" : "Escalation",
      incident?.site ?? "",
    );
    toast.success(
      confirmed ? "Engineer-reviewed demo record saved." : "Unvalidated demo draft saved.",
    );
  }
  return (
    <>
      <PageHeading
        title={title}
        subtitle={
          isReport
            ? "Professional documentation, built from your validated observations."
            : "A clear, evidence-led handover to your Network Operations Center."
        }
      >
        <div className="flex items-center gap-2">
          <span className="demo-pill">DEMONSTRATION DOCUMENT</span>
        </div>
      </PageHeading>
      <div className="document-grid">
        <aside className="space-y-5">
          <div className="panel panel-padding space-y-5">
            <div className="field">
              <label>Incident record</label>
              <IncidentPicker
                incidents={incidents}
                value={incident.id}
                onChange={(id) => {
                  setActiveIncidentId(id);
                  setContent("");
                  setValidated(false);
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="document-reference">
                {isReport ? "Report" : "Escalation"} reference
              </label>
              <Input id="document-reference" value={reference} readOnly className="technical" />
            </div>
            <div className="field">
              <label htmlFor="document-engineer">Technician</label>
              <Input id="document-engineer" value={engineer} readOnly />
            </div>
            {!isReport && (
              <div className="field">
                <label htmlFor="escalation-priority">Escalation priority</label>
                <select
                  id="escalation-priority"
                  value={priority}
                  className="select-control"
                  onChange={(e) => {
                    setPriority(e.target.value);
                    setValidated(false);
                  }}
                >
                  {["P1 — Critical", "P2 — High", "P3 — Medium", "P4 — Low"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
            <Button
              className="w-full text-xs"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setTimeout(() => {
                  setContent(buildDocument(kind, incident, stepsByIncident[incident.id] ?? []));
                  setValidated(false);
                  setBusy(false);
                  addActivity(
                    `Sample ${isReport ? "report" : "escalation"} prepared`,
                    isReport ? "Report" : "Escalation",
                    incident.site,
                  );
                  toast.success("Demonstration template prepared from available observations.");
                }, 700);
              }}
            >
              {busy ? <LoaderCircle className="animate-spin" /> : <ScanLine />}
              {isReport ? "Generate from observations" : "Prepare escalation summary"}
            </Button>
            <SafetyNote>
              Unverified findings are never recorded as confirmed. Review and edit the draft before
              validation.
            </SafetyNote>
          </div>
          <div className="panel panel-padding">
            <h3 className="text-xs font-semibold mb-4">Technician validation</h3>
            <label className="flex items-start gap-3 text-[11px] leading-6">
              <Checkbox
                checked={validated}
                onCheckedChange={(v) => setValidated(v === true)}
                className="mt-1"
              />
              <span>
                I reviewed this simulated document and confirm it accurately reflects supplied
                observations and tests I recorded.
              </span>
            </label>
            <div className="flex flex-col gap-2 mt-5">
              <Button variant="outline" className="text-xs" onClick={() => save(false)}>
                <Save />
                Save draft
              </Button>
              <Button className="text-xs" onClick={() => save(true)}>
                <CheckCircle2 />
                Validate & save record
              </Button>
            </div>
          </div>
          <div className="panel panel-padding">
            <h3 className="text-xs font-semibold mb-4">Saved this session</h3>
            {documents.filter((d) => d.kind === kind).length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No documents saved yet.</p>
            ) : (
              documents
                .filter((d) => d.kind === kind)
                .map((d) => (
                  <Button
                    key={d.id}
                    variant="ghost"
                    className="w-full justify-between text-xs p-1"
                    onClick={() => {
                      setActiveIncidentId(d.incidentId);
                      setContent(d.content.replace(/^ESCALATION PRIORITY\n[^\n]*\n\n/, ""));
                      setValidated(d.validated);
                    }}
                  >
                    <span className="technical">{d.id}</span>
                    <Status value={d.validated ? "Validated" : "Draft"} />
                  </Button>
                ))
            )}
          </div>
        </aside>
        <section>
          <div className="flex justify-between gap-3 flex-wrap items-center mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="size-4" />
              Document preview
              <Status value={validated ? "Validated" : "Draft"} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(!editing)}>
                <Pencil />
                {editing ? "Preview" : "Edit"}
              </Button>
              {(["pdf", "docx"] as const).map((format) => (
                <Button
                  key={format}
                  size="sm"
                  variant="outline"
                  disabled={exportBusy}
                  onClick={async () => {
                    setExportBusy(true);
                    try {
                      await exportDocument(format, draft(), incident, engineer);
                      toast.success(
                        `${format.toUpperCase()} exported as a ${validated ? "reviewed demo record" : "clearly marked draft"}.`,
                      );
                    } catch {
                      toast.error("Document export failed. Please try again.");
                    } finally {
                      setExportBusy(false);
                    }
                  }}
                >
                  <Download />
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <div className="document-paper">
            <div className="document-header">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">
                  AI FIELD ASSISTANT<span className="text-primary">.</span>
                </span>
                {isReport ? (
                  <FileText className="size-6 text-primary" />
                ) : (
                  <Network className="size-6 text-primary" />
                )}
              </div>
              <h2 className="text-xl font-semibold mt-6">
                {isReport ? "Telecom Intervention Report" : "NOC Escalation Summary"}
              </h2>
              <div className="flex items-center justify-between mt-3 gap-3">
                <span className="technical text-muted-foreground">{reference}</span>
                <span className="demo-pill">
                  SIMULATED · {validated ? "ENGINEER REVIEWED" : "UNVALIDATED DRAFT"}
                </span>
              </div>
            </div>
            <dl className="info-list mb-7">
              <div>
                <dt>Site identifier</dt>
                <dd className="technical">{incident.site}</dd>
              </div>
              <div>
                <dt>Site location</dt>
                <dd>{incident.location || "Not provided"}</dd>
              </div>
              <div>
                <dt>Intervention / incident date</dt>
                <dd>{incident.date.replace("T", " ")}</dd>
              </div>
              <div>
                <dt>Technician</dt>
                <dd>{engineer}</dd>
              </div>
            </dl>
            {editing ? (
              <Textarea
                aria-label="Edit document content"
                className="min-h-[700px] leading-7 text-xs"
                value={text}
                onChange={(e) => {
                  setContent(e.target.value);
                  setValidated(false);
                }}
              />
            ) : (
              text.split("\n\n").map((section, index) => {
                const [heading, ...body] = section.split("\n");
                return (
                  <div className="document-section" key={index}>
                    <h3>{heading}</h3>
                    <p>{body.join("\n")}</p>
                  </div>
                );
              })
            )}
            <div className="border-t border-border pt-5 mt-8">
              <p className="text-[9px] text-muted-foreground">
                {validated
                  ? `Demonstration document reviewed by ${engineer}.`
                  : "Engineer signature / approval: pending."}
                <br />
                This simulated document is not an official operational record.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
