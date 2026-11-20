import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ScanLine, FileText, Network, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDemo } from "@/lib/demo-context";
import type { IncidentStatus } from "@/lib/demo";
import { PageHeading, Status, SafetyNote } from "./shared";
import { toast } from "sonner";

export function IncidentDetail({ incidentId }: { incidentId: string }) {
  const {
    incidents,
    setIncidents,
    activities,
    addActivity,
    setActiveIncidentId,
    stepsByIncident,
    documents,
  } = useDemo();
  const incident = incidents.find((i) => i.id === incidentId);
  const [observations, setObservations] = useState(incident?.observations ?? "");
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<IncidentStatus>(incident?.status ?? "New");
  const [confirmed, setConfirmed] = useState(false);
  if (!incident)
    return (
      <>
        <PageHeading
          title="Incident unavailable"
          subtitle="This demonstration incident is not available in the current session."
        />
        <Button asChild variant="outline">
          <Link to="/incidents">
            <ArrowLeft />
            All incidents
          </Link>
        </Button>
      </>
    );
  const steps = stepsByIncident[incident.id] ?? [];
  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-5 p-0 text-muted-foreground">
        <Link to="/incidents">
          <ArrowLeft />
          All incidents
        </Link>
      </Button>
      <PageHeading
        title={incident.site}
        subtitle={`${incident.id} · ${incident.location || "Location not provided"}`}
      >
        <div className="flex items-center gap-2">
          <Status value={incident.severity} />
          <Status value={incident.status} />
        </div>
      </PageHeading>
      <div className="detail-grid">
        <div>
          <Tabs defaultValue="general">
            <TabsList className="mb-5 w-full justify-start overflow-x-auto">
              <TabsTrigger value="general">General information</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostic actions</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <div className="panel panel-padding">
                <dl className="info-list">
                  <div>
                    <dt>Equipment category</dt>
                    <dd>{incident.category}</dd>
                  </div>
                  <div>
                    <dt>Equipment model</dt>
                    <dd>{incident.model}</dd>
                  </div>
                  <div>
                    <dt>Network domain</dt>
                    <dd>{incident.domain}</dd>
                  </div>
                  <div>
                    <dt>Incident start</dt>
                    <dd>{incident.date.replace("T", " ")}</dd>
                  </div>
                </dl>
                <div className="analysis-section mt-6">
                  <h3>Incident description</h3>
                  <p>{incident.description}</p>
                </div>
                <div className="analysis-section">
                  <h3>Observed alarms</h3>
                  <p>{incident.alarms || "Not provided"}</p>
                </div>
                <div className="analysis-section">
                  <div className="flex justify-between">
                    <h3>Technician observations</h3>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Edit observations"
                      onClick={() => setEditing(!editing)}
                    >
                      <Pencil />
                    </Button>
                  </div>
                  {editing ? (
                    <div>
                      <Textarea
                        aria-label="Technician observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                      />
                      <Button
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setIncidents((prev) =>
                            prev.map((i) => (i.id === incident.id ? { ...i, observations } : i)),
                          );
                          setEditing(false);
                          addActivity("Engineer observations updated", "Incident", incident.site);
                          toast.success("Observations updated in this session.");
                        }}
                      >
                        <Save />
                        Save observations
                      </Button>
                    </div>
                  ) : (
                    <p>{incident.observations || "Not provided"}</p>
                  )}
                </div>
                <div className="analysis-section">
                  <h3>Attachments</h3>
                  <p>
                    {incident.attachments.length
                      ? incident.attachments.join(", ")
                      : "No attachments supplied."}
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="timeline">
              <div className="panel panel-padding">
                <h3 className="text-sm font-semibold">Incident timeline</h3>
                <div className="activity-timeline">
                  {activities
                    .filter((a) => a.incident === incident.site)
                    .map((a) => (
                      <div className="activity-line" key={a.id}>
                        <p>{a.title}</p>
                        <small>{a.time.replace("T", " ").slice(0, 16)}</small>
                      </div>
                    ))}
                  {!activities.some((a) => a.incident === incident.site) && (
                    <p className="text-sm text-muted-foreground">
                      No session activity recorded for this sample incident.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="diagnostics">
              <div className="panel panel-padding">
                <h3 className="text-sm font-semibold mb-4">Manually recorded diagnostic actions</h3>
                {steps.length === 0 && (
                  <p className="text-xs text-muted-foreground mb-5">No checks recorded yet.</p>
                )}
                {steps.map((s) => (
                  <div key={s.id} className="analysis-section">
                    <div className="flex justify-between gap-4">
                      <h3>{s.title}</h3>
                      <Status value={s.status} />
                    </div>
                    <p>{s.result || "No observed result recorded."}</p>
                  </div>
                ))}
                <Button asChild variant="outline" onClick={() => setActiveIncidentId(incident.id)}>
                  <Link to="/diagnosis">
                    <ScanLine />
                    Open diagnostic checklist
                  </Link>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="documents">
              <div className="panel panel-padding">
                <h3 className="text-sm font-semibold mb-4">Intervention documents</h3>
                {documents
                  .filter((d) => d.incidentId === incident.id)
                  .map((d) => (
                    <div className="flex justify-between py-3 border-b border-border" key={d.id}>
                      <span className="technical">{d.id}</span>
                      <Status value={d.validated ? "Validated" : "Draft"} />
                    </div>
                  ))}
                {documents.filter((d) => d.incidentId === incident.id).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No documents saved for this incident.
                  </p>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="mt-5"
                  onClick={() => setActiveIncidentId(incident.id)}
                >
                  <Link to="/reports">
                    <FileText />
                    Prepare report
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <aside className="space-y-5">
          <div className="assistant-card">
            <h3 className="text-sm font-semibold mb-4">Contextual AI assistance</h3>
            <div className="flex flex-col gap-2">
              {[
                { to: "/assistant", label: "Analyze this incident with AI", icon: ScanLine },
                { to: "/diagnosis", label: "Open diagnostic checklist", icon: ScanLine },
                { to: "/reports", label: "Generate intervention report", icon: FileText },
                { to: "/escalations", label: "Prepare NOC escalation", icon: Network },
              ].map((action) => (
                <Button
                  key={action.to}
                  asChild
                  variant="outline"
                  className="justify-start text-[11px]"
                  onClick={() => setActiveIncidentId(incident.id)}
                >
                  <Link to={action.to}>
                    <action.icon />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
            <div className="mt-5">
              <SafetyNote />
            </div>
          </div>
          <div className="panel panel-padding">
            <h3 className="text-sm font-semibold mb-4">Update incident status</h3>
            <select
              className="select-control"
              aria-label="Incident status"
              value={newStatus}
              onChange={(e) => {
                setNewStatus(e.target.value as IncidentStatus);
                setConfirmed(false);
              }}
            >
              {[
                "New",
                "Under Analysis",
                "In Progress",
                "Pending Escalation",
                "Resolved",
                "Closed",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <label className="flex gap-2 mt-4 text-[10px] leading-6">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(value) => setConfirmed(value === true)}
                className="mt-1"
              />
              <span>I manually confirm this status reflects my verified observations.</span>
            </label>
            <Button
              className="w-full mt-4 text-xs"
              onClick={() => {
                if (!confirmed) {
                  toast.error("Engineer confirmation is required to change operational status.");
                  return;
                }
                setIncidents((prev) =>
                  prev.map((i) => (i.id === incident.id ? { ...i, status: newStatus } : i)),
                );
                addActivity(`Engineer changed status to ${newStatus}`, "Incident", incident.site);
                toast.success("Demo status manually updated.");
                setConfirmed(false);
              }}
            >
              Confirm status update
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
