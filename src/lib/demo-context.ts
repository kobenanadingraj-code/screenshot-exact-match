import { createContext, useContext } from "react";
import type { DemoState } from "./demo-provider";

// Keep context identity outside the provider's Fast Refresh boundary.
// Reloading a provider implementation must not recreate its consumers' context.
export const DemoContext = createContext<DemoState | null>(null);

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}
