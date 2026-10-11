import React from 'react';
import { FileText, User, Calendar, Tag } from 'lucide-react';
import { DocumentMetadata } from '../types/document';

interface DocumentInformationProps {
  metadata: DocumentMetadata;
  onChange: (updated: Partial<DocumentMetadata>) => void;
}

export function DocumentInformation({ metadata, onChange }: DocumentInformationProps) {
  return (
    <section aria-labelledby="doc-info-heading" className="space-y-3.5">
      <div className="flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <h2
          id="doc-info-heading"
          className="text-xs font-semibold text-slate-900 tracking-tight"
        >
          Document Information
        </h2>
      </div>

      <div className="space-y-3">
        {/* Document Title */}
        <div className="space-y-1">
          <label
            htmlFor="doc-title"
            className="block text-xs font-medium text-slate-600"
          >
            Document Title
          </label>
          <input
            id="doc-title"
            type="text"
            value={metadata.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Enter document title..."
            className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Author */}
        <div className="space-y-1">
          <label
            htmlFor="doc-author"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
          >
            <User className="w-3 h-3 text-slate-400" />
            <span>Author</span>
          </label>
          <input
            id="doc-author"
            type="text"
            value={metadata.author}
            onChange={(e) => onChange({ author: e.target.value })}
            placeholder="Author name..."
            className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label
            htmlFor="doc-date"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
          >
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Date</span>
          </label>
          <input
            id="doc-date"
            type="date"
            value={metadata.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md font-mono tabular-nums focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Document Type Selector */}
        <div className="space-y-1">
          <label
            htmlFor="doc-type"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
          >
            <Tag className="w-3 h-3 text-slate-400" />
            <span>Document Type</span>
          </label>
          <select
            id="doc-type"
            value={metadata.documentType}
            onChange={(e) => onChange({ documentType: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 transition-colors"
          >
            <option value="technical-report">Technical Report</option>
            <option value="project-proposal">Project Proposal</option>
            <option value="academic-paper">Academic Paper</option>
            <option value="executive-brief">Executive Brief</option>
            <option value="standard-operating-procedure">Standard Operating Procedure</option>
          </select>
        </div>
      </div>
    </section>
  );
}
