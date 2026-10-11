import React from 'react';
import {
  FileText,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Loader2,
  Undo2,
  Redo2,
  Keyboard,
} from 'lucide-react';

interface TitleBarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenShortcuts?: () => void;
  isExporting?: boolean;
  isModified?: boolean;
}

export function TitleBar({
  onNew,
  onOpen,
  onSave,
  onExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenShortcuts,
  isExporting = false,
  isModified = false,
}: TitleBarProps) {
  return (
    <header className="h-12 shrink-0 w-full bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4 select-none">
      {/* Left side: Document-themed application logo and application name */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-slate-900 whitespace-nowrap">
              Document Studio
            </span>
            {isModified && (
              <span className="text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded">
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* Undo / Redo controls in title bar */}
        <div className="flex items-center gap-0.5 ml-2 border-l border-slate-200 pl-2.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last change"
            className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
            aria-label="Redo last change"
            className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Keyboard Shortcuts Trigger */}
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              title="Keyboard shortcuts (Ctrl+/)"
              aria-label="Show keyboard shortcuts guide"
              className="p-1.5 ml-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right side: New, Open, Save, Export buttons aligned horizontally in exact order */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 1. New */}
        <button
          type="button"
          onClick={onNew}
          title="Create a new document (Ctrl+Alt+N)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5 text-slate-500" />
          <span>New</span>
        </button>

        {/* 2. Open */}
        <button
          type="button"
          onClick={onOpen}
          title="Open previously saved document (.document.json) (Ctrl+O)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
          <span>Open</span>
        </button>

        {/* 3. Save (Primary accent color) */}
        <button
          type="button"
          onClick={onSave}
          title="Save native document file (.document.json) (Ctrl+S)"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>

        {/* 4. Export (PDF generation) */}
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          title="Export high-fidelity paginated PDF (Ctrl+Shift+E)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </button>
      </div>
    </header>
  );
}
