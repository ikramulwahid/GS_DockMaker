import React from 'react';
import {
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  Sigma,
  Table as TableIcon,
  Image as ImageIcon,
  PenTool,
  SlidersHorizontal,
  Plus,
  Undo2,
  Redo2,
} from 'lucide-react';
import {
  DocumentBlockItem,
  HeadingBlockData,
  ParagraphBlockData,
  ListBlockData,
  FormulaBlockData,
  TableBlockData,
  ImageBlockData,
  SignatureBlockData,
  BlockType,
} from '../types/document';

interface EditorToolbarProps {
  totalBlocks: number;
  selectedBlock: DocumentBlockItem | null;
  onUpdateBlock: (id: string, updated: Partial<DocumentBlockItem>) => void;
  onQuickAddType: (type: BlockType) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function EditorToolbar({
  totalBlocks,
  selectedBlock,
  onUpdateBlock,
  onQuickAddType,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: EditorToolbarProps) {
  // Render contextual controls depending on selected block type
  const renderContextualControls = () => {
    if (!selectedBlock) {
      return (
        <span className="text-[11px] text-slate-400 italic">
          Select a block to format or edit properties
        </span>
      );
    }

    switch (selectedBlock.type) {
      case 'heading': {
        const heading = selectedBlock as HeadingBlockData;
        const align = heading.align || 'left';
        return (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Heading
            </span>

            {/* Level selector */}
            <div className="inline-flex items-center rounded border border-slate-200 bg-white p-0.5">
              {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onUpdateBlock(heading.id, { level: lvl })}
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                    heading.level === lvl
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Alignment */}
            <div className="inline-flex items-center rounded border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => onUpdateBlock(heading.id, { align: 'left' })}
                title="Align Left"
                className={`p-1 rounded ${align === 'left' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(heading.id, { align: 'center' })}
                title="Align Center"
                className={`p-1 rounded ${align === 'center' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignCenter className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(heading.id, { align: 'right' })}
                title="Align Right"
                className={`p-1 rounded ${align === 'right' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      }

      case 'paragraph': {
        const paragraph = selectedBlock as ParagraphBlockData;
        const align = paragraph.align || 'left';
        return (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Paragraph
            </span>

            {/* Alignment */}
            <div className="inline-flex items-center rounded border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => onUpdateBlock(paragraph.id, { align: 'left' })}
                title="Align Left"
                className={`p-1 rounded ${align === 'left' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(paragraph.id, { align: 'center' })}
                title="Align Center"
                className={`p-1 rounded ${align === 'center' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignCenter className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(paragraph.id, { align: 'right' })}
                title="Align Right"
                className={`p-1 rounded ${align === 'right' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(paragraph.id, { align: 'justify' })}
                title="Justify"
                className={`p-1 rounded ${align === 'justify' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignJustify className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      }

      case 'list': {
        const list = selectedBlock as ListBlockData;
        return (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              List
            </span>

            <select
              value={list.style}
              onChange={(e) => onUpdateBlock(list.id, { style: e.target.value as ListBlockData['style'] })}
              className="px-1.5 py-0.5 text-[11px] text-slate-800 bg-white border border-slate-200 rounded"
            >
              <option value="bullet">Bullets (•)</option>
              <option value="dash">Dashes (–)</option>
              <option value="arrow">Arrows (→)</option>
              <option value="dot">Dots (·)</option>
              <option value="numbered">Numbers (1, 2, 3)</option>
              <option value="alphabetical">Lowercase (a, b, c)</option>
              <option value="uppercase-alpha">Uppercase (A, B, C)</option>
            </select>
          </div>
        );
      }

      case 'formula': {
        const formula = selectedBlock as FormulaBlockData;
        return (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Formula
            </span>
            <label className="flex items-center gap-1 text-[11px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formula.displayMode !== false}
                onChange={(e) => onUpdateBlock(formula.id, { displayMode: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
              />
              <span>Display Style</span>
            </label>
          </div>
        );
      }

      case 'table': {
        const table = selectedBlock as TableBlockData;
        return (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Table
            </span>
            <select
              value={table.headerStyle || 'default'}
              onChange={(e) =>
                onUpdateBlock(table.id, {
                  headerStyle: e.target.value as 'default' | 'accent' | 'minimal',
                })
              }
              className="px-1.5 py-0.5 text-[11px] text-slate-800 bg-white border border-slate-200 rounded"
            >
              <option value="default">Standard Header</option>
              <option value="accent">Blue Accent</option>
              <option value="minimal">Minimal Header</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const emptyRow = new Array(table.headers.length).fill('');
                onUpdateBlock(table.id, { rows: [...table.rows, emptyRow] });
              }}
              title="Add Row to Table"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5 text-blue-600" />
              <span>Row</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const newHeaders = [...table.headers, `Column ${table.headers.length + 1}`];
                const newRows = table.rows.map((r) => [...r, '']);
                const newAligns = [...(table.columnAlignments || table.headers.map(() => 'left')), 'left'];
                onUpdateBlock(table.id, {
                  headers: newHeaders,
                  rows: newRows,
                  columnAlignments: newAligns as any,
                });
              }}
              title="Add Column to Table"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5 text-blue-600" />
              <span>Col</span>
            </button>
          </div>
        );
      }

      case 'image': {
        const img = selectedBlock as ImageBlockData;
        const align = img.align || 'center';
        return (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Image
            </span>
            <select
              value={img.widthPercent || 100}
              onChange={(e) => onUpdateBlock(img.id, { widthPercent: Number(e.target.value) })}
              className="px-1.5 py-0.5 text-[11px] text-slate-800 bg-white border border-slate-200 rounded"
            >
              <option value={100}>100% Width</option>
              <option value={75}>75% Width</option>
              <option value={50}>50% Width</option>
              <option value={33}>33% Width</option>
            </select>

            <div className="inline-flex items-center rounded border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => onUpdateBlock(img.id, { align: 'left' })}
                title="Align Left"
                className={`p-1 rounded ${align === 'left' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(img.id, { align: 'center' })}
                title="Align Center"
                className={`p-1 rounded ${align === 'center' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignCenter className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(img.id, { align: 'right' })}
                title="Align Right"
                className={`p-1 rounded ${align === 'right' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      }

      case 'signature': {
        const sig = selectedBlock as SignatureBlockData;
        const align = sig.align || 'left';
        return (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Signature
            </span>
            <div className="inline-flex items-center rounded border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => onUpdateBlock(sig.id, { align: 'left' })}
                title="Align Left"
                className={`p-1 rounded ${align === 'left' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(sig.id, { align: 'center' })}
                title="Align Center"
                className={`p-1 rounded ${align === 'center' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignCenter className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateBlock(sig.id, { align: 'right' })}
                title="Align Right"
                className={`p-1 rounded ${align === 'right' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <AlignRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      }

      case 'metadata': {
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Metadata
            </span>
            <span className="text-[11px] text-slate-500">Document Attributes Block</span>
          </div>
        );
      }

      case 'page-break': {
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Page Break
            </span>
            <span className="text-[11px] text-slate-500">Pagination Split Marker</span>
          </div>
        );
      }
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Formatting and Block Tools"
      className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-3 overflow-x-auto select-none min-h-[40px]"
    >
      {/* Contextual Block Controls Area */}
      <div className="flex items-center gap-2 min-w-0">
        {renderContextualControls()}
      </div>

      {/* Right side: Undo/Redo & Block Counter */}
      <div className="flex items-center gap-2 shrink-0">
        {onUndo && onRedo && (
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-2">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
              aria-label="Redo"
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <span className="text-[11px] font-mono tabular-nums text-slate-400 whitespace-nowrap">
          {totalBlocks} {totalBlocks === 1 ? 'Block' : 'Blocks'}
        </span>
      </div>
    </div>
  );
}
