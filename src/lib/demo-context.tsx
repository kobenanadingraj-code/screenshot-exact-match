import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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

function useDemoState() {
  const [incidents, setIncidents] = useState<Incident[]>(sampleIncidents);
  const [stepsByIncident, setStepsByIncident] = useState<Record<string, DiagnosticStep[]>>({
    "INC-2026-001": initialSteps,
  });
  const [threads, setThreads] = useState<Thread[]>([
    { id: "demo", title: "Supervision communication loss", messages: [] },
  ]);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
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
    setThreads([{ id: "demo", title: "Supervision communication loss", messages: [] }]);
    setActivities(initialActivities);
    setSavedArticles([]);
    setActiveIncidentId("INC-2026-001");
  };
  return {
    incidents,
    setIncidents,
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
type DemoState = ReturnType<typeof useDemoState>;
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const state = useDemoState();
  return <DemoContext.Provider value={state}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}
