import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DocumentModel } from '../types/document';
import { getPageDimensions, calculateFitScales } from '../utils/pageGeometry';
import { calculateDocumentPagination } from '../utils/paginationEngine';
import { calculateHeadingNumbers } from '../utils/headingNumbering';
import { PreviewToolbar } from './PreviewToolbar';
import { RenderedDocumentPage } from './RenderedDocumentPage';

interface PreviewPanelProps {
  document: DocumentModel;
  headingNumbers?: Map<string, string>;
  targetHeadingId?: string | null;
}

export function PreviewPanel({
  document,
  headingNumbers: propHeadingNumbers,
  targetHeadingId,
}: PreviewPanelProps) {
  // Compute physical page dimensions from document settings
  const dimensions = useMemo(() => {
    return getPageDimensions(document.metadata);
  }, [document.metadata]);

  // Derive heading numbers if not provided directly
  const headingNumbers = useMemo(() => {
    if (propHeadingNumbers) return propHeadingNumbers;
    return calculateHeadingNumbers(document.blocks, document.metadata.headingNumbering);
  }, [document.blocks, document.metadata.headingNumbering, propHeadingNumbers]);

  // Compute paginated layout from document blocks and page dimensions
  const paginatedPages = useMemo(() => {
    return calculateDocumentPagination(document.blocks, dimensions);
  }, [document.blocks, dimensions]);

  const totalPages = paginatedPages.length;

  const [zoom, setZoom] = useState(70); // Default comfortable initial zoom
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial automatic fit-width once container mounts
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const { fitWidthScale } = calculateFitScales(
        containerWidth,
        containerHeight,
        dimensions.widthPx,
        dimensions.heightPx,
        48
      );
      setZoom(Math.round(fitWidthScale * 100));
    }
  }, [dimensions.pageSize, dimensions.orientation]);

  // Ensure current page does not exceed available page count
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // When targetHeadingId changes (e.g. from Outline navigation click),
  // locate which page contains the heading, navigate to that page, and scroll element into view
  useEffect(() => {
    if (!targetHeadingId) return;

    // Find which page contains this block ID
    const targetPage = paginatedPages.find((page) =>
      page.blocks.some((b) => b.block.id === targetHeadingId)
    );

    if (targetPage) {
      setCurrentPage(targetPage.pageNumber);
      const headingEl = window.document.getElementById(`preview-heading-${targetHeadingId}`);
      if (headingEl) {
        headingEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const pageEl = window.document.getElementById(`document-page-${targetPage.pageNumber}`);
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [targetHeadingId, paginatedPages]);

  // Scroll to selected page when navigating via toolbar
  const scrollToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    const targetElement = window.document.getElementById(`document-page-${pageNum}`);
    if (targetElement && containerRef.current) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      scrollToPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(250, prev + 10));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(30, prev - 10));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const handleFitWidth = () => {
    if (containerRef.current) {
      const { fitWidthScale } = calculateFitScales(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
        dimensions.widthPx,
        dimensions.heightPx,
        48
      );
      setZoom(Math.round(fitWidthScale * 100));
    }
  };

  const handleFitPage = () => {
    if (containerRef.current) {
      const { fitPageScale } = calculateFitScales(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
        dimensions.widthPx,
        dimensions.heightPx,
        48
      );
      setZoom(Math.round(fitPageScale * 100));
    }
  };

  // Track which page is in viewport during scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollMiddle = container.scrollTop + container.clientHeight / 2;
      for (let i = 1; i <= totalPages; i++) {
        const el = window.document.getElementById(`document-page-${i}`);
        if (el) {
          const top = el.offsetTop - container.offsetTop;
          const bottom = top + el.offsetHeight * (zoom / 100);
          if (scrollMiddle >= top && scrollMiddle <= bottom) {
            setCurrentPage(i);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [totalPages, zoom]);

  const scaleRatio = zoom / 100;

  // The wrapper around the scaled page must match the post-transform bounding box:
  // width = widthPx * scaleRatio, height = heightPx * scaleRatio
  const scaledWidth = Math.round(dimensions.widthPx * scaleRatio);
  const scaledHeight = Math.round(dimensions.heightPx * scaleRatio);

  return (
    <section
      aria-labelledby="document-preview-heading"
      className="h-full min-w-0 bg-slate-100/90 flex flex-col overflow-hidden"
    >
      {/* Top Column Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 bg-white">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <h2
            id="document-preview-heading"
            className="text-sm font-semibold text-slate-900 tracking-tight whitespace-nowrap"
          >
            Document Preview
          </h2>
          <span className="text-xs text-slate-400" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-slate-500 truncate">
            {dimensions.pageSize} {dimensions.orientation} ({Math.round(dimensions.widthMm)} ×{' '}
            {Math.round(dimensions.heightMm)} mm) · {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
          </span>
        </div>
      </div>

      {/* Dynamic Functional Preview Toolbar */}
      <div className="shrink-0">
        <PreviewToolbar
          currentPage={currentPage}
          totalPages={totalPages}
          zoom={zoom}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitWidth={handleFitWidth}
          onFitPage={handleFitPage}
          onResetZoom={handleResetZoom}
        />
      </div>

      {/* Scrollable Document Canvas Container displaying vertically stacked pages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-6 sm:p-8 space-y-8 select-text w-full flex flex-col items-center"
      >
        {paginatedPages.map((page) => (
          <div
            key={page.pageNumber}
            className="flex items-center justify-center shrink-0 my-2"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              minWidth: `${scaledWidth}px`,
              minHeight: `${scaledHeight}px`,
            }}
          >
            <RenderedDocumentPage
              page={page}
              metadata={document.metadata}
              dimensions={dimensions}
              scale={scaleRatio}
              headingNumbers={headingNumbers}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
