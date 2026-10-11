import React, { useState } from 'react';
import { X, BookmarkPlus, Tag } from 'lucide-react';
import { DocumentBlockItem } from '../types/document';
import { BlockSnippet } from '../types/template';

interface SaveSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: DocumentBlockItem | null;
  onSave: (snippetData: Omit<BlockSnippet, 'id' | 'isBuiltIn' | 'createdAt'>) => void;
}

export function SaveSnippetModal({
  isOpen,
  onClose,
  block,
  onSave,
}: SaveSnippetModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BlockSnippet['category']>('Content');

  if (!isOpen || !block) return null;

  const defaultName = () => {
    switch (block.type) {
      case 'heading':
        return `Heading: ${(block as any).text?.slice(0, 24) || 'Section'}`;
      case 'paragraph':
        return `Paragraph: ${(block as any).text?.slice(0, 24) || 'Content'}`;
      case 'table':
        return `Table: ${(block as any).caption || 'Data Grid'}`;
      case 'formula':
        return 'Math Formula Expression';
      case 'signature':
        return `Sign-off: ${(block as any).signatoryName || 'Signature'}`;
      case 'metadata':
        return `Metadata: ${(block as any).title || 'Document Properties'}`;
      case 'list':
        return 'Structured List Block';
      default:
        return 'Reusable Block';
    }
  };

  const currentName = name || defaultName();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName.trim()) return;

    onSave({
      name: currentName.trim(),
      description: description.trim() || `Reusable ${block.type} block snippet`,
      category,
      block,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-snippet-modal-title"
        className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="save-snippet-modal-title"
                className="text-sm font-semibold text-slate-900 tracking-tight"
              >
                Save Block to Snippet Library
              </h3>
              <p className="text-[11px] text-slate-500">
                Reuse this block anytime across all your documents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Snippet Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultName()}
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BlockSnippet['category'])}
              className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              <option value="Signatures">Signatures</option>
              <option value="Legal & Notices">Legal & Notices</option>
              <option value="Tables">Tables</option>
              <option value="Metadata">Metadata</option>
              <option value="Formulas">Formulas</option>
              <option value="Content">General Content</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Standard executive signature for vendor contracts..."
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Block type pill */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Block Type:</span>
              <span className="capitalize text-blue-700 font-semibold">{block.type}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">ID: {block.id}</span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
            >
              Save to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
