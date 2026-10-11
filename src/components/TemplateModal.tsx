import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  FilePlus,
  BookOpen,
  Search,
  Check,
  Trash2,
  Download,
  Upload,
  Layers,
  FileText,
  BookmarkPlus,
  Sparkles,
} from 'lucide-react';
import { DocumentTemplate } from '../types/template';
import {
  BUILT_IN_TEMPLATES,
  getUserTemplates,
  deleteUserTemplate,
  exportTemplateAsJson,
} from '../services/templateService';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
  onSelectBlank: () => void;
  onOpenSaveCurrentModal: () => void;
}

export function TemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onSelectBlank,
  onOpenSaveCurrentModal,
}: TemplateModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'builtin' | 'custom'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userTemplates, setUserTemplates] = useState<DocumentTemplate[]>(() => getUserTemplates());
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<DocumentTemplate | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  // Refresh user templates when modal opens
  const refreshUserTemplates = () => {
    setUserTemplates(getUserTemplates());
  };

  const allTemplates = useMemo(() => {
    return [...BUILT_IN_TEMPLATES, ...userTemplates];
  }, [userTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      // Tab filter
      if (activeTab === 'builtin' && !t.isBuiltIn) return false;
      if (activeTab === 'custom' && t.isBuiltIn) return false;

      // Category filter
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchType = t.document.metadata.documentType.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchType) return false;
      }

      return true;
    });
  }, [allTemplates, activeTab, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleDeleteCustom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this custom template?')) {
      deleteUserTemplate(id);
      refreshUserTemplates();
      if (selectedPreviewTemplate?.id === id) {
        setSelectedPreviewTemplate(null);
      }
    }
  };

  const handleExportCustom = (e: React.MouseEvent, template: DocumentTemplate) => {
    e.stopPropagation();
    exportTemplateAsJson(template);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.document && parsed.name) {
          const templates = getUserTemplates();
          const imported: DocumentTemplate = {
            ...parsed,
            id: `custom-template-${Date.now()}`,
            isBuiltIn: false,
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(
            'document_studio_user_templates_v1',
            JSON.stringify([imported, ...templates])
          );
          refreshUserTemplates();
        }
      } catch (err) {
        console.error('Import failed:', err);
      }
    };
    reader.readAsText(file);
  };

  const categories = ['All', 'Technical', 'Business', 'Reports', 'Academic', 'General'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-modal-title"
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="template-modal-title"
                className="text-base font-semibold text-slate-900 tracking-tight"
              >
                Create Document from Template
              </h2>
              <p className="text-xs text-slate-500">
                Start from a professionally styled framework or blank canvas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSaveCurrentModal();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Current as Template</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              All ({allTemplates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('builtin')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'builtin' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Built-in ({BUILT_IN_TEMPLATES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'custom' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              My Saved ({userTemplates.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-8 pr-3 py-1 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Hidden Import file input */}
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              title="Import .template.json file"
              className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
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

        {/* Template Grid & Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/30">
          {/* Quick Option: Blank Document */}
          <div
            onClick={() => {
              onSelectBlank();
              onClose();
            }}
            className="group relative bg-white border border-dashed border-slate-300 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors mb-3">
                <FilePlus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                Blank Document
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Start from an empty canvas with standard page setup and clean default formatting.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">0 Blocks</span>
              <button
                type="button"
                className="text-xs font-medium text-blue-600 group-hover:underline flex items-center gap-1"
              >
                Start Blank &rarr;
              </button>
            </div>
          </div>

          {/* Render Templates */}
          {filteredTemplates.map((template) => {
            const blockCount = template.document.blocks.length;
            const pageSize = template.document.metadata.pageSize;
            const orientation = template.document.metadata.pageOrientation;

            return (
              <div
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {template.category}
                    </span>
                    {template.isBuiltIn ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        <Sparkles className="w-2.5 h-2.5" />
                        Built-in
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleExportCustom(e, template)}
                          title="Export template file"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(e, template.id)}
                          title="Delete custom template"
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
                    {template.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{blockCount} blocks</span>
                    <span>·</span>
                    <span>{pageSize}</span>
                  </div>

                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 group-hover:underline flex items-center gap-1"
                  >
                    Use Template &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredTemplates.length} templates
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
