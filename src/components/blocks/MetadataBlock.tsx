import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { MetadataBlockData, MetadataStyle } from '../../types/document';
import { generateBlockId } from '../../utils/documentModel';

interface MetadataBlockProps {
  block: MetadataBlockData;
  onChange: (updated: Partial<MetadataBlockData>) => void;
}

export function MetadataBlock({ block, onChange }: MetadataBlockProps) {
  const currentStyle: MetadataStyle = block.style || 'table';

  const handleRowChange = (id: string, field: 'label' | 'value', text: string) => {
    const updated = block.rows.map((row) =>
      row.id === id ? { ...row, [field]: text } : row
    );
    onChange({ rows: updated });
  };

  const handleAddRow = () => {
    const newRow = {
      id: generateBlockId('row'),
      label: 'New Property',
      value: '',
    };
    onChange({ rows: [...block.rows, newRow] });
  };

  const handleRemoveRow = (id: string) => {
    if (block.rows.length <= 1) return;
    onChange({ rows: block.rows.filter((r) => r.id !== id) });
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === block.rows.length - 1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    const updated = [...block.rows];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    onChange({ rows: updated });
  };

  return (
    <div className="space-y-3">
      {/* Title & Style layout options */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px] flex items-center gap-1.5">
          <label htmlFor={`meta-title-${block.id}`} className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
            Title:
          </label>
          <input
            id={`meta-title-${block.id}`}
            type="text"
            value={block.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Document Attributes Header..."
            className="flex-1 px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor={`meta-style-${block.id}`} className="text-[11px] font-medium text-slate-500">
            Layout:
          </label>
          <select
            id={`meta-style-${block.id}`}
            value={currentStyle}
            onChange={(e) => onChange({ style: e.target.value as MetadataStyle })}
            className="px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          >
            <option value="table">Table Layout</option>
            <option value="cards">Key-Value Cards</option>
            <option value="badges">Inline Badges</option>
          </select>
        </div>
      </div>

      {/* Structured Label-Value rows */}
      <div className="space-y-1.5 border border-slate-200 rounded p-2.5 bg-slate-50/50">
        <div className="grid grid-cols-[1fr_1.5fr_auto] gap-2 px-1 text-[11px] font-medium text-slate-500">
          <span>Property Label</span>
          <span>Assigned Value</span>
          <span className="w-14 text-center">Actions</span>
        </div>

        {block.rows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_1.5fr_auto] gap-2 items-center group"
          >
            <input
              type="text"
              value={row.label}
              onChange={(e) => handleRowChange(row.id, 'label', e.target.value)}
              placeholder="Property name"
              className="px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) => handleRowChange(row.id, 'value', e.target.value)}
              placeholder="(Optional empty value)"
              className="px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
            />
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => handleMoveRow(index, 'up')}
                disabled={index === 0}
                title="Move row up"
                className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-20 rounded transition-colors cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveRow(index, 'down')}
                disabled={index === block.rows.length - 1}
                title="Move row down"
                className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-20 rounded transition-colors cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveRow(row.id)}
                disabled={block.rows.length <= 1}
                title="Remove attribute row"
                className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Row Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-dashed border-blue-200 rounded transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Property Row</span>
        </button>

        <span className="text-[10px] text-slate-400">
          Empty values render gracefully without breaking alignment
        </span>
      </div>
    </div>
  );
}
