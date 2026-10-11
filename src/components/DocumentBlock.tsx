import React from 'react';
import { GripVertical, LucideIcon } from 'lucide-react';

interface DocumentBlockProps {
  typeLabel: string;
  icon: LucideIcon;
  blockIndex: string;
  children: React.ReactNode;
}

export function DocumentBlock({
  typeLabel,
  icon: Icon,
  blockIndex,
  children,
}: DocumentBlockProps) {
  return (
    <div className="group relative bg-white border border-slate-200 rounded-md hover:border-slate-300 transition-colors">
      {/* Subtle block header bar indicating modular block structure */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/70 border-b border-slate-100 rounded-t-md select-none">
        <div className="flex items-center gap-1.5 text-slate-500">
          <GripVertical
            className="w-3.5 h-3.5 text-slate-400 cursor-default"
            aria-hidden="true"
          />
          <Icon className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-[11px] font-medium text-slate-600">
            {typeLabel}
          </span>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-slate-400">
          {blockIndex}
        </span>
      </div>

      {/* Block Content Area */}
      <div className="p-3.5">{children}</div>
    </div>
  );
}
