import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Layers,
  Heading,
  AlignLeft,
  List,
  Sigma,
  Table as TableIcon,
  SlidersHorizontal,
  PenTool,
} from 'lucide-react';
import { BlockSnippet } from '../types/template';
import {
  BUILT_IN_SNIPPETS,
  getUserSnippets,
  deleteUserSnippet,
} from '../services/templateService';
import { FormattedText } from './FormattedText';

interface SnippetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet: (snippet: BlockSnippet) => void;
}

export function SnippetLibraryModal({
  isOpen,
  onClose,
  onInsertSnippet,
}: SnippetLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'builtin' | 'custom'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSnippets, setUserSnippets] = useState<BlockSnippet[]>(() => getUserSnippets());

  const refreshSnippets = () => {
    setUserSnippets(getUserSnippets());
  };

  const allSnippets = useMemo(() => {
    return [...BUILT_IN_SNIPPETS, ...userSnippets];
  }, [userSnippets]);

  const filteredSnippets = useMemo(() => {
    return allSnippets.filter((s) => {
      if (activeTab === 'builtin' && !s.isBuiltIn) return false;
      if (activeTab === 'custom' && s.isBuiltIn) return false;

      if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchType = s.block.type.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchType) return false;
      }

      return true;
    });
  }, [allSnippets, activeTab, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleDeleteCustom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this reusable snippet?')) {
      deleteUserSnippet(id);
      refreshSnippets();
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'heading':
        return Heading;
      case 'paragraph':
        return AlignLeft;
      case 'list':
        return List;
      case 'formula':
        return Sigma;
      case 'table':
        return TableIcon;
      case 'metadata':
        return SlidersHorizontal;
      case 'signature':
        return PenTool;
      default:
        return Layers;
    }
  };

  const renderSnippetPreview = (snippet: BlockSnippet) => {
    const { block } = snippet;
    switch (block.type) {
      case 'paragraph':
        return (
          <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 line-clamp-3">
            <FormattedText text={block.text} />
          </div>
        );
      case 'heading':
        return (
          <div className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
            {block.text}
          </div>
        );
      case 'table':
        return (
          <div className="text-[11px] bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto">
            <div className="font-medium text-slate-500 mb-1">{block.caption || 'Table Grid'}</div>
            <div className="flex gap-2 font-semibold text-slate-700 border-b border-slate-200 pb-1">
              {block.headers.slice(0, 3).map((h, i) => (
                <span key={i} className="truncate flex-1">{h}</span>
              ))}
            </div>
            <div className="text-slate-400 text-[10px] mt-1 font-mono">
              {block.rows.length} rows × {block.headers.length} columns
            </div>
          </div>
        );
      case 'formula':
        return (
          <div className="text-xs font-mono bg-slate-900 text-emerald-400 p-2.5 rounded border border-slate-800 line-clamp-2">
            {block.latex}
          </div>
        );
      case 'signature':
        return (
          <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 space-y-0.5">
            <div className="font-semibold text-slate-900">{block.signatoryName}</div>
            <div className="text-slate-500 text-[11px]">{block.designation}</div>
            {block.organization && (
              <div className="text-slate-400 text-[10px]">{block.organization}</div>
            )}
          </div>
        );
      case 'metadata':
        return (
          <div className="text-[11px] bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-700">{block.title || 'Metadata'}</div>
            <div className="text-slate-500 text-[10px]">
              {block.rows.map((r) => r.label).slice(0, 3).join(', ')}...
            </div>
          </div>
        );
      default:
        return (
          <div className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200">
            {block.type} block snippet
          </div>
        );
    }
  };

  const categories = [
    'All',
    'Signatures',
    'Legal & Notices',
    'Tables',
    'Metadata',
    'Formulas',
    'Content',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="snippet-modal-title"
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="snippet-modal-title"
                className="text-base font-semibold text-slate-900 tracking-tight"
              >
                Reusable Block Snippet Library
              </h2>
              <p className="text-xs text-slate-500">
                Insert pre-configured clauses, tables, formulas, and signature presets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              All ({allSnippets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('builtin')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'builtin' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Built-in ({BUILT_IN_SNIPPETS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'custom' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              My Saved ({userSnippets.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snippets..."
              className="w-full pl-8 pr-3 py-1 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Snippet Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/30">
          {filteredSnippets.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              No snippets found matching your query.
            </div>
          ) : (
            filteredSnippets.map((snippet) => {
              const Icon = getBlockIcon(snippet.block.type);

              return (
                <div
                  key={snippet.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-slate-100 text-slate-600">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {snippet.category}
                        </span>
                      </div>

                      {snippet.isBuiltIn ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                          <Sparkles className="w-2.5 h-2.5" />
                          Built-in
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(e, snippet.id)}
                          title="Delete snippet"
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-xs font-semibold text-slate-900 mb-1">
                      {snippet.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">
                      {snippet.description}
                    </p>

                    {/* Preview box */}
                    <div className="mb-3">{renderSnippetPreview(snippet)}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 capitalize">
                      {snippet.block.type} block
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onInsertSnippet(snippet);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert Snippet</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredSnippets.length} snippets</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
