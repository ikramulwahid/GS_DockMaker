import React from 'react';
import { DocumentMetadata } from '../types/document';
import { DocumentPageLayout } from '../utils/paginationEngine';
import { PageDimensions } from '../utils/pageGeometry';
import { PreviewBlockRenderer } from './PreviewBlockRenderer';

interface RenderedDocumentPageProps {
  page: DocumentPageLayout;
  metadata: DocumentMetadata;
  dimensions: PageDimensions;
  scale: number;
  headingNumbers?: Map<string, string>;
}

export function RenderedDocumentPage({
  page,
  metadata,
  dimensions,
  scale,
  headingNumbers,
}: RenderedDocumentPageProps) {
  const isFirstPage = page.pageNumber === 1;

  // Physical page dimensions at 96 DPI CSS reference scale
  // Using explicit width and height with box-sizing: border-box
  // Center transform-origin inside the scaled wrapper ensures clean, symmetric centering
  const pageStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    width: `${dimensions.widthPx}px`,
    height: `${dimensions.heightPx}px`,
    minWidth: `${dimensions.widthPx}px`,
    minHeight: `${dimensions.heightPx}px`,
    maxWidth: `${dimensions.widthPx}px`,
    maxHeight: `${dimensions.heightPx}px`,
    paddingTop: `${dimensions.marginTopPx}px`,
    paddingBottom: `${dimensions.marginBottomPx}px`,
    paddingLeft: `${dimensions.marginLeftPx}px`,
    paddingRight: `${dimensions.marginRightPx}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
  };

  return (
    <article
      id={`document-page-${page.pageNumber}`}
      aria-label={`Document Page ${page.pageNumber} of ${page.totalPages}`}
      style={pageStyle}
      className="bg-white border border-slate-200/90 rounded-[2px] flex flex-col justify-between text-slate-900 overflow-hidden relative select-text"
    >
      {/* Page Body Content strictly inset inside physical margins */}
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        {/* Document Header (rendered on Page 1) */}
        {isFirstPage && (
          <header className="border-b border-slate-200 pb-3 mb-3.5 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
              <span className="capitalize">{metadata.documentType.replace(/-/g, ' ')}</span>
              <span>{metadata.date}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
              {metadata.title || 'Untitled Document'}
            </h1>
            {metadata.author && (
              <div className="text-xs text-slate-600">
                <span>{metadata.author}</span>
              </div>
            )}
          </header>
        )}

        {/* Subsequent pages subtle running header */}
        {!isFirstPage && (
          <div className="border-b border-slate-100 pb-2 mb-3 flex items-center justify-between text-[10px] text-slate-400 font-mono tracking-tight shrink-0">
            <span className="truncate max-w-[70%]">{metadata.title || 'Document Studio'}</span>
            <span>{metadata.date}</span>
          </div>
        )}

        {/* Blocks assigned to this page container */}
        <div className="space-y-1 flex-1 overflow-hidden w-full">
          {page.blocks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-300 italic">
              {isFirstPage ? 'Blank document — start adding content in the editor.' : 'Blank page.'}
            </div>
          ) : (
            page.blocks.map((ref, idx) => (
              <PreviewBlockRenderer
                key={`${ref.block.id}-${idx}`}
                block={ref.block}
                subRange={ref.subRange}
                displayNumber={headingNumbers?.get(ref.block.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Discreet Page Footer & Numbering */}
      <footer className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums shrink-0">
        <span>
          {metadata.pageSize} {metadata.pageOrientation} · {Math.round(dimensions.widthMm)} × {Math.round(dimensions.heightMm)} mm
        </span>
        <span className="font-medium text-slate-500">
          Page {page.pageNumber} of {page.totalPages}
        </span>
      </footer>
    </article>
  );
}
