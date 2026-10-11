import React, { useEffect, useRef } from 'react';
import {
  Heading,
  AlignLeft,
  List,
  Sigma,
  Table as TableIcon,
  Image as ImageIcon,
  SeparatorHorizontal,
  PenTool,
  SlidersHorizontal,
  BookOpen,
} from 'lucide-react';
import { BlockType } from '../types/document';

interface BlockInsertionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: BlockType) => void;
  onOpenSnippetLibrary?: () => void;
  targetIndexDescription?: string;
}

export function BlockInsertionMenu({
  isOpen,
  onClose,
  onSelectType,
  onOpenSnippetLibrary,
  targetIndexDescription,
}: BlockInsertionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const blockOptions: {
    type: BlockType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      type: 'heading',
      label: 'Heading',
      description: 'H1, H2, or H3 section titles',
      icon: Heading,
    },
    {
      type: 'paragraph',
      label: 'Paragraph',
      description: 'Multi-line body text with text wrapping',
      icon: AlignLeft,
    },
    {
      type: 'list',
      label: 'List',
      description: 'Bullets, numbered, alphabetic, dashes',
      icon: List,
    },
    {
      type: 'formula',
      label: 'Formula',
      description: 'LaTeX mathematical expression block',
      icon: Sigma,
    },
    {
      type: 'metadata',
      label: 'Metadata',
      description: 'Key-value document properties & attributes',
      icon: SlidersHorizontal,
    },
    {
      type: 'image',
      label: 'Image',
      description: 'Figure diagram or image placeholder',
      icon: ImageIcon,
    },
    {
      type: 'table',
      label: 'Table',
      description: 'Structured grid with editable cells & columns',
      icon: TableIcon,
    },
    {
      type: 'page-break',
      label: 'Page Break',
      description: 'Explicit pagination partition marker',
      icon: SeparatorHorizontal,
    },
    {
      type: 'signature',
      label: 'Signature',
      description: 'Sign-off line, signatory name, and role',
      icon: PenTool,
    },
  ];

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-label="Insert Block Menu"
      className="w-72 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50 text-slate-900"
    >
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800 tracking-tight">
          Insert Block
        </span>
        {targetIndexDescription && (
          <span className="text-[10px] text-slate-500 font-mono">
            {targetIndexDescription}
          </span>
        )}
      </div>

      <div className="p-1 max-h-80 overflow-y-auto divide-y divide-slate-100">
        <div className="space-y-0.5">
          {blockOptions.map(({ type, label, description, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onSelectType(type);
                onClose();
              }}
              className="w-full flex items-start gap-2.5 px-2.5 py-2 text-left rounded-md hover:bg-slate-100/80 focus-visible:bg-slate-100 focus-visible:outline-none transition-colors group cursor-pointer"
            >
              <div className="p-1.5 rounded bg-slate-100 group-hover:bg-white border border-slate-200/60 text-slate-600 group-hover:text-blue-600 shrink-0 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-800 group-hover:text-slate-900">
                  {label}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {onOpenSnippetLibrary && (
        <div className="p-1 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSnippetLibrary();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-md hover:bg-blue-50 text-blue-700 transition-colors cursor-pointer text-xs font-medium group"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              <span>Block Snippet Library...</span>
            </span>
            <span className="text-[10px] text-blue-500 font-normal group-hover:underline">Browse</span>
          </button>
        </div>
      )}
    </div>
  );
}
