import React from 'react';
import { Zap, PlusSquare, Keyboard, BookOpen, BookmarkCheck } from 'lucide-react';

interface QuickActionsProps {
  onInsertBlock: () => void;
  onOpenShortcuts?: () => void;
  onOpenTemplates?: () => void;
  onOpenSnippetLibrary?: () => void;
}

export function QuickActions({
  onInsertBlock,
  onOpenShortcuts,
  onOpenTemplates,
  onOpenSnippetLibrary,
}: QuickActionsProps) {
  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <h2
          id="quick-actions-heading"
          className="text-xs font-semibold text-slate-900 tracking-tight"
        >
          Quick Actions
        </h2>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onInsertBlock}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2 whitespace-nowrap">
            <PlusSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Insert Block</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">Ctrl+Alt+B</span>
        </button>

        {onOpenTemplates && (
          <button
            type="button"
            onClick={onOpenTemplates}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Document Templates</span>
            </span>
            <span className="text-[11px] text-blue-600 font-medium">Browse</span>
          </button>
        )}

        {onOpenSnippetLibrary && (
          <button
            type="button"
            onClick={onOpenSnippetLibrary}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <BookmarkCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Snippet Library</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Library</span>
          </button>
        )}

        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Keyboard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Keyboard Shortcuts</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Ctrl+/</span>
          </button>
        )}
      </div>
    </section>
  );
}
