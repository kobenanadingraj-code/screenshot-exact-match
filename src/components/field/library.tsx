import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Bookmark,
  BookOpen,
  ArrowUpRight,
  Clock3,
  Save,
  User,
  Moon,
  Sun,
  ShieldCheck,
  RotateCcw,
  FlaskConical,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-context";
import { knowledgeCategories, knowledgeArticles } from "@/lib/demo";
import { PageHeading, IncidentLink, Status, SafetyNote } from "./shared";
import { toast } from "sonner";

export function Knowledge() {
  const { savedArticles, setSavedArticles } = useDemo();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All topics");
  const [savedOnly, setSavedOnly] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const filtered = knowledgeArticles.filter(
    (a) =>
      `${a.title} ${a.description} ${a.category}`.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All topics" || a.category === category) &&
      (!savedOnly || savedArticles.includes(a.id)),
  );
  const selected = knowledgeArticles.find((a) => a.id === articleId);
  return (
    <>
      <PageHeading
        title="Knowledge Base"
        subtitle="Practical references for clearer field observations and technical handovers."
      >
        <span className="demo-pill">
          <BookOpen className="size-3" />
          SAMPLE DOCUMENTATION
        </span>
      </PageHeading>
      <div className="filter-bar">
        <div className="relative flex-1 min-w-48">
          <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
          <Input
            className="pl-9"
            aria-label="Search knowledge"
            placeholder="Search technical references…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Knowledge category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select-control max-w-52"
        >
          {knowledgeCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs">
          <Switch checked={savedOnly} onCheckedChange={setSavedOnly} />
          Saved only
        </label>
      </div>
      <div className="mb-6">
        <SafetyNote>
          Sample educational content only. These are not official manufacturer procedures. Follow
          approved operator and vendor documentation.
        </SafetyNote>
      </div>
      <div className="library-grid">
        {filtered.map((article) => (
          <article className="panel library-card" key={article.id}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-primary bg-primary/10 rounded px-2 py-1">
                {article.category}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                title={savedArticles.includes(article.id) ? "Remove bookmark" : "Save article"}
                aria-label={`Bookmark ${article.title}`}
                onClick={() =>
                  setSavedArticles((prev) =>
                    prev.includes(article.id)
                      ? prev.filter((id) => id !== article.id)
                      : [...prev, article.id],
                  )
                }
              >
                <Bookmark
                  className={
                    savedArticles.includes(article.id)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }
                />
              </Button>
            </div>
            <BookOpen className="size-7 text-muted-foreground mt-2" />
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <div className="flex justify-between items-center mt-auto pt-5 border-t border-border">
              <span className="text-[9px] text-faint flex items-center gap-1">
                <Clock3 className="size-3" />
                {article.minutes} min · Sample
              </span>
              <Button
                size="xs"
                variant="ghost"
                className="text-primary"
                onClick={() => setArticleId(article.id)}
              >
                Read reference
                <ArrowUpRight className="size-3" />
              </Button>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20 text-sm text-muted-foreground">
          No sample references match your filters.
        </div>
      )}
      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-semibold">External reference directory</h2>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button asChild variant="outline" size="sm">
            <a
              href="https://www.3gpp.org/specifications-technologies"
              target="_blank"
              rel="noreferrer"
            >
              3GPP specifications
              <ArrowUpRight />
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="https://www.itu.int/rec/T-REC/en" target="_blank" rel="noreferrer">
              ITU-T recommendations
              <ArrowUpRight />
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="https://www.rfc-editor.org/" target="_blank" rel="noreferrer">
              RFC technical standards
              <ArrowUpRight />
            </a>
          </Button>
        </div>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setArticleId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected?.category} · Sample educational reference
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-8">{selected?.content}</p>
          <SafetyNote>
            Not a manufacturer procedure or a substitute for your approved operational
            documentation.
          </SafetyNote>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function ActivityHistory() {
  const { activities, incidents, documents } = useDemo();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All activities");
  const filtered = activities.filter(
    (a) =>
      `${a.title} ${a.incident}`.toLowerCase().includes(search.toLowerCase()) &&
      (type === "All activities" || a.type === type),
  );
  return (
    <>
      <PageHeading title="History" subtitle="A traceable record of this demonstration session." />
      <div className="filter-bar">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Search history"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities or sites…"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Activity type"
          className="select-control max-w-48"
        >
          {["All activities", "Incident", "AI Analysis", "Diagnosis", "Report", "Escalation"].map(
            (t) => (
              <option key={t}>{t}</option>
            ),
          )}
        </select>
      </div>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>ACTIVITY</th>
              <th>MODULE</th>
              <th>SITE</th>
              <th>STATUS</th>
              <th>DATE & TIME</th>
            </tr>
          </thead>
          <tbody>
            {[...filtered]
              .sort((a, b) => b.time.localeCompare(a.time))
              .map((activity) => {
                const incident = incidents.find((i) => i.site === activity.incident);
                const doc = documents.find((d) => d.incidentId === incident?.id);
                return (
                  <tr key={activity.id}>
                    <td>{activity.title}</td>
                    <td>{activity.type}</td>
                    <td>
                      {incident ? (
                        <IncidentLink id={incident.id}>{activity.incident}</IncidentLink>
                      ) : (
                        activity.incident
                      )}
                    </td>
                    <td>
                      <Status
                        value={
                          activity.type === "Report" || activity.type === "Escalation"
                            ? doc?.validated
                              ? "Validated"
                              : "Draft"
                            : (incident?.status ?? "New")
                        }
                      />
                    </td>
                    <td className="technical text-muted-foreground">
                      {activity.time.replace("T", " ").slice(0, 16)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="p-10 text-center text-muted-foreground text-sm">
            No activity matches these filters.
          </p>
        )}
      </div>
    </>
  );
}
export function SettingsWorkspace() {
  const { engineer, setEngineer, theme, setTheme, resetDemo } = useDemo();
  const [name, setName] = useState(engineer);
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <>
      <PageHeading title="Settings" subtitle="Your engineer profile and workspace preferences." />
      <div className="max-w-3xl space-y-7">
        <section className="border-b border-border pb-7">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <User className="size-4 text-primary" />
            Engineer profile
          </h2>
          <div className="field-grid mt-5">
            <div className="field">
              <label htmlFor="profile-name">Display name</label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
            </div>
            <div className="field">
              <label htmlFor="profile-role">Role</label>
              <Input id="profile-role" readOnly value="Telecom Field Engineer" />
            </div>
          </div>
          <Button
            size="sm"
            className="mt-5"
            onClick={() => {
              if (!name.trim()) {
                toast.error("Please provide a display name.");
                return;
              }
              setEngineer(name.trim());
              toast.success("Profile updated for this demo session.");
            }}
          >
            <Save />
            Save profile
          </Button>
        </section>
        <section className="border-b border-border pb-7">
          <h2 className="text-sm font-semibold mb-5">Appearance</h2>
          <div className="flex gap-3">
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              <Moon />
              Dark
            </Button>
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              <Sun />
              Light
            </Button>
          </div>
        </section>
        <section className="border-b border-border pb-7">
          <h2 className="text-sm font-semibold mb-5">Connections & data</h2>
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FlaskConical className="size-4 text-primary" />
                AI service
              </span>
              <span className="text-muted-foreground">Not connected · Simulated responses</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Network className="size-4 text-info" />
                Telecom monitoring
              </span>
              <span className="text-muted-foreground">Not connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock3 className="size-4 text-muted-foreground" />
                Data retention
              </span>
              <span className="text-muted-foreground">Current session only</span>
            </div>
          </div>
          <div className="mt-6">
            <SafetyNote>
              AI FIELD ASSISTANT supports engineer decisions; it does not replace technical judgment
              or approved safety procedures.
            </SafetyNote>
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold mb-3">Demonstration workspace</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Restoring the sample scenario clears incidents, documents, verifications, and
            conversations created during this session.
          </p>
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RotateCcw />
            Reset demonstration
          </Button>
        </section>
      </div>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset demonstration workspace?</DialogTitle>
            <DialogDescription>
              This removes your current session work and restores the initial simulated records.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetDemo();
                setResetOpen(false);
                toast.success("Sample scenario restored.");
              }}
            >
              Reset demo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
