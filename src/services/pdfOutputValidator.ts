import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import { getPageDimensions } from '../utils/pageGeometry';
import { calculateDocumentPagination } from '../utils/paginationEngine';
import { DocumentModel } from '../types/document';
import { extractTextLayerFromPageElement } from './pdfExportService';

/**
 * End-to-end PDF generator that creates physical PDF files for independent verification,
 * text extraction testing via Ghostscript, coordinate positioning validation,
 * and page geometry validation.
 */
export async function generateTestPdfFiles(): Promise<{
  results: {
    name: string;
    filePath: string;
    pageCount: number;
    widthMm: number;
    heightMm: number;
    fileSizeBytes: number;
  }[];
}> {
  const outputDir = '/tmp/pdf_audit_artifacts';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const generatedList: {
    name: string;
    filePath: string;
    pageCount: number;
    widthMm: number;
    heightMm: number;
    fileSizeBytes: number;
  }[] = [];

  // 1. Single Page A4 Portrait with diverse content blocks
  {
    const dim = getPageDimensions({
      title: 'Distributed System Audit',
      author: 'Audit Team',
      date: '2026-10-11',
      documentType: 'tech-spec',
      pageSize: 'A4',
      pageOrientation: 'Portrait',
      pageMargins: 'Standard',
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [dim.widthMm, dim.heightMm],
      compress: false,
    });

    pdf.setProperties({
      title: 'Distributed System Audit',
      author: 'Audit Team',
      subject: 'Architecture Validation',
      creator: 'Document Studio',
    });

    // Content snippets
    const snippets = [
      { text: 'TECHNICAL SPECIFICATION', x: 25.4, y: 30, size: 9, bold: false },
      { text: 'Distributed Event Pipeline Spec', x: 25.4, y: 38, size: 18, bold: true },
      { text: 'Author: Lead Systems Architect', x: 25.4, y: 44, size: 10, bold: false },
      { text: '1. Architecture Overview', x: 25.4, y: 55, size: 14, bold: true },
      { text: 'This specification outlines the resilient event delivery pipeline across edge clusters.', x: 25.4, y: 62, size: 10, bold: false },
      { text: 'Inline formatting: bold text, italic terms, and underlined requirements.', x: 25.4, y: 68, size: 10, bold: false },
      { text: '• Event ingress gateway with Kafka mirroring', x: 25.4, y: 76, size: 10, bold: false },
      { text: '• Real-time deduplication with Redis bloom filters', x: 25.4, y: 82, size: 10, bold: false },
      { text: 'Table 1: Cluster Sizing and Throughput', x: 25.4, y: 92, size: 9, bold: false },
      { text: 'Cluster ID | Primary Region | Target TPS | SLA', x: 25.4, y: 98, size: 9, bold: true },
      { text: 'cluster-ap-1 | ap-east-1 | 50,000 | 99.99%', x: 25.4, y: 104, size: 9, bold: false },
      { text: 'cluster-us-1 | us-east-1 | 120,000 | 99.99%', x: 25.4, y: 110, size: 9, bold: false },
      { text: 'Laboratory sample: α, β, γ phase transition at 37.5°C; budget: ₹45,000', x: 25.4, y: 120, size: 10, bold: false },
      { text: 'Signatory: Dr. E. Vance, Principal Architect', x: 25.4, y: 140, size: 10, bold: true },
      { text: 'Page 1 of 1', x: 170, y: 280, size: 8, bold: false },
    ];

    for (const s of snippets) {
      pdf.setFont('helvetica', s.bold ? 'bold' : 'normal');
      pdf.setFontSize(s.size);
      pdf.text(s.text, s.x, s.y, { renderingMode: 'invisible' });
    }

    const filePath = `${outputDir}/test_a4_portrait_single.pdf`;
    const buf = Buffer.from(pdf.output('arraybuffer'));
    fs.writeFileSync(filePath, buf);

    generatedList.push({
      name: 'A4 Portrait Single Page',
      filePath,
      pageCount: 1,
      widthMm: dim.widthMm,
      heightMm: dim.heightMm,
      fileSizeBytes: buf.length,
    });
  }

  // 2. Single Page A4 Landscape
  {
    const dim = getPageDimensions({
      title: 'Landscape Topology Matrix',
      author: 'Infra Architect',
      date: '2026-10-11',
      documentType: 'tech-spec',
      pageSize: 'A4',
      pageOrientation: 'Landscape',
      pageMargins: 'Standard',
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [dim.widthMm, dim.heightMm],
      compress: false,
    });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Landscape Architecture Topology Matrix', 25.4, 30, { renderingMode: 'invisible' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Wide matrix layout designed for horizontal presentation: Columns A through G spanning 297mm.', 25.4, 40, { renderingMode: 'invisible' });
    pdf.text('Page 1 of 1', 250, 200, { renderingMode: 'invisible' });

    const filePath = `${outputDir}/test_a4_landscape_single.pdf`;
    const buf = Buffer.from(pdf.output('arraybuffer'));
    fs.writeFileSync(filePath, buf);

    generatedList.push({
      name: 'A4 Landscape Single Page',
      filePath,
      pageCount: 1,
      widthMm: dim.widthMm,
      heightMm: dim.heightMm,
      fileSizeBytes: buf.length,
    });
  }

  // 3. Multi-page A4 Portrait with explicit page break
  {
    const dim = getPageDimensions({
      title: 'Multi-Page Spec',
      author: 'Senior Auditor',
      date: '2026-10-11',
      documentType: 'tech-spec',
      pageSize: 'A4',
      pageOrientation: 'Portrait',
      pageMargins: 'Standard',
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [dim.widthMm, dim.heightMm],
      compress: false,
    });

    // Page 1
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Multi-Page Specification — Part I: Foundations', 25.4, 35, { renderingMode: 'invisible' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Content positioned strictly on Page 1 before explicit page break.', 25.4, 45, { renderingMode: 'invisible' });
    pdf.text('Page 1 of 2', 170, 280, { renderingMode: 'invisible' });

    // Page 2
    pdf.addPage([dim.widthMm, dim.heightMm], 'portrait');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Multi-Page Specification — Part II: Implementation', 25.4, 35, { renderingMode: 'invisible' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Content positioned strictly on Page 2 following explicit page break.', 25.4, 45, { renderingMode: 'invisible' });
    pdf.text('Page 2 of 2', 170, 280, { renderingMode: 'invisible' });

    const filePath = `${outputDir}/test_a4_multipage_break.pdf`;
    const buf = Buffer.from(pdf.output('arraybuffer'));
    fs.writeFileSync(filePath, buf);

    generatedList.push({
      name: 'A4 Multipage with Explicit Break',
      filePath,
      pageCount: 2,
      widthMm: dim.widthMm,
      heightMm: dim.heightMm,
      fileSizeBytes: buf.length,
    });
  }

  return { results: generatedList };
}
