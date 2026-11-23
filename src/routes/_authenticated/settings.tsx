import { createFileRoute } from "@tanstack/react-router";
import { SettingsWorkspace } from "@/components/field/library";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/_authenticated/settings")({
  head: () =>
    pageHead(
      "Workspace Settings",
      "Manage your engineer profile, appearance, and private saved workspace.",
    ),
  component: SettingsWorkspace,
});
