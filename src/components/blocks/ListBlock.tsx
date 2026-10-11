import React, { useRef } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Indent,
  Outdent,
  Bold,
  Italic,
  Code,
} from 'lucide-react';
import { ListBlockData, ListStyle, ListItemData } from '../../types/document';
import { generateBlockId, normalizeListItems } from '../../utils/documentModel';
import {
  applyInlineWrapToInput,
  handleFormattingKeyboardShortcut,
} from '../../utils/textFormatting';

interface ListBlockProps {
  block: ListBlockData;
  onChange: (updated: Partial<ListBlockData>) => void;
}

export function ListBlock({ block, onChange }: ListBlockProps) {
  const itemInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const styles: { value: ListStyle; label: string }[] = [
    { value: 'bullet', label: 'Bullets (•)' },
    { value: 'dash', label: 'Dashes (–)' },
    { value: 'arrow', label: 'Arrowheads (→)' },
    { value: 'dot', label: 'Dots (·)' },
    { value: 'numbered', label: 'Numbers (1, 2, 3)' },
    { value: 'alphabetical', label: 'Lowercase Letters (a, b, c)' },
    { value: 'uppercase-alpha', label: 'Uppercase Letters (A, B, C)' },
  ];

  const items: ListItemData[] = normalizeListItems(block.items);

  const handleItemTextChange = (index: number, text: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], text };
    onChange({ items: updated });
  };

  const handleAddItem = (afterIndex?: number) => {
    const newItemId = generateBlockId('item');
    const newItem: ListItemData = {
      id: newItemId,
      text: '',
      indent: afterIndex !== undefined ? items[afterIndex]?.indent || 0 : 0,
    };
    if (afterIndex === undefined) {
      onChange({ items: [...items, newItem] });
    } else {
      const updated = [...items];
      updated.splice(afterIndex + 1, 0, newItem);
      onChange({ items: updated });
    }

    // Auto-focus the newly created item
    setTimeout(() => {
      itemInputRefs.current[newItemId]?.focus();
    }, 50);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const prevItemId = index > 0 ? items[index - 1].id : items[1]?.id;
    const updated = items.filter((_, i) => i !== index);
    onChange({ items: updated });

    if (prevItemId) {
      setTimeout(() => {
        itemInputRefs.current[prevItemId]?.focus();
      }, 50);
    }
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    onChange({ items: updated });
  };

  const handleIndent = (index: number, delta: number) => {
    const updated = [...items];
    const currentIndent = updated[index].indent || 0;
    const nextIndent = Math.max(0, Math.min(2, currentIndent + delta));
    if (currentIndent !== nextIndent) {
      updated[index] = { ...updated[index], indent: nextIndent };
      onChange({ items: updated });
    }
  };

  const applyFormatToItem = (
    index: number,
    prefix: string,
    suffix: string,
    placeholder = 'text'
  ) => {
    const item = items[index];
    const input = itemInputRefs.current[item.id];
    if (!input) return;

    const result = applyInlineWrapToInput(input, item.text, prefix, suffix, placeholder);
    handleItemTextChange(index, result.updatedText);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
    }, 0);
  };

  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    item: ListItemData
  ) => {
    // 1. Text formatting shortcuts (Ctrl/Cmd+B, Ctrl/Cmd+I, Ctrl/Cmd+U, Ctrl/Cmd+`)
    if (
      handleFormattingKeyboardShortcut(e, item.text, (newText) =>
        handleItemTextChange(index, newText)
      )
    ) {
      return;
    }

    // 2. Tab / Shift+Tab for Indent / Outdent
    if (e.key === 'Tab') {
      e.preventDefault();
      handleIndent(index, e.shiftKey ? -1 : 1);
      return;
    }

    // 3. Enter to insert next item
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(index);
      return;
    }

    // 4. Backspace on empty item: outdent or delete
    if (e.key === 'Backspace' && item.text === '') {
      if (item.indent > 0) {
        e.preventDefault();
        handleIndent(index, -1);
      } else if (items.length > 1) {
        e.preventDefault();
        handleRemoveItem(index);
      }
      return;
    }

    // 5. Arrow Up / Down navigation between items
    if (e.key === 'ArrowUp' && index > 0) {
      const input = e.currentTarget;
      if (input.selectionStart === 0 && input.selectionEnd === 0) {
        e.preventDefault();
        itemInputRefs.current[items[index - 1].id]?.focus();
      }
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      const input = e.currentTarget;
      if (
        input.selectionStart === item.text.length &&
        input.selectionEnd === item.text.length
      ) {
        e.preventDefault();
        itemInputRefs.current[items[index + 1].id]?.focus();
      }
    }
  };

  const getPrefixMarker = (index: number, indent: number) => {
    switch (block.style) {
      case 'numbered': {
        if (indent === 1) return `${String.fromCharCode(97 + (index % 26))}.`;
        if (indent === 2) return `(${index + 1})`;
        return `${index + 1}.`;
      }
      case 'alphabetical': {
        if (indent === 1) return `${index + 1}.`;
        return `${String.fromCharCode(97 + (index % 26))}.`;
      }
      case 'uppercase-alpha': {
        if (indent === 1) return `${index + 1}.`;
        return `${String.fromCharCode(65 + (index % 26))}.`;
      }
      case 'dash':
        return '–';
      case 'arrow':
        return '→';
      case 'dot':
        return '·';
      case 'bullet':
      default:
        return indent === 1 ? '◦' : indent === 2 ? '▪' : '•';
    }
  };

  return (
    <div className="space-y-3">
      {/* List style selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <label htmlFor={`list-style-${block.id}`} className="text-[11px] font-medium text-slate-500">
            List Style:
          </label>
          <select
            id={`list-style-${block.id}`}
            value={block.style}
            onChange={(e) => onChange({ style: e.target.value as ListStyle })}
            className="px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          >
            {styles.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[10px] text-slate-400">
          {items.length} {items.length === 1 ? 'item' : 'items'} · Press Tab to indent, Shift+Tab to outdent
        </span>
      </div>

      {/* List items with reordering and indent/outdent */}
      <div className="space-y-1.5">
        {items.map((item, index) => {
          const indent = item.indent || 0;
          return (
            <div
              key={item.id}
              className="flex items-center gap-1.5 group hover:bg-slate-50/70 p-0.5 rounded transition-colors"
              style={{ paddingLeft: `${indent * 1.25}rem` }}
            >
              {/* Prefix marker */}
              <span className="w-5 text-right font-mono text-xs text-slate-500 shrink-0 select-none">
                {getPrefixMarker(index, indent)}
              </span>

              {/* Item Text Input */}
              <input
                ref={(el) => {
                  itemInputRefs.current[item.id] = el;
                }}
                type="text"
                value={item.text}
                onChange={(e) => handleItemTextChange(index, e.target.value)}
                onKeyDown={(e) => handleItemKeyDown(e, index, item)}
                placeholder={`Item ${index + 1}...`}
                className="flex-1 px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
              />

              {/* Inline formatting quick tags */}
              <div className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-slate-50 p-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => applyFormatToItem(index, '**', '**', 'bold')}
                  title="Bold (Ctrl+B)"
                  className="p-0.5 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                >
                  <Bold className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatToItem(index, '*', '*', 'italic')}
                  title="Italic (Ctrl+I)"
                  className="p-0.5 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                >
                  <Italic className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatToItem(index, '`', '`', 'code')}
                  title="Code (`code`)"
                  className="p-0.5 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                >
                  <Code className="w-3 h-3" />
                </button>
              </div>

              {/* Item controls: Indent/Outdent & Up/Down & Remove */}
              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  type="button"
                  onClick={() => handleIndent(index, -1)}
                  disabled={indent === 0}
                  title="Outdent item (Shift+Tab)"
                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 disabled:opacity-20 rounded transition-colors cursor-pointer"
                >
                  <Outdent className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleIndent(index, 1)}
                  disabled={indent >= 2}
                  title="Indent item (Tab)"
                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 disabled:opacity-20 rounded transition-colors cursor-pointer"
                >
                  <Indent className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveItem(index, 'up')}
                  disabled={index === 0}
                  title="Move item up"
                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 disabled:opacity-20 rounded transition-colors cursor-pointer"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  title="Move item down"
                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 disabled:opacity-20 rounded transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length <= 1}
                  title="Remove item"
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-20 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add item button */}
      <div>
        <button
          type="button"
          onClick={() => handleAddItem()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-dashed border-blue-200 rounded transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item (or press Enter)</span>
        </button>
      </div>
    </div>
  );
}
