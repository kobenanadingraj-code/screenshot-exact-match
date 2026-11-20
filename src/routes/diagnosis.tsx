import { createFileRoute } from "@tanstack/react-router";
import { Diagnosis } from "@/components/field/diagnosis";
import { pageHead } from "@/lib/demo";
export const Route = createFileRoute("/diagnosis")({
  head: () =>
    pageHead(
      "Smart Diagnosis",
      "Separate confirmed facts, hypotheses, and missing information with a manually verified diagnostic checklist.",
    ),
  component: Diagnosis,
});
