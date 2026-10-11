import {
  getPageDimensions,
  calculateFitScales,
  CSS_PX_PER_MM,
} from './pageGeometry';
import { DocumentMetadata } from '../types/document';

/**
 * Development-time assertions and sanity checks for physical page geometry calculations.
 * Runs in browser and test environments to guarantee dimensional fidelity.
 */
export function runPageGeometrySelfTests(): {
  allPassed: boolean;
  results: { testName: string; passed: boolean; details: string }[];
} {
  const results: { testName: string; passed: boolean; details: string }[] = [];

  const check = (testName: string, condition: boolean, details: string) => {
    results.push({ testName, passed: condition, details });
  };

  // 1. A4 Portrait dimensions
  const a4PortraitMeta: DocumentMetadata = {
    title: 'Test',
    author: 'Tester',
    date: '2026-10-10',
    documentType: 'report',
    pageSize: 'A4',
    pageOrientation: 'Portrait',
    pageMargins: 'Standard',
  };
  const a4P = getPageDimensions(a4PortraitMeta);
  check(
    'A4 Portrait Dimensions',
    a4P.widthMm === 210 && a4P.heightMm === 297,
    `Expected 210x297 mm, got ${a4P.widthMm}x${a4P.heightMm} mm`
  );

  // 2. A4 Portrait aspect ratio (~0.7071)
  const expectedA4Ratio = 210 / 297;
  check(
    'A4 Portrait Aspect Ratio',
    Math.abs(a4P.aspectRatio - expectedA4Ratio) < 0.0001,
    `Expected ~${expectedA4Ratio.toFixed(4)}, got ${a4P.aspectRatio.toFixed(4)}`
  );

  // 3. A4 Landscape dimensions & aspect ratio (~1.4143)
  const a4LandscapeMeta: DocumentMetadata = {
    ...a4PortraitMeta,
    pageOrientation: 'Landscape',
  };
  const a4L = getPageDimensions(a4LandscapeMeta);
  check(
    'A4 Landscape Dimensions',
    a4L.widthMm === 297 && a4L.heightMm === 210,
    `Expected 297x210 mm, got ${a4L.widthMm}x${a4L.heightMm} mm`
  );
  check(
    'A4 Landscape Aspect Ratio',
    Math.abs(a4L.aspectRatio - 297 / 210) < 0.0001,
    `Expected ~1.4143, got ${a4L.aspectRatio.toFixed(4)}`
  );

  // 4. Standard Margins (1 inch = 25.4 mm)
  check(
    'Standard Margins (1 in / 25.4 mm)',
    a4P.marginTopMm === 25.4 && a4P.marginLeftMm === 25.4,
    `Expected 25.4 mm margins, got ${a4P.marginTopMm} mm`
  );

  // 5. Printable area calculation
  const expectedPrintableW = 210 - 25.4 * 2;
  const expectedPrintableH = 297 - 25.4 * 2;
  check(
    'Printable Area',
    Math.abs(a4P.printableWidthMm - expectedPrintableW) < 0.01 &&
      Math.abs(a4P.printableHeightMm - expectedPrintableH) < 0.01,
    `Expected ${expectedPrintableW}x${expectedPrintableH} mm, got ${a4P.printableWidthMm}x${a4P.printableHeightMm} mm`
  );

  // 6. 96 DPI CSS Pixels (793.70 x 1122.52 px)
  const expectedWidthPx = 210 * (96 / 25.4);
  const expectedHeightPx = 297 * (96 / 25.4);
  check(
    'CSS Reference 96 DPI Pixels',
    Math.abs(a4P.widthPx - expectedWidthPx) < 0.01 &&
      Math.abs(a4P.heightPx - expectedHeightPx) < 0.01,
    `Expected ${expectedWidthPx.toFixed(2)}x${expectedHeightPx.toFixed(2)} px, got ${a4P.widthPx.toFixed(2)}x${a4P.heightPx.toFixed(2)} px`
  );

  // 7. Fit scales math
  const { fitWidthScale, fitPageScale } = calculateFitScales(800, 1000, a4P.widthPx, a4P.heightPx, 48);
  check(
    'Fit Scales Math',
    fitWidthScale > 0 && fitPageScale > 0 && fitPageScale <= fitWidthScale,
    `fitWidth: ${fitWidthScale}, fitPage: ${fitPageScale}`
  );

  // 8. Letter paper size (215.9 x 279.4 mm)
  const letterMeta: DocumentMetadata = {
    ...a4PortraitMeta,
    pageSize: 'Letter',
  };
  const letter = getPageDimensions(letterMeta);
  check(
    'US Letter Dimensions',
    letter.widthMm === 215.9 && letter.heightMm === 279.4,
    `Expected 215.9x279.4 mm, got ${letter.widthMm}x${letter.heightMm} mm`
  );

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}

// Automatically execute self-test in dev mode
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const { allPassed, results } = runPageGeometrySelfTests();
  if (!allPassed) {
    console.error('Page Geometry Self-Tests Failed:', results);
  } else {
    // Verified silently
  }
}
