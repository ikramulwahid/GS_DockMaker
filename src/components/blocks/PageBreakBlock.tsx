import React from 'react';
import { SeparatorHorizontal, Scissors } from 'lucide-react';
import { PageBreakBlockData } from '../../types/document';

interface PageBreakBlockProps {
  block: PageBreakBlockData;
  onChange: (updated: Partial<PageBreakBlockData>) => void;
}

export function PageBreakBlock({ block, onChange }: PageBreakBlockProps) {
  return (
    <div className="py-2.5 space-y-2">
      {/* Clear visual page-break divider with icon and tag */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t-2 border-dashed border-slate-300" />
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600">
          <Scissors className="w-3.5 h-3.5 text-slate-500 transform -rotate-90" />
          <span className="text-[11px] font-mono font-medium text-slate-700 whitespace-nowrap">
            {block.label || 'Page Break'}
          </span>
        </div>
        <div className="flex-1 border-t-2 border-dashed border-slate-300" />
      </div>

      <div className="flex items-center justify-center gap-2">
        <label htmlFor={`pb-label-${block.id}`} className="text-[11px] text-slate-500 font-medium">
          Section Marker Label:
        </label>
        <input
          id={`pb-label-${block.id}`}
          type="text"
          value={block.label || ''}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. End of Section 1"
          className="w-56 px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded text-center focus:outline-none focus:border-blue-600 transition-colors"
        />
      </div>

      <p className="text-[10px] text-slate-400 text-center">
        Explicit pagination instruction: content following this block starts on a new page during export.
      </p>
    </div>
  );
}
