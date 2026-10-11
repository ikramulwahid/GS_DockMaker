import { DocumentBlockItem } from '../types/document';
import { PageDimensions } from './pageGeometry';

export interface RenderedBlockRef {
  block: DocumentBlockItem;
  // If a block is split across pages (e.g. multi-row table or multi-item list), slice range can be stored
  subRange?: { start: number; end: number };
}

export interface DocumentPageLayout {
  pageNumber: number;
  totalPages: number;
  blocks: RenderedBlockRef[];
  isCoverPage?: boolean;
}

/**
 * Estimates heights for blocks based on typography, lines, rows, and dimensions.
 * Browser-safe calculation that runs synchronously and deterministically.
 */
export function estimateBlockHeight(block: DocumentBlockItem, printableWidthPx: number): number {
  switch (block.type) {
    case 'heading': {
      // Base line-height + padding/margins
      if (block.level === 'h1') return 52;
      if (block.level === 'h2') return 44;
      return 36;
    }

    case 'paragraph': {
      // Average chars per line at 13px font in standard measure (~70-80 chars)
      const text = block.text || '';
      const charsPerLine = Math.max(40, Math.floor(printableWidthPx / 7.2));
      const explicitLines = text.split('\n');
      let totalLines = 0;
      for (const line of explicitLines) {
        totalLines += Math.max(1, Math.ceil(line.length / charsPerLine));
      }
      // Line height ~ 20px, plus 16px bottom margin
      return Math.max(32, totalLines * 20 + 16);
    }

    case 'list': {
      const items = block.items || [];
      if (items.length === 0) return 30;
      let height = 12; // top/bottom padding
      for (const item of items) {
        const text = typeof item === 'string' ? item : item.text || '';
        const charsPerLine = Math.max(35, Math.floor((printableWidthPx - 30) / 7.2));
        const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
        height += lines * 20 + 8; // line height + item spacing
      }
      return height;
    }

    case 'formula': {
      // Display formula with padding
      return block.displayMode !== false ? 68 : 44;
    }

    case 'metadata': {
      const rowCount = block.rows?.length || 0;
      const titleHeight = block.title ? 28 : 0;
      // Table style vs card style
      if (block.style === 'cards') {
        return titleHeight + rowCount * 44 + 16;
      }
      return titleHeight + rowCount * 30 + 24;
    }

    case 'table': {
      const rowCount = block.rows?.length || 0;
      const captionHeight = block.caption ? 24 : 0;
      // Header row (36px) + data rows (~32px each) + borders & margin (16px)
      return captionHeight + 36 + rowCount * 32 + 20;
    }

    case 'image': {
      // Width percentage affects height aspect ratio
      const widthPct = (block.widthPercent || 100) / 100;
      const actualWidth = printableWidthPx * widthPct;
      // Standard figure aspect ratio ~16:9 or max height 220px
      const estimatedImgHeight = Math.min(220, Math.max(100, Math.round(actualWidth * 0.45)));
      const captionHeight = block.caption ? 24 : 0;
      return estimatedImgHeight + captionHeight + 20;
    }

    case 'page-break': {
      return 0; // Page breaks do not take printable vertical space; they trigger split
    }

    case 'signature': {
      // Signature line, name, title, organization, date
      return 110;
    }

    default:
      return 40;
  }
}

/**
 * Calculates page split and flow for document blocks.
 * Respects page boundaries, explicit PageBreak blocks, orphan control, and table pagination.
 */
export function calculateDocumentPagination(
  blocks: DocumentBlockItem[],
  dimensions: PageDimensions
): DocumentPageLayout[] {
  if (!blocks || blocks.length === 0) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        blocks: [],
      },
    ];
  }

  const pages: DocumentPageLayout[] = [];
  let currentPageBlocks: RenderedBlockRef[] = [];
  let currentUsedHeight = 0;
  const maxPageHeight = dimensions.printableHeightPx;

  // Header banner on first page takes ~90px
  let isFirstPage = true;
  const firstPageHeaderHeight = 90;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Explicit Page Break Block
    if (block.type === 'page-break') {
      if (currentPageBlocks.length > 0) {
        pages.push({
          pageNumber: pages.length + 1,
          totalPages: 1, // updated at end
          blocks: currentPageBlocks,
        });
        currentPageBlocks = [];
        currentUsedHeight = 0;
        isFirstPage = false;
      }
      continue;
    }

    const availableHeight = maxPageHeight - (isFirstPage ? firstPageHeaderHeight : 0);
    const blockHeight = estimateBlockHeight(block, dimensions.printableWidthPx);

    // Check if table can be split across pages
    if (block.type === 'table' && block.rows.length > 2 && currentUsedHeight + blockHeight > availableHeight) {
      const remainingOnCurrent = availableHeight - currentUsedHeight;
      const rowHeight = 32;
      const headerCost = 36 + (block.caption ? 24 : 0);

      // If we can fit at least 2 rows on current page, split table rows
      if (remainingOnCurrent > headerCost + rowHeight * 2) {
        const fitCount = Math.floor((remainingOnCurrent - headerCost) / rowHeight);
        if (fitCount > 0 && fitCount < block.rows.length) {
          // Push first slice to current page
          currentPageBlocks.push({
            block,
            subRange: { start: 0, end: fitCount },
          });

          // Next page
          pages.push({
            pageNumber: pages.length + 1,
            totalPages: 1,
            blocks: currentPageBlocks,
          });

          currentPageBlocks = [
            {
              block,
              subRange: { start: fitCount, end: block.rows.length },
            },
          ];
          currentUsedHeight = headerCost + (block.rows.length - fitCount) * rowHeight;
          isFirstPage = false;
          continue;
        }
      }
    }

    // If block doesn't fit on current page and page is not empty: push page and start new one
    if (currentUsedHeight + blockHeight > availableHeight && currentPageBlocks.length > 0) {
      // Keep headings with next content if heading is last item on page
      if (block.type === 'heading') {
        pages.push({
          pageNumber: pages.length + 1,
          totalPages: 1,
          blocks: currentPageBlocks,
        });
        currentPageBlocks = [{ block }];
        currentUsedHeight = blockHeight;
        isFirstPage = false;
        continue;
      }

      pages.push({
        pageNumber: pages.length + 1,
        totalPages: 1,
        blocks: currentPageBlocks,
      });

      currentPageBlocks = [{ block }];
      currentUsedHeight = blockHeight;
      isFirstPage = false;
      continue;
    }

    // Fits on current page
    currentPageBlocks.push({ block });
    currentUsedHeight += blockHeight;
  }

  // Push remaining page
  if (currentPageBlocks.length > 0) {
    pages.push({
      pageNumber: pages.length + 1,
      totalPages: 1,
      blocks: currentPageBlocks,
    });
  }

  // If no pages created (e.g. only page-break blocks), guarantee at least 1 page
  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      totalPages: 1,
      blocks: [],
    });
  }

  // Update totalPages count across all pages
  const total = pages.length;
  for (const page of pages) {
    page.totalPages = total;
  }

  return pages;
}
