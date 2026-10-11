import React, { useState } from 'react';
import { X, BookmarkPlus, Layers } from 'lucide-react';
import { DocumentModel } from '../types/document';
import { DocumentTemplate } from '../types/template';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentModel;
  onSave: (templateData: Omit<DocumentTemplate, 'id' | 'isBuiltIn' | 'createdAt'>) => void;
}

export function SaveTemplateModal({
  isOpen,
  onClose,
  document,
  onSave,
}: SaveTemplateModalProps) {
  const [name, setName] = useState(document.metadata.title || 'Custom Template');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentTemplate['category']>('General');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || `Custom template with ${document.blocks.length} blocks`,
      category,
      document,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-template-modal-title"
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
                id="save-template-modal-title"
                className="text-sm font-semibold text-slate-900 tracking-tight"
              >
                Save as Document Template
              </h3>
              <p className="text-[11px] text-slate-500">
                Store current document layout as a reusable template
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
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Client Onboarding Agreement"
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentTemplate['category'])}
              className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              <option value="Technical">Technical</option>
              <option value="Business">Business</option>
              <option value="Reports">Reports</option>
              <option value="Academic">Academic</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of when and how to use this template..."
              className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Includes current {document.blocks.length} blocks & page settings</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {document.metadata.pageSize} · {document.metadata.pageOrientation}
            </span>
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
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
