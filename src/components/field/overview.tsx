import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  ClipboardList,
  CircleAlert,
  FileCheck2,
  Network,
  ScanLine,
  FileText,
  ListChecks,
  Radio,
  Clock3,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-context";
import { PageHeading, SectionHeading, BrandSymbol } from "./shared";
import { NewIncident, IncidentTable } from "./incidents";
import { dashboardStats, domainDistribution } from "@/lib/incident-workflow";
import siteAsset from "@/assets/telecom-site.asset.json";

export function Overview() {
  const { incidents, documents, activities } = useDemo();
  const counts = dashboardStats(incidents, documents);
  const stats = [
    {
      title: "Total incidents",
      value: counts.total,
      icon: ClipboardList,
      tone: "",
      note: "Across all network domains",
      trend: "Sample workspace",
    },
    {
      title: "Open incidents",
      value: counts.open,
      icon: CircleAlert,
      tone: "warning",
      note: "Awaiting engineer action",
      trend: `${counts.critical} critical`,
    },
    {
      title: "Reports generated",
      value: counts.reports,
      icon: FileCheck2,
      tone: "success",
      note: "Saved reports · drafts and reviewed",
      trend: "This session",
    },
    {
      title: "Pending escalations",
      value: counts.pending,
      icon: Network,
      tone: "critical",
      note: "Ready for NOC attention",
      trend: "Review required",
    },
  ];
  const actions = [
    {
      title: "Analyze an incident",
      subtitle: "Turn observations into insights",
      icon: ScanLine,
      to: "/assistant",
    },
    {
      title: "Generate a report",
      subtitle: "Document your intervention",
      icon: FileText,
      to: "/reports",
    },
    {
      title: "Diagnostic checklist",
      subtitle: "Verify one step at a time",
      icon: ListChecks,
      to: "/diagnosis",
    },
    {
      title: "Prepare escalation",
      subtitle: "Make your NOC handover clear",
      icon: Network,
      to: "/escalations",
    },
  ] as const;
  return (
    <>
      <PageHeading
        title="Welcome back, Engineer."
        subtitle="Your intelligent telecom operations workspace."
      >
        <NewIncident />
      </PageHeading>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-heading">
              <span>{stat.title}</span>
              <div className={`stat-icon ${stat.tone}`}>
                <stat.icon className="size-4" />
              </div>
            </div>
            <div className="stat-value">{String(stat.value).padStart(2, "0")}</div>
            <div className="stat-foot">
              <span className={stat.tone === "warning" ? "text-warning" : "text-success"}>
                <ArrowUpRight className="size-3 inline mr-0.5" />
                {stat.trend}
              </span>
              <div className="metric-trend" aria-hidden="true">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
            </div>
            <p className="text-[9px] text-faint mt-2.5">{stat.note}</p>
          </div>
        ))}
      </div>
      <div className="overview-grid">
        <div>
          <SectionHeading
            title="Quick Actions"
            subtitle="Move from field observations to your next step."
          >
            <span className="text-[9px] text-faint flex items-center gap-1">
              <Radio className="size-3" />
              Engineer workspace
            </span>
          </SectionHeading>
          <div className="quick-grid">
            {actions.map((action) => (
              <Button asChild variant="action" className="quick-action" key={action.title}>
                <Link to={action.to}>
                  <action.icon />
                  <span>
                    {action.title}
                    <small className="block mt-1.5">{action.subtitle}</small>
                  </span>
                </Link>
              </Button>
            ))}
          </div>
          <SectionHeading
            title="Recent Activities"
            subtitle="Latest incidents in your demonstration workspace."
          >
            <Button asChild variant="ghost" size="sm" className="text-[10px] text-muted-foreground">
              <Link to="/incidents">
                View all incidents
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </SectionHeading>
          <div className="panel">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-1.5 bg-info rounded-full" />
                <span className="text-[10px] font-medium">Incident activity</span>
                <span className="text-[9px] text-faint">{incidents.length} records</span>
              </div>
              <Button variant="ghost" size="xs" asChild>
                <Link to="/incidents">
                  All domains
                  <ChevronDown className="size-3" />
                </Link>
              </Button>
            </div>
            <IncidentTable incidents={incidents.slice(0, 5)} overview />
            <div className="px-4 py-3 border-t border-border text-[9px] text-faint flex items-center justify-between">
              <span>
                Showing {Math.min(5, incidents.length)} of {incidents.length} sample incidents
              </span>
              <span className="flex items-center gap-1.5">
                <Clock3 className="size-3" />
                Session data
              </span>
            </div>
          </div>
          <div className="site-feature">
            <img
              src={siteAsset.url}
              alt="Illustrative telecom tower with microwave dishes and cellular antennas on a coastal site"
            />
            <div className="site-feature-content">
              <span className="demo-pill">THE ENGINEER'S COPILOT</span>
              <h3>
                From field observations.
                <br />
                To informed operations.
              </h3>
              <p>Your expertise. Better documented.</p>
              <Button asChild variant="link" size="sm" className="p-0 h-auto mt-3 text-[10px]">
                <Link to="/assistant">
                  Open AI FIELD ASSISTANT
                  <ArrowUpRight className="size-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="overview-right">
          <div className="assistant-card">
            <div className="flex gap-3 items-center">
              <BrandSymbol small />
              <div>
                <h2 className="text-[13px] font-semibold">Your AI copilot</h2>
                <span className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                  <span className="size-1 bg-primary rounded-full" />
                  Demonstration assistant
                </span>
              </div>
              <span className="ml-auto text-primary">
                <Radio className="size-4" />
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-7 mt-4">
              A clearer picture of your incidents.
              <br />A more confident next step.
            </p>
            <div className="activity-timeline">
              {activities.slice(0, 3).map((activity) => (
                <div className="activity-line" key={activity.id}>
                  <p>
                    {activity.title
                      .replace("Demonstration", "Demo")
                      .replace("Illustrative", "Sample")}
                  </p>
                  <small>
                    {activity.incident} · {activity.time.slice(11, 16)}
                  </small>
                </div>
              ))}
            </div>
            <Button asChild className="w-full text-[11px] h-9">
              <Link to="/assistant">
                <ScanLine className="size-3.5" />
                Open AI Assistant
                <ArrowRight className="ml-auto size-3.5" />
              </Link>
            </Button>
            <p className="flex items-center justify-center text-[8px] text-faint gap-1.5 mt-3">
              <ShieldCheck className="size-3" />
              All recommendations need your validation
            </p>
          </div>
          <div className="panel panel-padding mt-5 max-[900px]:mt-0">
            <SectionHeading title="Network Domains">
              <Radio className="size-4 text-muted-foreground" />
            </SectionHeading>
            <p className="text-[10px] text-muted-foreground mb-4">Current incident distribution</p>
            {domainDistribution(incidents).map((domain) => (
              <div key={domain.title}>
                <div className="flex items-center justify-between text-[10px] mt-4">
                  <span className="text-muted-foreground">{domain.title}</span>
                  <span className="technical">{domain.percentage}%</span>
                </div>
                <div className="distribution-row mt-2">
                  <div className="distribution-track">
                    <progress
                      className={`w-full h-1.5 accent-primary ${domain.className}`}
                      max={100}
                      value={domain.percentage}
                      aria-label={`${domain.title} incident share`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 px-1 max-[900px]:hidden">
            <div className="flex gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="size-4 text-success" />
              <span>
                Built for the field.
                <br />
                <span className="text-faint text-[9px] leading-7">
                  Human expertise stays in control.
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
