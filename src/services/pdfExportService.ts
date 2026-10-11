import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { DocumentModel } from '../types/document';
import { getPageDimensions } from '../utils/pageGeometry';
import { calculateDocumentPagination } from '../utils/paginationEngine';
import { sanitizeFilename } from './documentSerializer';

export interface PdfExportOptions {
  onProgress?: (current: number, total: number) => void;
}

/**
 * 1x1 transparent SVG data URI placeholder for resilient fallback if remote images fail CORS
 */
const FALLBACK_IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23f1f5f9"/>';

/**
 * Generates and downloads a genuine, paginated PDF directly from the document model.
 * Uses exact physical dimensions (mm) matching authoritative page geometry,
 * faithfully preserving full layout, typography, KaTeX equations, tables, badges,
 * and page headers/footers in the generated PDF.
 */
export async function exportDocumentToPdf(
  document: DocumentModel,
  options?: PdfExportOptions
): Promise<void> {
  const dimensions = getPageDimensions(document.metadata);
  const pages = calculateDocumentPagination(document.blocks, dimensions);
  const totalPages = pages.length;

  const isLandscape = dimensions.orientation === 'Landscape';

  // Instantiate jsPDF with exact physical paper dimensions in millimeters
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [dimensions.widthMm, dimensions.heightMm],
    compress: true,
  });

  const pageWidthMm = dimensions.widthMm;
  const pageHeightMm = dimensions.heightMm;

  // Allow brief tick for DOM and layout stability
  await new Promise((resolve) => setTimeout(resolve, 80));

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageNum = pageIdx + 1;
    if (options?.onProgress) {
      options.onProgress(pageNum, totalPages);
    }

    // Locate the on-screen rendered page element in the DOM
    const pageElement = window.document.getElementById(`document-page-${pageNum}`);

    if (pageElement) {
      let canvas: HTMLCanvasElement | null = null;

      try {
        // High-DPI rasterization via html-to-image (native SVG foreignObject pipeline)
        // Correctly renders modern CSS colors (oklab/oklch), web fonts, KaTeX math formulas,
        // and exact margin padding without outdated CSS parser bugs.
        canvas = await toCanvas(pageElement, {
          pixelRatio: 2, // 2x scale (192 DPI) gives crisp, razor-sharp typography
          backgroundColor: '#ffffff',
          width: Math.round(dimensions.widthPx),
          height: Math.round(dimensions.heightPx),
          skipFonts: true, // Use already-loaded page fonts; avoids cross-origin CSS rule restrictions
          imagePlaceholder: FALLBACK_IMAGE_PLACEHOLDER,
          style: {
            transform: 'none',
            transformOrigin: 'top left',
            boxShadow: 'none',
            border: 'none',
            borderRadius: '0px',
            margin: '0',
            width: `${Math.round(dimensions.widthPx)}px`,
            height: `${Math.round(dimensions.heightPx)}px`,
            maxWidth: `${Math.round(dimensions.widthPx)}px`,
            maxHeight: `${Math.round(dimensions.heightPx)}px`,
          },
        });
      } catch (renderError) {
        console.warn(`Primary rasterization failed for page ${pageNum}, attempting image-safe retry:`, renderError);

        // Safe retry filtering out potentially tainted cross-origin images
        try {
          canvas = await toCanvas(pageElement, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            width: Math.round(dimensions.widthPx),
            height: Math.round(dimensions.heightPx),
            skipFonts: true,
            filter: (node) => node.tagName !== 'IMG',
            style: {
              transform: 'none',
              transformOrigin: 'top left',
              boxShadow: 'none',
              border: 'none',
              borderRadius: '0px',
              margin: '0',
              width: `${Math.round(dimensions.widthPx)}px`,
              height: `${Math.round(dimensions.heightPx)}px`,
            },
          });
        } catch (retryError) {
          console.error(`Page ${pageNum} export failure:`, retryError);
        }
      }

      if (pageIdx > 0) {
        pdf.addPage([dimensions.widthMm, dimensions.heightMm], isLandscape ? 'landscape' : 'portrait');
      }

      if (canvas) {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
      }
    } else {
      if (pageIdx > 0) {
        pdf.addPage([dimensions.widthMm, dimensions.heightMm], isLandscape ? 'landscape' : 'portrait');
      }
    }
  }

  // Trigger browser download with sanitized filename
  const filename = `${sanitizeFilename(document.metadata.title, 'Document')}.pdf`;
  pdf.save(filename);
}
