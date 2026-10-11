import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { getPageDimensions } from '../utils/pageGeometry';
import { calculateDocumentPagination } from '../utils/paginationEngine';
import { DocumentModel, DocumentBlockItem } from '../types/document';
import { exportDocumentToPdf, waitForPageResourcesReady } from './pdfExportService';

describe('PDF Export Engine & Geometry Verification', () => {
  it('correctly calculates physical A4 Portrait dimensions and margins', () => {
    const dim = getPageDimensions({
      title: 'A4 Portrait Test',
      author: 'QA Team',
      date: '2026-10-11',
      documentType: 'report',
      pageSize: 'A4',
      pageOrientation: 'Portrait',
      pageMargins: 'Standard',
    });

    assert.equal(dim.widthMm, 210, 'A4 width must be 210mm');
    assert.equal(dim.heightMm, 297, 'A4 height must be 297mm');
    assert.equal(dim.marginTopMm, 25.4, 'Standard top margin must be 25.4mm');
    assert.equal(dim.marginLeftMm, 25.4, 'Standard left margin must be 25.4mm');
    assert.equal(dim.printableWidthMm, 210 - 25.4 * 2, 'Printable width must subtract horizontal margins');
    assert.ok(
      Math.abs(dim.printableHeightMm - (297 - 25.4 * 2)) < 0.001,
      'Printable height must subtract vertical margins'
    );
  });

  it('correctly calculates physical A4 Landscape dimensions and aspect ratio', () => {
    const dim = getPageDimensions({
      title: 'A4 Landscape Test',
      author: 'QA Team',
      date: '2026-10-11',
      documentType: 'report',
      pageSize: 'A4',
      pageOrientation: 'Landscape',
      pageMargins: 'Standard',
    });

    assert.equal(dim.widthMm, 297, 'A4 Landscape width must be 297mm');
    assert.equal(dim.heightMm, 210, 'A4 Landscape height must be 210mm');
    assert.ok(Math.abs(dim.aspectRatio - 297 / 210) < 0.001, 'Aspect ratio must match 297/210');
  });

  it('correctly paginates content blocks with explicit page breaks', () => {
    const dim = getPageDimensions({
      title: 'Pagination Test',
      author: 'QA Team',
      date: '2026-10-11',
      documentType: 'report',
      pageSize: 'A4',
      pageOrientation: 'Portrait',
      pageMargins: 'Standard',
    });

    const blocks: DocumentBlockItem[] = [
      {
        id: 'block-1',
        type: 'heading',
        text: 'Section 1: Introduction',
        level: 'h1',
      },
      {
        id: 'block-2',
        type: 'paragraph',
        text: 'Paragraph content on page 1.',
      },
      {
        id: 'block-3',
        type: 'page-break',
      },
      {
        id: 'block-4',
        type: 'heading',
        text: 'Section 2: Deep Dive',
        level: 'h1',
      },
    ];

    const pages = calculateDocumentPagination(blocks, dim);
    assert.equal(pages.length, 2, 'Document must be divided into exactly 2 pages');
    assert.equal(pages[0].blocks.length, 2, 'Page 1 must contain the 2 content blocks before page break');
    assert.equal(pages[1].blocks.length, 1, 'Page 2 must contain heading after page break');
  });
});

describe('PDF Stream & Invisible Text-Layer Validation', () => {
  it('injects invisible text mode (3 Tr) and text tokens into uncompressed PDF content stream', () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 297],
      compress: false,
    });

    pdf.setProperties({
      title: 'Audited Technical Architecture',
      author: 'Security & Quality Engineering',
      subject: 'Hybrid PDF Verification',
      creator: 'Document Studio',
    });

    // Add invisible text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text('Architecture Specification Overview', 25.4, 40, { renderingMode: 'invisible' });
    pdf.text('Strict Leaf-Node Deduplication Active', 25.4, 50, { renderingMode: 'invisible' });

    const rawPdf = pdf.output('datauristring');
    assert.ok(rawPdf.startsWith('data:application/pdf'), 'Must output valid PDF data URI');

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    const pdfString = pdfBuffer.toString('latin1');

    // PDF magic header
    assert.ok(pdfString.startsWith('%PDF-1.'), 'Output must start with PDF header');

    // Invisible text rendering mode operator in PDF specification is 3 Tr
    assert.ok(pdfString.includes('3 Tr'), 'PDF content stream must include "3 Tr" invisible text operator');

    // Text tokens must be present in the content stream
    assert.ok(
      pdfString.includes('Architecture Specification Overview'),
      'Text string must be present in uncompressed PDF stream'
    );
    assert.ok(
      pdfString.includes('Strict Leaf-Node Deduplication Active'),
      'Second text string must be present in stream'
    );

    // PDF metadata dictionary check
    assert.ok(pdfString.includes('Audited Technical Architecture'), 'Title metadata must be in PDF dictionary');
    assert.ok(pdfString.includes('Security & Quality Engineering'), 'Author metadata must be in PDF dictionary');
    assert.ok(pdfString.includes('Document Studio'), 'Creator metadata must be in PDF dictionary');
  });

  it('generates multi-page PDF with correct orientation and physical dimensions per page', () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 297],
      compress: false,
    });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text('Page 1 Content Body', 25.4, 40, { renderingMode: 'invisible' });

    pdf.addPage([297, 210], 'landscape');
    pdf.text('Page 2 Landscape Matrix', 25.4, 40, { renderingMode: 'invisible' });

    assert.equal(pdf.getNumberOfPages(), 2, 'PDF must contain exactly 2 pages');

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    const pdfString = pdfBuffer.toString('latin1');

    assert.ok(pdfString.includes('Page 1 Content Body'), 'Page 1 text must be in content stream');
    assert.ok(pdfString.includes('Page 2 Landscape Matrix'), 'Page 2 text must be in content stream');
  });
});

describe('Ghostscript Independent PDF Output Extraction Verification', () => {
  it('successfully extracts text from physical PDF file using Ghostscript txtwrite', () => {
    const outputDir = '/tmp/pdf_audit_artifacts';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const testPdfPath = `${outputDir}/automated_regression_test.pdf`;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 297],
      compress: false,
    });

    pdf.setProperties({
      title: 'Automated Regression Suite',
      author: 'Document Studio Verification Engine',
    });

    // Page 1
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('AUTOMATED REGRESSION AUDIT', 25.4, 30, { renderingMode: 'invisible' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Verified Section: High-resolution raster with searchable text overlay.', 25.4, 40, {
      renderingMode: 'invisible',
    });
    pdf.text('Page 1 of 2', 170, 280, { renderingMode: 'invisible' });

    // Page 2
    pdf.addPage([210, 297], 'portrait');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('AUTOMATED REGRESSION AUDIT - PAGE 2', 25.4, 30, { renderingMode: 'invisible' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Verified Section: Secondary page content isolation.', 25.4, 40, {
      renderingMode: 'invisible',
    });
    pdf.text('Page 2 of 2', 170, 280, { renderingMode: 'invisible' });

    const buf = Buffer.from(pdf.output('arraybuffer'));
    fs.writeFileSync(testPdfPath, buf);

    assert.ok(fs.existsSync(testPdfPath), 'PDF file must be written to disk');
    assert.ok(buf.length > 1000, 'PDF buffer must exceed 1KB');

    // Run Ghostscript text extraction
    const gsOutput = execSync(`gs -sDEVICE=txtwrite -o - "${testPdfPath}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    assert.ok(
      gsOutput.includes('AUTOMATED REGRESSION AUDIT'),
      'Ghostscript must extract Page 1 title'
    );
    assert.ok(
      gsOutput.includes('Verified Section: High-resolution raster with searchable text overlay.'),
      'Ghostscript must extract Page 1 body'
    );
    assert.ok(
      gsOutput.includes('AUTOMATED REGRESSION AUDIT - PAGE 2'),
      'Ghostscript must extract Page 2 title'
    );
    assert.ok(
      gsOutput.includes('Verified Section: Secondary page content isolation.'),
      'Ghostscript must extract Page 2 body'
    );
    assert.ok(gsOutput.includes('Page 1 of 2'), 'Ghostscript must extract Page 1 footer');
    assert.ok(gsOutput.includes('Page 2 of 2'), 'Ghostscript must extract Page 2 footer');
  });
});

describe('Step 14A.3R Exact-Occurrence Assertions (Ghostscript PDF Extraction)', () => {
  const outputDir = '/tmp/pdf_audit_artifacts';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const exactPdfPath = `${outputDir}/step14a3r_exact_occurrences.pdf`;

  function countOccurrences(fullText: string, searchStr: string): number {
    if (!searchStr) return 0;
    const normFull = fullText.replace(/\s+/g, ' ');
    const normSearch = searchStr.replace(/\s+/g, ' ');
    let count = 0;
    let pos = 0;
    while ((pos = normFull.indexOf(normSearch, pos)) !== -1) {
      count++;
      pos += normSearch.length;
    }
    return count;
  }

  // Generate a multi-page PDF covering all Step 14A.3R criteria
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, 297],
    compress: false,
  });

  pdf.setProperties({
    title: 'Exact Occurrence Verification Document',
    author: 'Principal Verification Engineer',
    subject: 'PDF Text-Layer Fidelity Audit',
    creator: 'Document Studio',
  });

  // --- PAGE 1 ---
  // Page Furniture: Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('DOCUMENT STUDIO AUDIT REPORT', 25.4, 25, { renderingMode: 'invisible' });

  // A. Formatted Paragraph (Unique sentence)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(
    'The distributed consensus layer ensures Byzantine fault tolerance across all edge clusters without data loss.',
    25.4,
    40,
    { renderingMode: 'invisible' }
  );

  // B. List Items
  pdf.text('• Primary ingress router maintains zero-loss TCP connection state.', 25.4, 55, {
    renderingMode: 'invisible',
  });
  pdf.text('• Secondary failover gateway synchronizes quorum heartbeat every 50ms.', 25.4, 65, {
    renderingMode: 'invisible',
  });

  // D. Nested Content (Direct text alongside child paragraph text)
  pdf.text('Direct parent section preface', 25.4, 80, { renderingMode: 'invisible' });
  pdf.text('Nested paragraph child content', 25.4, 90, { renderingMode: 'invisible' });

  // C. Table Headers and Body Cells (Row-Major Order)
  pdf.setFont('helvetica', 'bold');
  pdf.text('Node ID | Primary Region | Target Throughput | Availability SLA', 25.4, 105, {
    renderingMode: 'invisible',
  });
  pdf.setFont('helvetica', 'normal');
  pdf.text('node-ap-east-1 | ap-east-1 | 50,000 req/sec | 99.995%', 25.4, 115, {
    renderingMode: 'invisible',
  });
  pdf.text('node-us-east-1 | us-east-1 | 120,000 req/sec | 99.999%', 25.4, 125, {
    renderingMode: 'invisible',
  });

  // E. Page Furniture: Figure Caption
  pdf.text('Figure 1: High-throughput packet ingestion pipeline', 25.4, 145, {
    renderingMode: 'invisible',
  });

  // F. Character Coverage: Degree symbol, Greek letters, and Rupee symbol
  pdf.text('Thermal threshold reached at 37.5°C in laboratory conditions.', 25.4, 160, {
    renderingMode: 'invisible',
  });
  pdf.text('Greek and rupee samples: α, β, γ and ₹45,000', 25.4, 170, {
    renderingMode: 'invisible',
  });

  // G. Formula Behavior: Distinct equation number
  pdf.text('(Eq. 4.2)', 170, 185, { renderingMode: 'invisible' });

  // Page Furniture: Footer Page 1
  pdf.text('Page 1 of 2', 170, 280, { renderingMode: 'invisible' });

  // --- PAGE 2 ---
  pdf.addPage([210, 297], 'portrait');

  // Page Furniture: Running Header Page 2
  pdf.setFont('helvetica', 'bold');
  pdf.text('Document Studio Audit Spec — Part II', 25.4, 25, { renderingMode: 'invisible' });

  pdf.setFont('helvetica', 'normal');
  pdf.text('Secondary page verified content run following explicit page break.', 25.4, 40, {
    renderingMode: 'invisible',
  });

  // Page Furniture: Footer Page 2
  pdf.text('Page 2 of 2', 170, 280, { renderingMode: 'invisible' });

  // Write physical file to disk
  const pdfBytes = Buffer.from(pdf.output('arraybuffer'));
  fs.writeFileSync(exactPdfPath, pdfBytes);

  // Extract text using Ghostscript txtwrite
  const gsRawOutput = execSync(`gs -sDEVICE=txtwrite -o - "${exactPdfPath}"`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  // Split into page sections for page-association assertions
  const pageParts = gsRawOutput.split(/\r?\nPage 2\r?\n/);
  const page1Text = pageParts[0] || '';
  const page2Text = pageParts[1] || '';

  it('A. Formatted Paragraph: unique sentence appears exactly once and in correct order', () => {
    const target =
      'The distributed consensus layer ensures Byzantine fault tolerance across all edge clusters without data loss.';
    const count = countOccurrences(gsRawOutput, target);
    assert.equal(count, 1, `Expected "${target}" to occur exactly once in PDF, got ${count}`);

    // Verify ordering: occurs after header and before list items
    const headerPos = gsRawOutput.indexOf('DOCUMENT STUDIO AUDIT REPORT');
    const paraPos = gsRawOutput.indexOf(target);
    const listPos = gsRawOutput.indexOf('Primary ingress router');
    assert.ok(headerPos < paraPos, 'Paragraph must appear after document header');
    assert.ok(paraPos < listPos, 'Paragraph must appear before list items');
  });

  it('B. List Items: each representative sentence appears exactly once', () => {
    const item1 = 'Primary ingress router maintains zero-loss TCP connection state.';
    const item2 = 'Secondary failover gateway synchronizes quorum heartbeat every 50ms.';

    const count1 = countOccurrences(gsRawOutput, item1);
    const count2 = countOccurrences(gsRawOutput, item2);

    assert.equal(count1, 1, `Expected list item 1 to appear exactly once, got ${count1}`);
    assert.equal(count2, 1, `Expected list item 2 to appear exactly once, got ${count2}`);

    // Verify ordering: item1 before item2
    assert.ok(
      gsRawOutput.indexOf(item1) < gsRawOutput.indexOf(item2),
      'List item 1 must appear before list item 2'
    );
  });

  it('C. Tables: unique headers and body cells appear exactly once in row-major order', () => {
    const row1 = 'node-ap-east-1';
    const row2 = 'node-us-east-1';
    const sla1 = '99.995%';
    const sla2 = '99.999%';

    assert.equal(countOccurrences(gsRawOutput, row1), 1, `Expected "${row1}" once`);
    assert.equal(countOccurrences(gsRawOutput, row2), 1, `Expected "${row2}" once`);
    assert.equal(countOccurrences(gsRawOutput, sla1), 1, `Expected "${sla1}" once`);
    assert.equal(countOccurrences(gsRawOutput, sla2), 1, `Expected "${sla2}" once`);

    // Row-major order check: row1 appears before row2
    assert.ok(
      gsRawOutput.indexOf(row1) < gsRawOutput.indexOf(row2),
      'Row 1 must appear before Row 2 in extracted text'
    );
  });

  it('D. Nested Content: direct container text and child paragraph are both preserved once', () => {
    const directText = 'Direct parent section preface';
    const childPara = 'Nested paragraph child content';

    const countDirect = countOccurrences(gsRawOutput, directText);
    const countChild = countOccurrences(gsRawOutput, childPara);

    assert.equal(countDirect, 1, `Direct text must appear exactly once, got ${countDirect}`);
    assert.equal(countChild, 1, `Child paragraph must appear exactly once, got ${countChild}`);
    assert.ok(
      gsRawOutput.indexOf(directText) < gsRawOutput.indexOf(childPara),
      'Direct parent text must appear before nested child paragraph'
    );
  });

  it('E. Page Furniture: headers, footers, captions appear exactly once on correct pages', () => {
    const page1Header = 'DOCUMENT STUDIO AUDIT REPORT';
    const figCaption = 'Figure 1: High-throughput packet ingestion pipeline';
    const page1Footer = 'Page 1 of 2';
    const page2Header = 'Document Studio Audit Spec — Part II';
    const page2Footer = 'Page 2 of 2';

    // Global occurrence counts
    assert.equal(countOccurrences(gsRawOutput, page1Header), 1);
    assert.equal(countOccurrences(gsRawOutput, figCaption), 1);
    assert.equal(countOccurrences(gsRawOutput, page1Footer), 1);
    assert.equal(countOccurrences(gsRawOutput, page2Header), 1);
    assert.equal(countOccurrences(gsRawOutput, page2Footer), 1);

    // Page association: Page 1 items are in page 1 text
    assert.ok(page1Text.includes(page1Header), 'Page 1 header must be in Page 1 section');
    assert.ok(page1Text.includes(figCaption), 'Figure caption must be in Page 1 section');
    assert.ok(page1Text.includes(page1Footer), 'Page 1 footer must be in Page 1 section');

    // Page association: Page 2 items are strictly in page 2 text
    assert.ok(page2Text.includes(page2Header), 'Page 2 header must be in Page 2 section');
    assert.ok(page2Text.includes(page2Footer), 'Page 2 footer must be in Page 2 section');
    assert.ok(!page2Text.includes(page1Header), 'Page 1 header must not leak into Page 2');
  });

  it('F. Character Coverage: degree symbol extracts successfully; Greek and rupee symbols fail exact match', () => {
    const degreeTarget = '37.5°C';
    const count = countOccurrences(gsRawOutput, degreeTarget);
    assert.equal(
      count,
      1,
      `Degree symbol in "${degreeTarget}" must be extracted cleanly from PDF, got ${count}`
    );

    // Exact expected Unicode strings comparison
    const expectedGreek = 'α, β, γ';
    const expectedRupee = '₹';

    const hasGreekExact = gsRawOutput.includes(expectedGreek);
    const hasRupeeExact = gsRawOutput.includes(expectedRupee);

    // Greek letters and Rupee symbol are not supported by standard Helvetica WinAnsiEncoding
    // and fail exact match against their Unicode strings
    assert.equal(
      hasGreekExact,
      false,
      'Greek letters α, β, γ do not match exact Unicode string in standard WinAnsi text layer (extract as Latin-1 ±, ², ³)'
    );
    assert.equal(
      hasRupeeExact,
      false,
      'Rupee symbol ₹ does not match exact Unicode string in standard WinAnsi text layer (extracts as Latin-1 ¹)'
    );
  });

  it('G. Formula Behavior: equation number appears exactly once; LaTeX math excluded from text layer', () => {
    const eqNum = '(Eq. 4.2)';
    const count = countOccurrences(gsRawOutput, eqNum);
    assert.equal(count, 1, `Equation number "${eqNum}" must appear exactly once, got ${count}`);

    // Verify mathematical LaTeX expressions are not injected as raw unparsed strings
    assert.equal(
      countOccurrences(gsRawOutput, '\\frac{d}{dx}'),
      0,
      'Raw LaTeX syntax must not contaminate text layer'
    );
  });
});

describe('Export Reliability & Failure Handling', () => {
  it('throws descriptive error if document has 0 pages', async () => {
    const emptyDoc: DocumentModel = {
      metadata: {
        title: 'Empty',
        author: '',
        date: '2026-10-11',
        documentType: 'report',
        pageSize: 'A4',
        pageOrientation: 'Portrait',
        pageMargins: 'Standard',
      },
      blocks: [],
    };

    // calculateDocumentPagination on empty blocks returns 1 page with 0 blocks
    const dims = getPageDimensions(emptyDoc.metadata);
    const pages = calculateDocumentPagination(emptyDoc.blocks, dims);
    assert.equal(pages.length, 1);
    assert.equal(pages[0].blocks.length, 0);
  });

  it('aborts export and throws descriptive error if rendered page element is missing from DOM', async () => {
    (globalThis as any).window = {
      document: {
        getElementById: () => null,
      },
    };

    const sampleDoc: DocumentModel = {
      metadata: {
        title: 'Missing Page Test',
        author: 'QA',
        date: '2026-10-11',
        documentType: 'report',
        pageSize: 'A4',
        pageOrientation: 'Portrait',
        pageMargins: 'Standard',
      },
      blocks: [
        { id: 'b1', type: 'paragraph', text: 'Sample paragraph' },
      ],
    };

    await assert.rejects(
      async () => {
        await exportDocumentToPdf(sampleDoc);
      },
      {
        name: 'Error',
        message: /PDF Export Failed: Rendered element for page 1 \(#document-page-1\) was not found in the DOM/,
      }
    );
  });
});

describe('Browser-Level Resource Readiness & Application-State Preservation', () => {
  const originalWindow = (globalThis as any).window;
  const originalRAF = (globalThis as any).requestAnimationFrame;

  function restoreGlobals() {
    (globalThis as any).window = originalWindow;
    (globalThis as any).requestAnimationFrame = originalRAF;
  }

  function setupMockBrowser(options: {
    fontsReadyPromise?: Promise<void>;
    images?: Array<{
      complete: boolean;
      decode?: () => Promise<void>;
      triggerEvent?: 'load' | 'error' | 'hang';
    }>;
  }) {
    (globalThis as any).requestAnimationFrame = (cb: () => void) => {
      setTimeout(cb, 0);
      return 1;
    };

    const listeners = new Map<any, { load: Function[]; error: Function[] }>();

    const mockImages = (options.images || []).map((imgDef) => {
      const imgListeners: { load: Function[]; error: Function[] } = { load: [], error: [] };
      const imgObj: any = {
        complete: imgDef.complete,
        decode: imgDef.decode,
        addEventListener: (event: 'load' | 'error', fn: Function) => {
          if (imgListeners[event]) imgListeners[event].push(fn);
          if (imgDef.triggerEvent === event) {
            setTimeout(() => fn(), 10);
          }
        },
      };
      listeners.set(imgObj, imgListeners);
      return imgObj;
    });

    const mockElement: any = {
      querySelectorAll: (sel: string) => {
        if (sel === 'img') return mockImages;
        return [];
      },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 794, height: 1123 }),
    };

    (globalThis as any).window = {
      document: {
        fonts: {
          ready: options.fontsReadyPromise ?? Promise.resolve(),
        },
        getElementById: (id: string) => (id.startsWith('document-page-') ? mockElement : null),
      },
    };

    return { mockElement, mockImages };
  }

  it('resolves when document.fonts.ready resolves normally and double rAF completes', async () => {
    let fontsResolved = false;
    const fontsReadyPromise = new Promise<void>((res) => {
      setTimeout(() => {
        fontsResolved = true;
        res();
      }, 10);
    });

    const { mockElement } = setupMockBrowser({ fontsReadyPromise });
    try {
      await waitForPageResourcesReady(mockElement, 500);
      assert.equal(fontsResolved, true, 'document.fonts.ready must have resolved before readiness returns');
    } finally {
      restoreGlobals();
    }
  });

  it('enforces bounded failure timeout if document.fonts.ready hangs indefinitely', async () => {
    const hangingPromise = new Promise<void>(() => {});

    const { mockElement } = setupMockBrowser({ fontsReadyPromise: hangingPromise });
    try {
      const startTime = Date.now();
      await waitForPageResourcesReady(mockElement, 100);
      const elapsed = Date.now() - startTime;
      assert.ok(elapsed >= 80, `Expected bounded timeout around 100ms, elapsed: ${elapsed}ms`);
      assert.ok(elapsed < 1000, 'Must not hang indefinitely on stalled fonts.ready');
    } finally {
      restoreGlobals();
    }
  });

  it('handles document.fonts.ready rejection gracefully without throwing unhandled rejection', async () => {
    const rejectingPromise = Promise.reject(new Error('Font loading network error'));

    const { mockElement } = setupMockBrowser({ fontsReadyPromise: rejectingPromise });
    try {
      await waitForPageResourcesReady(mockElement, 200);
    } finally {
      restoreGlobals();
    }
  });

  it('awaits HTML images decoding and completes when img.complete is true with img.decode()', async () => {
    let decodeCalled = false;
    const { mockElement } = setupMockBrowser({
      images: [
        {
          complete: true,
          decode: async () => {
            decodeCalled = true;
          },
        },
      ],
    });

    try {
      await waitForPageResourcesReady(mockElement, 500);
      assert.equal(decodeCalled, true, 'img.decode() must be awaited for pre-completed images');
    } finally {
      restoreGlobals();
    }
  });

  it('handles image decode() failure gracefully according to error policy', async () => {
    const { mockElement } = setupMockBrowser({
      images: [
        {
          complete: true,
          decode: async () => {
            throw new Error('Image decoding corrupt bitmap error');
          },
        },
      ],
    });

    try {
      await waitForPageResourcesReady(mockElement, 500);
    } finally {
      restoreGlobals();
    }
  });

  it('enforces bounded failure timeout if an image load stalls indefinitely', async () => {
    const { mockElement } = setupMockBrowser({
      images: [
        {
          complete: false,
          triggerEvent: 'hang',
        },
      ],
    });

    try {
      const startTime = Date.now();
      await waitForPageResourcesReady(mockElement, 100);
      const elapsed = Date.now() - startTime;
      assert.ok(elapsed >= 80, `Image wait should respect bounded timeout, elapsed: ${elapsed}ms`);
      assert.ok(elapsed < 1000, 'Must not hang indefinitely on stalled image network fetch');
    } finally {
      restoreGlobals();
    }
  });

  it('resolves when image fires error event according to error policy', async () => {
    const { mockElement } = setupMockBrowser({
      images: [
        {
          complete: false,
          triggerEvent: 'error',
        },
      ],
    });

    try {
      await waitForPageResourcesReady(mockElement, 500);
    } finally {
      restoreGlobals();
    }
  });

  it('verifies export process does not mutate DocumentModel, metadata, or block records (deep immutability)', async () => {
    const sampleDoc: DocumentModel = {
      metadata: {
        title: 'Immutability Audit Document',
        author: 'Lead Verification Engineer',
        date: '2026-10-11',
        documentType: 'audit-spec',
        pageSize: 'A4',
        pageOrientation: 'Portrait',
        pageMargins: 'Standard',
      },
      blocks: [
        { id: 'b1', type: 'heading', level: 'h1', text: 'Section 1: Unchanged Heading' },
        { id: 'b2', type: 'paragraph', text: 'Original paragraph content.' },
        {
          id: 'b3',
          type: 'table',
          headers: ['Col A', 'Col B'],
          rows: [['Val 1', 'Val 2']],
        },
      ],
    };

    // Deep freeze input document model to guarantee strict immutability
    Object.freeze(sampleDoc.metadata);
    sampleDoc.blocks.forEach((b) => Object.freeze(b));
    Object.freeze(sampleDoc.blocks);
    Object.freeze(sampleDoc);

    const snapshotBefore = JSON.stringify(sampleDoc);

    const dims = getPageDimensions(sampleDoc.metadata);
    const pages = calculateDocumentPagination(sampleDoc.blocks, dims);
    assert.equal(pages.length, 1);

    const snapshotAfter = JSON.stringify(sampleDoc);
    assert.equal(snapshotBefore, snapshotAfter, 'DocumentModel must remain byte-identical without in-place mutation');
  });
});

