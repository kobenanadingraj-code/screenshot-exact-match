import { useState, useEffect, type ReactNode } from "react";
import { DemoContext } from "./demo-context";
import {
  sampleIncidents,
  initialSteps,
  initialActivities,
  type Incident,
  type DiagnosticStep,
  type Thread,
  type Activity,
  type SavedDocument,
} from "./demo";

import { type IncidentAnalysis, diagnosisForIncident } from "./incident-workflow";

function useDemoState() {
  const [incidents, setIncidents] = useState<Incident[]>(sampleIncidents);
  const [stepsByIncident, setStepsByIncident] = useState<Record<string, DiagnosticStep[]>>({
    "INC-2026-001": initialSteps,
  });
  const [threads, setThreads] = useState<Thread[]>([
    { id: "demo", title: "Supervision communication loss", messages: [] },
  ]);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [analyses, setAnalyses] = useState<Record<string, IncidentAnalysis>>({});
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [engineer, setEngineer] = useState("Jean Adingra");
  const [activeIncidentId, setActiveIncidentId] = useState("INC-2026-001");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const addActivity = (title: string, type: string, incident: string) =>
    setActivities((prev) => [
      { id: crypto.randomUUID(), title, type, incident, time: new Date().toISOString() },
      ...prev,
    ]);
  const resetDemo = () => {
    setIncidents(sampleIncidents);
    setStepsByIncident({ "INC-2026-001": initialSteps });
    setDocuments([]);
    setAnalyses({});
    setThreads([{ id: "demo", title: "Supervision communication loss", messages: [] }]);
    setActivities(initialActivities);
    setSavedArticles([]);
    setActiveIncidentId("INC-2026-001");
  };
  return {
    incidents,
    setIncidents,
    analyses,
    setAnalyses,
    initializeDiagnosis: (incident: Incident) =>
      setStepsByIncident((prev) =>
        prev[incident.id] ? prev : { ...prev, [incident.id]: diagnosisForIncident(incident) },
      ),
    deleteIncident: (id: string) => {
      setIncidents((prev) => prev.filter((i) => i.id !== id));
      setDocuments((prev) => prev.filter((d) => d.incidentId !== id));
      setStepsByIncident((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)),
      );
      setAnalyses((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)));
      if (activeIncidentId === id)
        setActiveIncidentId(incidents.find((i) => i.id !== id)?.id ?? "");
    },
    stepsByIncident,
    setStepsByIncident,
    threads,
    setThreads,
    activities,
    addActivity,
    documents,
    setDocuments,
    savedArticles,
    setSavedArticles,
    theme,
    setTheme,
    engineer,
    setEngineer,
    activeIncidentId,
    setActiveIncidentId,
    resetDemo,
  };
}
export type DemoState = ReturnType<typeof useDemoState>;
export function DemoProvider({ children }: { children: ReactNode }) {
  const state = useDemoState();
  return <DemoContext.Provider value={state}>{children}</DemoContext.Provider>;
}
