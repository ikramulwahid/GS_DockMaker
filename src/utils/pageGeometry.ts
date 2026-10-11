import { DocumentMetadata } from '../types/document';

export interface PageDimensions {
  pageSize: string;
  orientation: 'Portrait' | 'Landscape';
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height
  widthPx: number; // reference 96 DPI CSS pixels
  heightPx: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  marginTopPx: number;
  marginBottomPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  printableWidthMm: number;
  printableHeightMm: number;
  printableWidthPx: number;
  printableHeightPx: number;
}

// 96 CSS pixels per inch, 25.4 millimeters per inch:
// 1 mm = 96 / 25.4 ≈ 3.779527559055118 CSS pixels
export const CSS_PX_PER_MM = 96 / 25.4;

export const PHYSICAL_PAGE_SIZES_MM: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  A5: { width: 148, height: 210 },
};

export const PHYSICAL_PAGE_MARGINS_MM: Record<
  string,
  { top: number; bottom: number; left: number; right: number }
> = {
  Standard: { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 }, // 1 inch
  Narrow: { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 }, // 0.5 inch
  Wide: { top: 38.1, bottom: 38.1, left: 38.1, right: 38.1 }, // 1.5 inch
  Academic: { top: 25.4, bottom: 25.4, left: 35.0, right: 20.0 }, // Left binding gutter
};

export function getPageDimensions(metadata: DocumentMetadata): PageDimensions {
  const baseSize = PHYSICAL_PAGE_SIZES_MM[metadata.pageSize] || PHYSICAL_PAGE_SIZES_MM.A4;
  let widthMm = baseSize.width;
  let heightMm = baseSize.height;

  // Swap physical dimensions strictly for Landscape
  if (metadata.pageOrientation === 'Landscape') {
    widthMm = baseSize.height;
    heightMm = baseSize.width;
  }

  const baseMargins =
    PHYSICAL_PAGE_MARGINS_MM[metadata.pageMargins] || PHYSICAL_PAGE_MARGINS_MM.Standard;

  let marginTopMm = baseMargins.top;
  let marginBottomMm = baseMargins.bottom;
  let marginLeftMm = baseMargins.left;
  let marginRightMm = baseMargins.right;

  // If Academic binding in landscape, swap margins to keep binding at the top/left edge appropriately
  if (metadata.pageOrientation === 'Landscape' && metadata.pageMargins === 'Academic') {
    marginTopMm = 30.0;
    marginBottomMm = 20.0;
    marginLeftMm = 25.4;
    marginRightMm = 25.4;
  }

  const printableWidthMm = Math.max(20, widthMm - marginLeftMm - marginRightMm);
  const printableHeightMm = Math.max(20, heightMm - marginTopMm - marginBottomMm);

  // Exact reference CSS pixels at 96 DPI:
  // e.g., A4 Portrait: 210 * (96 / 25.4) = 793.7007874015748 px
  //                     297 * (96 / 25.4) = 1122.51968503937 px
  const widthPx = widthMm * CSS_PX_PER_MM;
  const heightPx = heightMm * CSS_PX_PER_MM;

  const marginTopPx = marginTopMm * CSS_PX_PER_MM;
  const marginBottomPx = marginBottomMm * CSS_PX_PER_MM;
  const marginLeftPx = marginLeftMm * CSS_PX_PER_MM;
  const marginRightPx = marginRightMm * CSS_PX_PER_MM;

  const printableWidthPx = printableWidthMm * CSS_PX_PER_MM;
  const printableHeightPx = printableHeightMm * CSS_PX_PER_MM;

  const aspectRatio = widthMm / heightMm;

  return {
    pageSize: metadata.pageSize,
    orientation: metadata.pageOrientation,
    widthMm,
    heightMm,
    aspectRatio,
    widthPx,
    heightPx,
    marginTopMm,
    marginBottomMm,
    marginLeftMm,
    marginRightMm,
    marginTopPx,
    marginBottomPx,
    marginLeftPx,
    marginRightPx,
    printableWidthMm,
    printableHeightMm,
    printableWidthPx,
    printableHeightPx,
  };
}

/**
 * Calculates fit-to-width and fit-to-page scale factors given viewport and physical dimensions.
 */
export function calculateFitScales(
  viewportWidthPx: number,
  viewportHeightPx: number,
  pageWidthPx: number,
  pageHeightPx: number,
  paddingPx: number = 48
): { fitWidthScale: number; fitPageScale: number } {
  const availWidth = Math.max(100, viewportWidthPx - paddingPx);
  const availHeight = Math.max(100, viewportHeightPx - paddingPx);

  const fitWidthScale = Math.max(0.2, Math.min(2.0, availWidth / pageWidthPx));
  const fitPageScale = Math.max(
    0.2,
    Math.min(2.0, Math.min(availWidth / pageWidthPx, availHeight / pageHeightPx))
  );

  return {
    fitWidthScale: Math.round(fitWidthScale * 100) / 100,
    fitPageScale: Math.round(fitPageScale * 100) / 100,
  };
}
