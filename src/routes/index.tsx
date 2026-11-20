import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/field/overview";
import { pageHead } from "@/lib/demo";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "AI Overview",
      "Your intelligent telecom operations workspace. Review sample incidents, prepare diagnoses, and generate engineer-validated documents.",
    ),
  component: Overview,
});
