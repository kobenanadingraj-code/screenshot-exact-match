import { createFileRoute } from "@tanstack/react-router";
import { SettingsWorkspace } from "@/components/field/library";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/settings")({
  head: () =>
    pageHead(
      "Workspace Settings",
      "Manage your engineer profile, appearance, and clearly labeled session-only demonstration workspace.",
    ),
  component: SettingsWorkspace,
});
