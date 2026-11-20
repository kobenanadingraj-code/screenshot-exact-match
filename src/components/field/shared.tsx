import type { ReactNode } from "react";
import { ShieldCheck, RadioTower, Hexagon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandSymbol({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? "assistant-mini-logo" : "brand-symbol"}>
      <div className="relative">
        <Hexagon className="size-7" strokeWidth={1.7} />
        <RadioTower className="absolute inset-0 m-auto size-3.5" strokeWidth={2} />
      </div>
    </div>
  );
}
export function Status({ value }: { value: string }) {
  const tone = ["Resolved", "Closed", "Verified", "Validated"].includes(value)
    ? "success"
    : ["Pending Escalation", "High", "Medium", "In Progress"].includes(value)
      ? "warning"
      : value === "Critical"
        ? "critical"
        : ["Not Started", "Not Applicable", "Draft", "Low"].includes(value)
          ? "neutral"
          : "";
  return <span className={cn("status-label", tone)}>{value}</span>;
}
export function SafetyNote({ children }: { children?: ReactNode }) {
  return (
    <div className="safety-note">
      <ShieldCheck className="size-4 shrink-0 mt-0.5" />
      <span>
        {children ??
          "AI-generated recommendations require human validation. No test is performed or fault resolved automatically."}
      </span>
    </div>
  );
}
export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="heading-row">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
export function IncidentPicker({
  value,
  onChange,
  incidents,
}: {
  value: string;
  onChange: (value: string) => void;
  incidents: { id: string; site: string }[];
}) {
  return (
    <select
      className="select-control"
      aria-label="Select incident"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {incidents.map((incident) => (
        <option key={incident.id} value={incident.id}>
          {incident.site} · {incident.id}
        </option>
      ))}
    </select>
  );
}
export function IncidentLink({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Link
      to="/incidents/$incidentId"
      params={{ incidentId: id }}
      className="text-info hover:underline technical"
    >
      {children}
    </Link>
  );
}
export function SectionHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
export function OpenIncidentButton({ id }: { id: string }) {
  return (
    <Button asChild variant="ghost" size="icon-sm" title="Open incident">
      <Link to="/incidents/$incidentId" params={{ incidentId: id }}>
        <ChevronRight />
      </Link>
    </Button>
  );
}
