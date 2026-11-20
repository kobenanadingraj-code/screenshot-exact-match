import type { SavedDocument, Incident } from "./demo";

export async function exportDocument(
  format: "pdf" | "docx",
  document: SavedDocument,
  incident: Incident,
  engineer: string,
) {
  const heading = document.kind === "report" ? "TELECOM INTERVENTION REPORT" : "NOC ESCALATION";
  const lines = [
    heading,
    "AI FIELD ASSISTANT · SIMULATED DEMONSTRATION",
    `Reference: ${document.id}`,
    `Site: ${incident.site}`,
    `Incident: ${incident.id}`,
    `Engineer: ${engineer}`,
    `Generated: ${document.date}`,
    `Validation: ${document.validated ? "Engineer-reviewed demonstration record" : "UNVALIDATED DRAFT"}`,
    "",
    document.content,
  ];
  if (format === "pdf") {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.setFont("helvetica");
    pdf.setFontSize(10);
    let y = 22;
    for (const line of lines) {
      const wrapped: string[] = pdf.splitTextToSize(line, 170);
      for (const item of wrapped) {
        if (y > 275) {
          pdf.addPage();
          y = 22;
        }
        pdf.text(item, 20, y);
        y += 5.5;
      }
      y += 3;
    }
    pdf.save(`${document.id}.pdf`);
  } else {
    const { Document, Packer, Paragraph, HeadingLevel } = await import("docx");
    const file = new Document({
      sections: [
        {
          children: lines.flatMap((line, index) =>
            line
              .split("\n")
              .map(
                (text) =>
                  new Paragraph(
                    index === 0
                      ? { text, heading: HeadingLevel.TITLE }
                      : { text, spacing: { after: 120 } },
                  ),
              ),
          ),
        },
      ],
    });
    const blob = await Packer.toBlob(file);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.id}.docx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
