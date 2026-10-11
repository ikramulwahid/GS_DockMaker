import React from 'react';
import { Plus } from 'lucide-react';
import { DocumentBlockItem, BlockType } from '../types/document';
import { EditorToolbar } from './EditorToolbar';
import { BlockRenderer } from './BlockRenderer';
import { BlockInsertionMenu } from './BlockInsertionMenu';

interface EditorPanelProps {
  blocks: DocumentBlockItem[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (id: string, updated: Partial<DocumentBlockItem>, isTyping?: boolean) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onInsertBlock: (type: BlockType, afterId?: string | null) => void;
  isInsertMenuOpen: boolean;
  onToggleInsertMenu: () => void;
  onCloseInsertMenu: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSaveSnippet?: (block: DocumentBlockItem) => void;
  onOpenSnippetLibrary?: () => void;
  headingNumbers?: Map<string, string>;
}

export function EditorPanel({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onInsertBlock,
  isInsertMenuOpen,
  onToggleInsertMenu,
  onCloseInsertMenu,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSaveSnippet,
  onOpenSnippetLibrary,
  headingNumbers,
}: EditorPanelProps) {
  const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
  const selectedBlock = selectedIndex !== -1 ? blocks[selectedIndex] : null;

  return (
    <section
      aria-labelledby="editor-workspace-heading"
      className="h-full min-w-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden relative"
    >
      {/* Top Column Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 bg-white">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <h2
            id="editor-workspace-heading"
            className="text-sm font-semibold text-slate-900 tracking-tight whitespace-nowrap"
          >
            Editor
          </h2>
          <span className="text-xs text-slate-400" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-slate-500 truncate">
            Block-based editing workspace
          </span>
        </div>

        {/* Actions in top-right of Editor header */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenSnippetLibrary && (
            <button
              type="button"
              onClick={onOpenSnippetLibrary}
              title="Open Reusable Block Snippet Library"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <span>Snippets</span>
            </button>
          )}

          {/* Primary Insert Block Action Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={onToggleInsertMenu}
              title="Add Block (Ctrl+Alt+B)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>

            {/* Insert Block Dropdown Menu anchored right */}
            <div className="absolute right-0 top-full mt-1.5 z-50">
              <BlockInsertionMenu
                isOpen={isInsertMenuOpen}
                onClose={onCloseInsertMenu}
                onSelectType={(type) => {
                  onInsertBlock(type, selectedBlockId);
                }}
                onOpenSnippetLibrary={onOpenSnippetLibrary}
                targetIndexDescription={
                  selectedBlockId
                    ? `After block #${String(selectedIndex + 1).padStart(2, '0')}`
                    : 'At end of document'
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Contextual Toolbar Area */}
      <div className="shrink-0">
        <EditorToolbar
          totalBlocks={blocks.length}
          selectedBlock={selectedBlock}
          onUpdateBlock={(id, updated) => onUpdateBlock(id, updated, false)}
          onQuickAddType={(type) => onInsertBlock(type, selectedBlockId)}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      {/* Scrollable Modular Document Blocks Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
        {blocks.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-lg p-6 bg-white">
            <p className="text-xs font-medium text-slate-700 mb-1">
              Document is empty
            </p>
            <p className="text-[11px] text-slate-500 mb-4">
              Click &quot;Add Block&quot; to begin authoring.
            </p>
            <button
              type="button"
              onClick={onToggleInsertMenu}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert First Block</span>
            </button>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div key={block.id} id={`editor-block-${block.id}`}>
              <BlockRenderer
                block={block}
                blockIndex={index}
                totalBlocks={blocks.length}
                isSelected={block.id === selectedBlockId}
                onSelect={() => onSelectBlock(block.id)}
                onUpdate={(updatedData, isTyping) => onUpdateBlock(block.id, updatedData, isTyping)}
                onMoveUp={() => onMoveBlock(block.id, 'up')}
                onMoveDown={() => onMoveBlock(block.id, 'down')}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onSaveSnippet={onSaveSnippet ? () => onSaveSnippet(block) : undefined}
                displayNumber={headingNumbers?.get(block.id)}
              />
            </div>
          ))
        )}

        {/* End-of-document spacer and quick append affordance */}
        {blocks.length > 0 && (
          <div className="pt-2 pb-4 flex justify-center">
            <button
              type="button"
              onClick={onToggleInsertMenu}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-blue-700 hover:bg-blue-50/60 border border-dashed border-slate-300 hover:border-blue-300 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Block</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
