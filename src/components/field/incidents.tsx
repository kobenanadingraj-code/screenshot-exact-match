import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search, Paperclip, Download, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-context";
import type { Incident, Severity } from "@/lib/demo";
import { Status, IncidentLink, OpenIncidentButton, SafetyNote } from "./shared";
import { toast } from "sonner";

export function NewIncident({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const { incidents, setIncidents, addActivity, setActiveIncidentId } = useDemo();
  const navigate = useNavigate();
  const id = `INC-2026-${String(incidents.length + 1).padStart(3, "0")}`;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (key: string) => String(data.get(key) ?? "").trim();
    if (!field("site") || !field("description") || !field("category")) {
      toast.error("Site, equipment category, and description are required.");
      return;
    }
    const incident: Incident = {
      id,
      site: field("site"),
      location: field("location"),
      category: field("category"),
      model: field("model") || "Not provided",
      domain: field("domain"),
      description: field("description"),
      alarms: field("alarms"),
      observations: field("observations"),
      date: field("date"),
      severity: field("severity") as Severity,
      status: "New",
      attachments,
    };
    setIncidents((prev) => [incident, ...prev]);
    setActiveIncidentId(id);
    addActivity("Demonstration incident created", "Incident", incident.site);
    setOpen(false);
    setAttachments([]);
    toast.success("Demo incident created.");
    void navigate({ to: "/incidents/$incidentId", params: { incidentId: id } });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={compact ? "sm" : "default"}>
          <Plus />
          {compact ? "New incident" : "Create New Incident"}
        </Button>
      </DialogTrigger>
      <DialogContent className="dialog-wide">
        <DialogHeader>
          <DialogTitle>Create new incident</DialogTitle>
          <DialogDescription>
            New demonstration record · engineer-provided observations only.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="new-id">Incident ID</label>
              <Input id="new-id" value={id} readOnly className="technical" />
            </div>
            <div className="field">
              <label htmlFor="new-site">Site ID *</label>
              <Input
                id="new-site"
                name="site"
                required
                placeholder="e.g. ABJ-CTR-045"
                maxLength={60}
              />
            </div>
            <div className="field">
              <label htmlFor="new-location">Site location</label>
              <Input id="new-location" name="location" placeholder="City, region" />
            </div>
            <div className="field">
              <label htmlFor="new-category">Equipment category *</label>
              <select id="new-category" className="select-control" name="category" required>
                <option value="">Select equipment</option>
                {[
                  "Transmission equipment",
                  "BTS",
                  "BBU",
                  "RRU / AAU",
                  "IP router",
                  "Power system",
                  "Fiber link",
                  "Other",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="new-model">Equipment model</label>
              <Input id="new-model" name="model" placeholder="If known" />
            </div>
            <div className="field">
              <label htmlFor="new-domain">Network domain</label>
              <select id="new-domain" className="select-control" name="domain">
                {["Transmission", "RAN", "Power", "Core", "IP"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="new-date">Date and time *</label>
              <Input
                id="new-date"
                name="date"
                type="datetime-local"
                required
                defaultValue="2026-11-20T16:00"
              />
            </div>
            <div className="field">
              <label htmlFor="new-severity">Severity</label>
              <select
                id="new-severity"
                name="severity"
                className="select-control"
                defaultValue="Medium"
              >
                {["Critical", "High", "Medium", "Low"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field field-full">
              <label htmlFor="new-description">Incident description *</label>
              <Textarea
                id="new-description"
                name="description"
                required
                placeholder="Describe the observed issue, without assuming a root cause."
                minLength={3}
              />
            </div>
            <div className="field field-full">
              <label htmlFor="new-alarms">Observed alarms</label>
              <Input id="new-alarms" name="alarms" placeholder="Exact alarm text, if available" />
            </div>
            <div className="field field-full">
              <label htmlFor="new-observations">Technician observations</label>
              <Textarea
                id="new-observations"
                name="observations"
                placeholder="Record only what you actually observed."
              />
            </div>
            <div className="field field-full">
              <label htmlFor="new-attachments" className="flex gap-2 items-center">
                <Paperclip className="size-3.5" />
                Attachments
              </label>
              <Input
                id="new-attachments"
                type="file"
                multiple
                onChange={(e) =>
                  setAttachments(Array.from(e.target.files ?? []).map((f) => f.name))
                }
              />
              <span className="text-[10px] text-muted-foreground">
                {attachments.length
                  ? attachments.join(", ")
                  : "Demo stores file names only; evidence is not uploaded or analyzed."}
              </span>
            </div>
          </div>
          <SafetyNote>
            Demonstration only. This incident does not represent a connected network record.
          </SafetyNote>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus />
              Create incident
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function IncidentTable({
  incidents,
  overview = false,
}: {
  incidents: Incident[];
  overview?: boolean;
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>INCIDENT ID</th>
            <th>SITE ID</th>
            <th>EQUIPMENT</th>
            {!overview && (
              <>
                <th>DOMAIN</th>
                <th>SEVERITY</th>
              </>
            )}
            <th>STATUS</th>
            <th>LAST UPDATE</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td>
                <IncidentLink id={incident.id}>{incident.id}</IncidentLink>
              </td>
              <td className="technical">{incident.site}</td>
              <td>
                <span className="flex items-center gap-2">
                  <FileWarning className="size-3.5 text-muted-foreground" />
                  {incident.category === "Transmission equipment"
                    ? "Transmission"
                    : incident.category}
                </span>
              </td>
              {!overview && (
                <>
                  <td>{incident.domain}</td>
                  <td>
                    <Status value={incident.severity} />
                  </td>
                </>
              )}
              <td>
                <Status value={incident.status} />
              </td>
              <td className="text-muted-foreground">
                {incident.date.slice(0, 10) === "2026-11-20"
                  ? incident.date.slice(11, 16)
                  : "19 Nov"}
              </td>
              <td>
                <OpenIncidentButton id={incident.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {incidents.length === 0 && (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No incidents match these filters.
        </div>
      )}
    </div>
  );
}
export function IncidentFilters({
  search,
  setSearch,
  status,
  setStatus,
}: {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
}) {
  return (
    <div className="filter-bar">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          aria-label="Search incidents"
          className="pl-9"
          placeholder="Search incident, site or equipment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <select
        aria-label="Filter incident status"
        className="select-control max-w-48"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {[
          "All statuses",
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
    </div>
  );
}
export function DownloadIncidents({ incidents }: { incidents: Incident[] }) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        const csv = [
          ["Incident", "Site", "Equipment", "Domain", "Status", "Severity"],
          ...incidents.map((i) => [i.id, i.site, i.category, i.domain, i.status, i.severity]),
        ]
          .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
          .join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "demo-incidents.csv";
        link.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download />
      Export CSV
    </Button>
  );
}
