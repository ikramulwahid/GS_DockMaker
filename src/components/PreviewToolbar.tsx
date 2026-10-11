import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomOut,
  ZoomIn,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface PreviewToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number; // Percentage, e.g. 100 for 100%
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  onResetZoom: () => void;
}

export function PreviewToolbar({
  currentPage,
  totalPages,
  zoom,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitPage,
  onResetZoom,
}: PreviewToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="PDF Preview Controls"
      className="px-3 py-2 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-2 select-none"
    >
      {/* Page Navigation & Dynamic Counter */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          title="Previous Page"
          className="p-1 text-slate-600 rounded hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-mono tabular-nums text-slate-700 px-1.5 whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          title="Next Page"
          className="p-1 text-slate-600 rounded hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Zoom Controls, Fit-to-Width and Fit-to-Page */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onZoomOut}
          disabled={zoom <= 30}
          aria-label="Zoom Out"
          title="Zoom Out"
          className="p-1 text-slate-600 rounded hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onResetZoom}
          title="Click to reset zoom to 100%"
          className="text-xs font-mono tabular-nums text-slate-700 px-2 py-0.5 bg-white border border-slate-200 rounded hover:border-slate-300 transition-colors cursor-pointer"
        >
          {Math.round(zoom)}%
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          disabled={zoom >= 250}
          aria-label="Zoom In"
          title="Zoom In"
          className="p-1 text-slate-600 rounded hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-slate-200 mx-1" aria-hidden="true" />

        <button
          type="button"
          onClick={onFitWidth}
          aria-label="Fit to Width"
          title="Fit to Width"
          className="p-1 text-slate-600 rounded hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onFitPage}
          aria-label="Fit to Page"
          title="Fit to Page"
          className="p-1 text-slate-600 rounded hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
