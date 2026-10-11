import React from 'react';
import katex from 'katex';
import {
  DocumentBlockItem,
  HeadingBlockData,
  ParagraphBlockData,
  ListBlockData,
  FormulaBlockData,
  MetadataBlockData,
  TableBlockData,
  ImageBlockData,
  SignatureBlockData,
} from '../types/document';
import { normalizeListItems } from '../utils/documentModel';
import { FormattedText } from './FormattedText';

interface PreviewBlockRendererProps {
  block: DocumentBlockItem;
  subRange?: { start: number; end: number };
  displayNumber?: string;
}

export function PreviewBlockRenderer({ block, subRange, displayNumber }: PreviewBlockRendererProps) {
  switch (block.type) {
    case 'heading': {
      const heading = block as HeadingBlockData;
      const align = heading.align || 'left';
      const alignClass =
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

      // Number badge / prefix element if numbered and not explicitly excluded
      const isExcluded =
        heading.excludeFromNumbering === true || heading.numberingOverride === 'unnumbered';
      const showNumber = displayNumber && !isExcluded;

      const renderHeadingContent = () => {
        if (!showNumber) {
          return <FormattedText text={heading.text || 'Untitled Heading'} />;
        }

        // Hanging-indent style: number in fixed prefix with proper separation
        return (
          <span className="inline-flex items-baseline gap-2">
            <span className="font-semibold text-slate-800 tabular-nums shrink-0 select-none">
              {displayNumber}
            </span>
            <span className="flex-1">
              <FormattedText text={heading.text || 'Untitled Heading'} />
            </span>
          </span>
        );
      };

      if (heading.level === 'h1') {
        return (
          <h2
            id={`preview-heading-${heading.id}`}
            className={`text-base font-bold text-slate-900 tracking-tight mb-2 mt-4 first:mt-0 ${alignClass}`}
          >
            {renderHeadingContent()}
          </h2>
        );
      }
      if (heading.level === 'h2') {
        return (
          <h3
            id={`preview-heading-${heading.id}`}
            className={`text-sm font-semibold text-slate-900 tracking-tight mb-1.5 mt-3.5 first:mt-0 ${alignClass}`}
          >
            {renderHeadingContent()}
          </h3>
        );
      }
      if (heading.level === 'h3') {
        return (
          <h4
            id={`preview-heading-${heading.id}`}
            className={`text-xs font-semibold text-slate-800 tracking-tight mb-1 mt-3 first:mt-0 ${alignClass}`}
          >
            {renderHeadingContent()}
          </h4>
        );
      }
      if (heading.level === 'h4') {
        return (
          <h5
            id={`preview-heading-${heading.id}`}
            className={`text-[11px] font-semibold text-slate-800 tracking-wide uppercase mb-1 mt-2.5 first:mt-0 ${alignClass}`}
          >
            {renderHeadingContent()}
          </h5>
        );
      }
      if (heading.level === 'h5') {
        return (
          <h6
            id={`preview-heading-${heading.id}`}
            className={`text-[11px] font-medium text-slate-700 italic mb-1 mt-2 first:mt-0 ${alignClass}`}
          >
            {renderHeadingContent()}
          </h6>
        );
      }
      return (
        <h6
          id={`preview-heading-${heading.id}`}
          className={`text-[10px] font-normal text-slate-600 mb-1 mt-2 first:mt-0 ${alignClass}`}
        >
          {renderHeadingContent()}
        </h6>
      );
    }

    case 'paragraph': {
      const para = block as ParagraphBlockData;
      const align = para.align || 'left';
      const alignClass =
        align === 'center'
          ? 'text-center'
          : align === 'right'
          ? 'text-right'
          : align === 'justify'
          ? 'text-justify'
          : 'text-left';

      return (
        <p className={`text-xs text-slate-700 leading-relaxed mb-3.5 ${alignClass}`}>
          <FormattedText text={para.text} />
        </p>
      );
    }

    case 'list': {
      const list = block as ListBlockData;
      const items = normalizeListItems(list.items);

      const getPrefixMarker = (index: number, indent: number) => {
        switch (list.style) {
          case 'numbered':
            return indent === 1 ? `${String.fromCharCode(97 + (index % 26))}.` : `${index + 1}.`;
          case 'alphabetical':
            return `${String.fromCharCode(97 + (index % 26))}.`;
          case 'uppercase-alpha':
            return `${String.fromCharCode(65 + (index % 26))}.`;
          case 'dash':
            return '–';
          case 'arrow':
            return '→';
          case 'dot':
            return '·';
          case 'bullet':
          default:
            return indent === 1 ? '◦' : '•';
        }
      };

      return (
        <ul className="space-y-1 mb-3.5 text-xs text-slate-700">
          {items.map((item, index) => {
            const indent = item.indent || 0;
            return (
              <li
                key={item.id}
                className="flex items-start gap-2 leading-relaxed"
                style={{ paddingLeft: `${indent * 1.25}rem` }}
              >
                <span className="w-4 font-mono text-xs text-slate-500 shrink-0 text-right select-none">
                  {getPrefixMarker(index, indent)}
                </span>
                <span className="flex-1">
                  <FormattedText text={item.text} />
                </span>
              </li>
            );
          })}
        </ul>
      );
    }

    case 'formula': {
      const formula = block as FormulaBlockData;
      let renderedMath = '';
      try {
        renderedMath = katex.renderToString(formula.latex || '', {
          displayMode: formula.displayMode !== false,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        renderedMath = `<span class="text-xs font-mono text-slate-700">${formula.latex}</span>`;
      }

      return (
        <div className="my-3 py-2 px-3 bg-slate-50/70 border border-slate-200/80 rounded flex items-center justify-between gap-4">
          <div
            className="flex-1 text-center py-1 overflow-x-auto text-slate-900"
            dangerouslySetInnerHTML={{ __html: renderedMath }}
          />
          {formula.equationNumber && (
            <span
              data-selectable-text
              className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0 pl-2"
            >
              ({formula.equationNumber})
            </span>
          )}
        </div>
      );
    }

    case 'metadata': {
      const meta = block as MetadataBlockData;
      const style = meta.style || 'table';

      return (
        <div className="my-3 space-y-1.5">
          {meta.title && (
            <div className="text-[11px] font-semibold text-slate-700 tracking-tight">
              <FormattedText text={meta.title} />
            </div>
          )}

          {style === 'cards' ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {meta.rows.map((row) => (
                <div key={row.id} className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    <FormattedText text={row.label} />
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5">
                    {row.value ? <FormattedText text={row.value} /> : '—'}
                  </div>
                </div>
              ))}
            </div>
          ) : style === 'badges' ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {meta.rows.map((row) => (
                <div key={row.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800">
                  <span className="text-[10px] text-slate-500">
                    <FormattedText text={row.label} />:
                  </span>
                  <span className="font-medium">
                    {row.value ? <FormattedText text={row.value} /> : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <tbody className="divide-y divide-slate-200">
                  {meta.rows.map((row) => (
                    <tr key={row.id} className="divide-x divide-slate-200">
                      <td className="py-1.5 px-3 bg-slate-50 font-medium text-slate-600 w-2/5">
                        <FormattedText text={row.label} />
                      </td>
                      <td className="py-1.5 px-3 text-slate-800 font-mono text-[11px]">
                        {row.value ? <FormattedText text={row.value} /> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    case 'table': {
      const table = block as TableBlockData;
      const alignments = table.columnAlignments || table.headers.map(() => 'left');
      const headerStyle = table.headerStyle || 'default';

      // Slice rows if table is paginated across pages
      const displayRows = subRange
        ? table.rows.slice(subRange.start, subRange.end)
        : table.rows;

      const headerClass =
        headerStyle === 'accent'
          ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-200'
          : headerStyle === 'minimal'
          ? 'bg-white border-b border-slate-200 text-slate-800'
          : 'bg-slate-50 border-b border-slate-200 text-slate-800';

      return (
        <div className="my-3 space-y-1">
          {table.caption && (!subRange || subRange.start === 0) && (
            <div className="text-[11px] font-medium text-slate-600">
              <FormattedText text={table.caption} />
            </div>
          )}
          {subRange && subRange.start > 0 && (
            <div className="text-[10px] italic text-slate-500">
              {table.caption ? (
                <>
                  <FormattedText text={table.caption} /> (continued)
                </>
              ) : (
                'Table (continued)'
              )}
            </div>
          )}

          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={headerClass}>
                  {table.headers.map((hdr, hIdx) => {
                    const align = alignments[hIdx] || 'left';
                    const alignClass =
                      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                    return (
                      <th
                        key={hIdx}
                        className={`py-1.5 px-3 font-semibold border-r last:border-r-0 border-slate-200 ${alignClass}`}
                      >
                        <FormattedText text={hdr} />
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {displayRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    {row.map((cell, cIdx) => {
                      const align = alignments[cIdx] || 'left';
                      const alignClass =
                        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                      return (
                        <td
                          key={cIdx}
                          className={`py-1.5 px-3 border-r last:border-r-0 border-slate-200 ${alignClass}`}
                        >
                          <FormattedText text={cell} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case 'image': {
      const img = block as ImageBlockData;
      const align = img.align || 'center';
      const widthPct = img.widthPercent || 100;

      const alignContainerClass =
        align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';

      return (
        <figure className={`my-3.5 space-y-1.5 ${alignContainerClass}`} style={{ width: `${widthPct}%` }}>
          {img.url ? (
            <div className="bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center p-1">
              <img
                src={img.url}
                alt={img.altText || img.caption || 'Document Illustration'}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-52 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="h-32 w-full bg-slate-50 border border-slate-200 rounded flex flex-col items-center justify-center gap-1.5 p-3 text-center">
              <span className="text-xs font-medium text-slate-600 truncate max-w-full px-2">
                {img.caption || 'Image Diagram Placeholder'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                [{img.altText || 'Figure Placeholder'}]
              </span>
            </div>
          )}

          {img.caption && (
            <figcaption className="text-[11px] text-slate-500 text-center italic">
              <FormattedText text={img.caption} />
            </figcaption>
          )}
        </figure>
      );
    }

    case 'signature': {
      const sig = block as SignatureBlockData;
      const align = sig.align || 'left';
      const alignContainerClass =
        align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

      return (
        <div className="my-4 pt-3 border-t border-slate-100">
          <div className={`w-72 max-w-full space-y-1.5 ${alignContainerClass}`}>
            <div className="border-b border-slate-400 pb-1">
              <span className="text-sm italic font-serif text-slate-800 tracking-wide select-none">
                {sig.signatoryName || 'Signature Line'}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-900">
              <FormattedText text={sig.signatoryName || 'Signatory Name'} />
            </div>
            <div className="text-[11px] text-slate-600">
              <FormattedText text={sig.designation || 'Designation'} />
              {sig.organization ? (
                <>
                  {' · '}
                  <FormattedText text={sig.organization} />
                </>
              ) : (
                ''
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>
                <FormattedText text={sig.signatureLabel || 'Authorized Signatory'} />
              </span>
              <span className="font-mono tabular-nums">
                {sig.date ? `Date: ${sig.date}` : 'Date: ________'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    case 'page-break':
      return null;

    default:
      return null;
  }
}
