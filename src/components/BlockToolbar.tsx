import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  GripVertical,
  BookmarkPlus,
  LucideIcon,
} from 'lucide-react';

interface BlockToolbarProps {
  typeLabel: string;
  icon: LucideIcon;
  blockIndex: string;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSaveSnippet?: () => void;
}

export function BlockToolbar({
  typeLabel,
  icon: Icon,
  blockIndex,
  isSelected,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSaveSnippet,
}: BlockToolbarProps) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-1.5 border-b transition-colors select-none ${
        isSelected
          ? 'bg-blue-50/70 border-blue-100 text-blue-900'
          : 'bg-slate-50/70 border-slate-100 text-slate-600'
      }`}
    >
      {/* Left: Drag handle, Icon, Block Type, Index */}
      <div className="flex items-center gap-1.5 min-w-0">
        <GripVertical
          className="w-3.5 h-3.5 text-slate-400 shrink-0 cursor-default"
          aria-hidden="true"
        />
        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
        <span className="text-[11px] font-medium tracking-tight truncate">
          {typeLabel}
        </span>
        <span className="text-[10px] font-mono tabular-nums text-slate-400 ml-1">
          #{blockIndex}
        </span>
      </div>

      {/* Right: Block Action Controls (Move Up, Move Down, Duplicate, Delete) */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={isFirst}
          title="Move block up"
          aria-label="Move block up"
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={isLast}
          title="Move block down"
          aria-label="Move block down"
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate block"
          aria-label="Duplicate block"
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {onSaveSnippet && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSaveSnippet();
            }}
            title="Save block to Reusable Snippet Library"
            aria-label="Save block to snippet library"
            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete block"
          aria-label="Delete block"
          className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
