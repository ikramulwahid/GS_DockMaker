import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Code,
  Eraser,
} from 'lucide-react';
import { TableBlockData, TableAlignment } from '../../types/document';
import {
  applyInlineWrapToInput,
  handleFormattingKeyboardShortcut,
} from '../../utils/textFormatting';

interface TableBlockProps {
  block: TableBlockData;
  onChange: (updated: Partial<TableBlockData>) => void;
}

export function TableBlock({ block, onChange }: TableBlockProps) {
  const [selectedCell, setSelectedCell] = useState<{
    type: 'header' | 'cell';
    row?: number;
    col: number;
  } | null>(null);

  const activeInputRef = useRef<HTMLInputElement | null>(null);

  const columnAlignments: TableAlignment[] =
    block.columnAlignments && block.columnAlignments.length === block.headers.length
      ? block.columnAlignments
      : block.headers.map(() => 'left');

  const headerStyle = block.headerStyle || 'default';

  const handleHeaderChange = (colIndex: number, text: string) => {
    const updated = [...block.headers];
    updated[colIndex] = text;
    onChange({ headers: updated });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, text: string) => {
    const updatedRows = block.rows.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      const newRow = [...row];
      newRow[colIndex] = text;
      return newRow;
    });
    onChange({ rows: updatedRows });
  };

  const handleAddRow = () => {
    const emptyRow = new Array(block.headers.length).fill('');
    onChange({ rows: [...block.rows, emptyRow] });
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (block.rows.length <= 1) return;
    onChange({ rows: block.rows.filter((_, idx) => idx !== rowIndex) });
    if (selectedCell?.type === 'cell' && selectedCell.row === rowIndex) {
      setSelectedCell(null);
    }
  };

  const handleAddColumn = () => {
    const newHeaders = [...block.headers, `Column ${block.headers.length + 1}`];
    const newRows = block.rows.map((row) => [...row, '']);
    const newAligns: TableAlignment[] = [...columnAlignments, 'left'];
    onChange({ headers: newHeaders, rows: newRows, columnAlignments: newAligns });
  };

  const handleRemoveColumn = (colIndex: number) => {
    if (block.headers.length <= 1) return;
    const newHeaders = block.headers.filter((_, idx) => idx !== colIndex);
    const newRows = block.rows.map((row) => row.filter((_, idx) => idx !== colIndex));
    const newAligns = columnAlignments.filter((_, idx) => idx !== colIndex);
    onChange({ headers: newHeaders, rows: newRows, columnAlignments: newAligns });
    if (selectedCell?.col === colIndex) {
      setSelectedCell(null);
    }
  };

  const handleColumnAlignChange = (colIndex: number, align: TableAlignment) => {
    const newAligns = [...columnAlignments];
    newAligns[colIndex] = align;
    onChange({ columnAlignments: newAligns });
  };

  const applyFormatToSelected = (prefix: string, suffix: string, placeholder = 'text') => {
    if (!selectedCell) return;
    const input = activeInputRef.current;
    if (!input) return;

    if (selectedCell.type === 'header') {
      const current = block.headers[selectedCell.col] || '';
      const result = applyInlineWrapToInput(input, current, prefix, suffix, placeholder);
      handleHeaderChange(selectedCell.col, result.updatedText);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
      }, 0);
    } else if (selectedCell.type === 'cell' && selectedCell.row !== undefined) {
      const current = block.rows[selectedCell.row]?.[selectedCell.col] || '';
      const result = applyInlineWrapToInput(input, current, prefix, suffix, placeholder);
      handleCellChange(selectedCell.row, selectedCell.col, result.updatedText);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
      }, 0);
    }
  };

  const clearFormatOfSelected = () => {
    if (!selectedCell) return;
    if (selectedCell.type === 'header') {
      const current = block.headers[selectedCell.col] || '';
      const cleaned = current.replace(/[*_`~=]|<u>|<\/u>/g, '');
      handleHeaderChange(selectedCell.col, cleaned);
    } else if (selectedCell.type === 'cell' && selectedCell.row !== undefined) {
      const current = block.rows[selectedCell.row]?.[selectedCell.col] || '';
      const cleaned = current.replace(/[*_`~=]|<u>|<\/u>/g, '');
      handleCellChange(selectedCell.row, selectedCell.col, cleaned);
    }
  };

  const headerBgClass =
    headerStyle === 'accent'
      ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-200'
      : headerStyle === 'minimal'
      ? 'bg-white border-b border-slate-200 text-slate-800'
      : 'bg-slate-50 border-b border-slate-200 text-slate-800';

  return (
    <div className="space-y-3">
      {/* Table Caption, Header Style Selector & Cell Formatting */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px] flex items-center gap-1.5">
          <label htmlFor={`tbl-caption-${block.id}`} className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
            Caption:
          </label>
          <input
            id={`tbl-caption-${block.id}`}
            type="text"
            value={block.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Table 1.1 — Summary description..."
            className="flex-1 px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Header style */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Header:</span>
            <select
              value={headerStyle}
              onChange={(e) => onChange({ headerStyle: e.target.value as 'default' | 'accent' | 'minimal' })}
              className="px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="default">Standard Slate</option>
              <option value="accent">Blue Accent</option>
              <option value="minimal">Minimal White</option>
            </select>
          </div>

          {/* Cell formatting actions */}
          <div className="inline-flex items-center rounded border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => applyFormatToSelected('**', '**', 'bold')}
              disabled={!selectedCell}
              title="Bold Cell Text (Ctrl+B)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatToSelected('*', '*', 'italic')}
              disabled={!selectedCell}
              title="Italic Cell Text (Ctrl+I)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatToSelected('`', '`', 'code')}
              disabled={!selectedCell}
              title="Code Cell Text (`code`)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={clearFormatOfSelected}
              disabled={!selectedCell}
              title="Clear Cell Formatting"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editable Table Grid with cell selection and column alignment */}
      <div className="overflow-x-auto border border-slate-200 rounded">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={headerBgClass}>
              {block.headers.map((header, colIdx) => {
                const align = columnAlignments[colIdx] || 'left';
                const isSelected = selectedCell?.type === 'header' && selectedCell.col === colIdx;
                return (
                  <th key={colIdx} className="p-1.5 border-r border-slate-200 min-w-[130px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={header}
                          onFocus={(e) => {
                            activeInputRef.current = e.currentTarget;
                            setSelectedCell({ type: 'header', col: colIdx });
                          }}
                          onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                          onKeyDown={(e) => {
                            handleFormattingKeyboardShortcut(e, header, (val) =>
                              handleHeaderChange(colIdx, val)
                            );
                          }}
                          placeholder={`Header ${colIdx + 1}`}
                          className={`w-full px-1.5 py-0.5 font-semibold bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 rounded text-xs transition-colors ${
                            isSelected ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-400' : ''
                          } ${
                            align === 'center'
                              ? 'text-center'
                              : align === 'right'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(colIdx)}
                          disabled={block.headers.length <= 1}
                          title="Remove column"
                          aria-label={`Remove column ${colIdx + 1}`}
                          className="p-0.5 text-slate-400 hover:text-red-600 disabled:opacity-20 rounded cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Column alignment bar */}
                      <div className="flex items-center justify-center gap-0.5 pt-0.5 border-t border-slate-200/50">
                        <button
                          type="button"
                          onClick={() => handleColumnAlignChange(colIdx, 'left')}
                          title="Align column left"
                          className={`p-0.5 rounded text-[10px] ${align === 'left' ? 'text-blue-600 bg-white font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                          <AlignLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleColumnAlignChange(colIdx, 'center')}
                          title="Align column center"
                          className={`p-0.5 rounded text-[10px] ${align === 'center' ? 'text-blue-600 bg-white font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                          <AlignCenter className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleColumnAlignChange(colIdx, 'right')}
                          title="Align column right"
                          className={`p-0.5 rounded text-[10px] ${align === 'right' ? 'text-blue-600 bg-white font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                          <AlignRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}
              <th className="w-8 p-1 text-center bg-slate-100/40 border-slate-200"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {block.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                {row.map((cell, colIdx) => {
                  const align = columnAlignments[colIdx] || 'left';
                  const isSelected =
                    selectedCell?.type === 'cell' &&
                    selectedCell.row === rowIdx &&
                    selectedCell.col === colIdx;
                  return (
                    <td
                      key={colIdx}
                      className={`p-1 border-r border-slate-200 transition-colors ${
                        isSelected ? 'bg-blue-50/60 ring-1 ring-inset ring-blue-400' : ''
                      }`}
                    >
                      <input
                        type="text"
                        value={cell}
                        onFocus={(e) => {
                          activeInputRef.current = e.currentTarget;
                          setSelectedCell({ type: 'cell', row: rowIdx, col: colIdx });
                        }}
                        onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                        onKeyDown={(e) => {
                          handleFormattingKeyboardShortcut(e, cell, (val) =>
                            handleCellChange(rowIdx, colIdx, val)
                          );
                        }}
                        placeholder="Value"
                        className={`w-full px-1.5 py-1 text-slate-800 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 rounded text-xs ${
                          align === 'center'
                            ? 'text-center'
                            : align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      />
                    </td>
                  );
                })}
                <td className="w-8 p-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(rowIdx)}
                    disabled={block.rows.length <= 1}
                    title="Remove row"
                    aria-label={`Remove row ${rowIdx + 1}`}
                    className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row / Column Addition Controls and Selected Cell info */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Row</span>
          </button>

          <button
            type="button"
            onClick={handleAddColumn}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Column</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          {block.rows.length} rows × {block.headers.length} cols
          {selectedCell &&
            (selectedCell.type === 'header'
              ? ` · Header (${selectedCell.col + 1}) selected`
              : ` · Cell (${(selectedCell.row ?? 0) + 1}, ${selectedCell.col + 1}) selected`)}
        </span>
      </div>
    </div>
  );
}
