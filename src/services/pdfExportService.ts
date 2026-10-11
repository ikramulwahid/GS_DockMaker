import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';
import { DocumentModel } from '../types/document';
import { getPageDimensions, PageDimensions } from '../utils/pageGeometry';
import { calculateDocumentPagination, DocumentPageLayout } from '../utils/paginationEngine';
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
 * Robustly waits for all page dependencies (fonts, images, formulas, layout stability)
 * instead of arbitrary fixed timeouts.
 */
async function waitForPageResourcesReady(containerEl: HTMLElement): Promise<void> {
  // 1. Await document fonts ready if supported by the browser
  if (typeof window !== 'undefined' && 'fonts' in window.document) {
    try {
      await (window.document as unknown as { fonts: { ready: Promise<void> } }).fonts.ready;
    } catch (e) {
      console.warn('Font readiness wait encountered minor issue:', e);
    }
  }

  // 2. Await all images within containerEl to complete loading or erroring
  const images = Array.from(containerEl.querySelectorAll('img'));
  if (images.length > 0) {
    const imagePromises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
        // Timeout guarantee per image: 2.5 seconds max
        setTimeout(resolve, 2500);
      });
    });
    await Promise.all(imagePromises);
  }

  // 3. Double requestAnimationFrame to ensure layout reflow and rendering pipeline are flush
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Extracts visible text elements with relative page coordinates (in millimeters)
 * from the rendered document page DOM.
 * This enables rendering an invisible text layer directly inside jsPDF,
 * transforming the raster visual layout into a fully searchable, selectable PDF.
 */
export interface TextSnippet {
  text: string;
  xMm: number;
  yMm: number;
  fontSizePt: number;
  isBold: boolean;
}

/**
 * Extracts visible text elements with relative page coordinates (in millimeters)
 * from the rendered document page DOM.
 * Enforces a strict leaf-ownership rule so that structural parent containers
 * (e.g. li, th, td, header, figcaption) never duplicate the text runs owned
 * by their inner content children.
 */
export function extractTextLayerFromPageElement(
  pageElement: HTMLElement,
  dimensions: PageDimensions
): TextSnippet[] {
  const snippets: TextSnippet[] = [];
  const pageRect = pageElement.getBoundingClientRect();
  if (pageRect.width <= 0 || pageRect.height <= 0) return snippets;

  // Conversion factors from DOM pixels to PDF millimeters
  const pxToMmh = dimensions.widthMm / pageRect.width;
  const pxToMmv = dimensions.heightMm / pageRect.height;

  // Structural parent tags whose text is delegated to child text blocks
  const STRUCTURAL_PARENT_TAGS = new Set([
    'HEADER',
    'FOOTER',
    'LI',
    'TH',
    'TD',
    'TABLE',
    'THEAD',
    'TBODY',
    'TR',
    'FIGURE',
    'ARTICLE',
    'DIV',
  ]);

  // Candidate selectors that represent coherent text units.
  // Using explicit content blocks avoids fragmentation across nested inline formatting tokens (strong, em, code, mark).
  const textSelectors = [
    // Header elements
    'header h1',
    'header span',
    // Running page headers (page 2+)
    'div[class*="border-b"] > span',
    // Heading elements (all levels)
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Body paragraphs
    'p',
    // List items
    'li',
    // Table headers and cells
    'th',
    'td',
    // Figure captions
    'figcaption',
    // Footers
    'footer span',
    // Formula equation numbers and explicit selectable tokens
    '[data-selectable-text]',
    'span[class*="tabular-nums"]',
    'div[class*="tabular-nums"]',
    // Metadata card/badge elements and signature blocks
    'div[class*="font-semibold text-slate-900"]',
    'div[class*="text-slate-600"]',
    'div[class*="text-slate-500"]',
  ];

  // Exclude elements inside KaTeX math rendering (which contains both visual spans and raw MathML)
  // to prevent duplicated formula math tokens or garbled math syntax in the text layer.
  const allNodes = Array.from(pageElement.querySelectorAll(textSelectors.join(', ')));

  const candidateNodes = allNodes.filter((node) => {
    const el = node as HTMLElement;
    // Skip if inside KaTeX rendered markup (except explicit equation numbers)
    if (el.closest('.katex') || el.closest('.katex-display') || el.closest('math')) {
      return false;
    }
    // Skip hidden or collapsed elements
    if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) {
      return false;
    }
    return true;
  });

  // Helper to extract direct text from an element without including text belonging to child candidate blocks
  const getDirectText = (el: HTMLElement, blockChildren: HTMLElement[]): string => {
    if (blockChildren.length === 0) {
      return el.innerText || '';
    }
    let direct = '';
    el.childNodes.forEach((child) => {
      if (child.nodeType === 3 /* Node.TEXT_NODE */) {
        direct += child.textContent || '';
      } else if (child.nodeType === 1 /* Node.ELEMENT_NODE */) {
        const childEl = child as HTMLElement;
        const hasBlock = blockChildren.some((cand) => childEl === cand || childEl.contains(cand));
        if (!hasBlock) {
          direct += childEl.innerText || childEl.textContent || '';
        }
      }
    });
    return direct.trim();
  };

  interface ResolvedTextRun {
    element: HTMLElement;
    text: string;
    xMm: number;
    yMm: number;
    fontSizePt: number;
    isBold: boolean;
  }

  const resolvedRuns: ResolvedTextRun[] = [];

  candidateNodes.forEach((node) => {
    const el = node as HTMLElement;
    const childCandidates = candidateNodes.filter(
      (other) => other !== el && el.contains(other)
    ) as HTMLElement[];

    // Extract text that belongs directly to this element (not delegated to child candidate blocks)
    const textContent = getDirectText(el, childCandidates);
    if (!textContent || textContent.length === 0) return;

    // Sanitize non-printable control characters
    const cleanText = textContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    if (!cleanText) return;

    const rect = el.getBoundingClientRect();
    const xMm = Math.max(0, (rect.left - pageRect.left) * pxToMmh);
    const yMm = Math.max(0, (rect.top - pageRect.top) * pxToMmv);

    // Compute approximate font size in pt: (px * 72 / 96)
    let fontSizePt = 10;
    let isBold = false;
    try {
      const computed = window.getComputedStyle(el);
      const fontSizePx = parseFloat(computed.fontSize) || 12;
      fontSizePt = Math.max(7, Math.min(24, Math.round(fontSizePx * (72 / 96))));
      isBold =
        computed.fontWeight === 'bold' ||
        computed.fontWeight === '700' ||
        computed.fontWeight === '600' ||
        parseInt(computed.fontWeight, 10) >= 600;
    } catch {
      // Fallback defaults
    }

    resolvedRuns.push({
      element: el,
      text: cleanText,
      xMm,
      yMm,
      fontSizePt,
      isBold,
    });
  });

  // Sort candidate elements by visual reading order: top-to-bottom, then left-to-right
  resolvedRuns.sort((a, b) => {
    if (Math.abs(a.yMm - b.yMm) > 1.5) {
      return a.yMm - b.yMm;
    }
    return a.xMm - b.xMm;
  });

  const seenPositions = new Set<string>();

  resolvedRuns.forEach((run) => {
    // High-precision deduplication key (0.01 mm) prevents adjacent cells or identical labels from colliding
    const locKey = `${run.xMm.toFixed(2)}_${run.yMm.toFixed(2)}_${run.text.slice(0, 32)}`;
    if (seenPositions.has(locKey)) return;
    seenPositions.add(locKey);

    // Normalizing text: split multi-line blocks so each line has reasonable vertical registration
    const lines = run.text.split('\n').map((l) => l.trim()).filter(Boolean);
    const lineSpacingMm = run.fontSizePt * 0.352778 * 1.25; // 1 pt = 0.352778 mm

    lines.forEach((line, lineIdx) => {
      snippets.push({
        text: line,
        xMm: run.xMm,
        yMm: run.yMm + lineIdx * lineSpacingMm + run.fontSizePt * 0.35, // Adjust slightly down to baseline
        fontSizePt: run.fontSizePt,
        isBold: run.isBold,
      });
    });
  });

  return snippets;
}

/**
 * Generates and downloads a genuine, paginated PDF directly from the document model.
 * Preserves high-fidelity appearance (margins, typography, KaTeX equations, tables, badges)
 * and overlays an invisible text layer to make all text searchable and selectable.
 */
export async function exportDocumentToPdf(
  document: DocumentModel,
  options?: PdfExportOptions
): Promise<void> {
  const dimensions = getPageDimensions(document.metadata);
  const pages: DocumentPageLayout[] = calculateDocumentPagination(document.blocks, dimensions);
  const totalPages = pages.length;

  if (totalPages === 0) {
    throw new Error('Cannot export empty document: No pages were generated by the pagination engine.');
  }

  const isLandscape = dimensions.orientation === 'Landscape';

  // Instantiate jsPDF with exact physical paper dimensions in millimeters
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [dimensions.widthMm, dimensions.heightMm],
    compress: true,
  });

  // Embed document metadata properties into the PDF
  pdf.setProperties({
    title: document.metadata.title || 'Untitled Document',
    author: document.metadata.author || '',
    subject: document.metadata.documentType || 'Document',
    creator: 'Document Studio',
  });

  const pageWidthMm = dimensions.widthMm;
  const pageHeightMm = dimensions.heightMm;

  let successfulPageCount = 0;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageNum = pageIdx + 1;
    if (options?.onProgress) {
      options.onProgress(pageNum, totalPages);
    }

    // Locate the on-screen rendered page element in the DOM
    const pageElement = window.document.getElementById(`document-page-${pageNum}`);

    if (!pageElement) {
      throw new Error(
        `PDF Export Failed: Rendered element for page ${pageNum} (#document-page-${pageNum}) was not found in the DOM. Ensure the Document Preview is open.`
      );
    }

    // Await font readiness, KaTeX typesetting, and image decoding explicitly
    await waitForPageResourcesReady(pageElement);

    let canvas: HTMLCanvasElement | null = null;

    try {
      // Primary high-DPI rasterization via html-to-image (native SVG foreignObject pipeline)
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
        throw new Error(
          `Page ${pageNum} export failure: Could not render page canvas (${retryError instanceof Error ? retryError.message : String(retryError)})`
        );
      }
    }

    if (!canvas) {
      throw new Error(`Page ${pageNum} export failure: Canvas generation yielded null.`);
    }

    // Add page in jsPDF if beyond page 1
    if (pageIdx > 0) {
      pdf.addPage([dimensions.widthMm, dimensions.heightMm], isLandscape ? 'landscape' : 'portrait');
    }

    // 1. Draw high-fidelity raster canvas image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

    // 2. Extract and draw searchable, selectable text layer using invisible rendering mode
    try {
      const textSnippets = extractTextLayerFromPageElement(pageElement, dimensions);
      for (const snippet of textSnippets) {
        pdf.setFont('helvetica', snippet.isBold ? 'bold' : 'normal');
        pdf.setFontSize(snippet.fontSizePt);
        // renderingMode: 'invisible' injects the text into the PDF content stream (operator 3 Tr)
        // so it can be selected, searched, and copied, perfectly aligned with the visual text underneath!
        pdf.text(snippet.text, snippet.xMm, snippet.yMm, {
          renderingMode: 'invisible',
        });
      }
    } catch (textLayerError) {
      console.warn(`Text layer extraction warning for page ${pageNum}:`, textLayerError);
      // Non-fatal: if text extraction has an isolated issue on an unusual element, the visual page is still preserved
    }

    successfulPageCount++;
  }

  if (successfulPageCount !== totalPages) {
    throw new Error(
      `PDF Export Incomplete: Expected ${totalPages} pages but only rendered ${successfulPageCount}.`
    );
  }

  // Trigger browser download with sanitized filename
  const filename = `${sanitizeFilename(document.metadata.title, 'Document')}.pdf`;
  pdf.save(filename);
}
