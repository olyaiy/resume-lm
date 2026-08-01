import type { Resume } from "@/lib/types";
import { createElement } from "react";

/**
 * Keep PDF-only dependencies out of the live editor bundle. This function is
 * called only by explicit download or print-preview actions.
 */
export async function createResumePdfBlob(resume: Resume): Promise<Blob> {
  const [{ pdf }, { ResumePDFDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./resume-pdf-document"),
  ]);

  const document = createElement(ResumePDFDocument, { resume }) as Parameters<typeof pdf>[0];
  return pdf(document).toBlob();
}
