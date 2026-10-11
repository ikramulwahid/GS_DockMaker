import React from 'react';
import { ListTree, Hash, ArrowRight } from 'lucide-react';
import { OutlineItem } from '../utils/headingNumbering';

interface DocumentOutlineProps {
  outline: OutlineItem[];
  selectedBlockId: string | null;
  onNavigateToHeading: (headingId: string) => void;
}

export function DocumentOutline({
  outline,
  selectedBlockId,
  onNavigateToHeading,
}: DocumentOutlineProps) {
  if (outline.length === 0) {
    return (
      <div className="py-8 px-3 text-center border border-dashed border-slate-200 rounded-md bg-slate-50/50">
        <ListTree className="w-5 h-5 mx-auto text-slate-300 mb-1.5" />
        <p className="text-xs font-medium text-slate-600">No Headings Found</p>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          Add Heading blocks (H1–H6) in the editor to populate the document outline.
        </p>
      </div>
    );
  }

  // Indentation class mapping based on levelNumber (1 to 6)
  const getIndentStyle = (levelNumber: number) => {
    // 0.75rem (12px) per level
    return { paddingLeft: `${Math.max(0, (levelNumber - 1) * 0.75)}rem` };
  };

  return (
    <nav aria-label="Document Structure Outline" className="space-y-1">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
          Outline ({outline.length})
        </span>
      </div>

      <div className="space-y-0.5">
        {outline.map((item) => {
          const isSelected = item.id === selectedBlockId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigateToHeading(item.id)}
              title={`${item.displayNumber ? `${item.displayNumber} ` : ''}${item.text} (${item.level.toUpperCase()})`}
              className={`w-full text-left rounded px-2 py-1.5 text-xs transition-colors flex items-start gap-1.5 group cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 text-blue-800 font-semibold border-l-2 border-blue-600'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              style={getIndentStyle(item.levelNumber)}
            >
              {/* Level indicator or calculated number */}
              {item.displayNumber && !item.isExcluded ? (
                <span
                  className={`font-mono text-[11px] tabular-nums shrink-0 select-none ${
                    isSelected ? 'text-blue-700 font-bold' : 'text-slate-500 font-medium'
                  }`}
                >
                  {item.displayNumber}
                </span>
              ) : item.isExcluded ? (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded shrink-0 select-none font-mono">
                  #
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 shrink-0 select-none uppercase">
                  {item.level}
                </span>
              )}

              {/* Heading Text */}
              <span className="truncate flex-1 leading-snug">
                {item.text || <span className="italic text-slate-400">Untitled Heading</span>}
              </span>

              {/* Hover arrow indicator */}
              <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity mt-0.5" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
