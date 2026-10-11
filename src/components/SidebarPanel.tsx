import React, { useState } from 'react';
import { Settings, ListTree } from 'lucide-react';
import { DocumentInformation } from './DocumentInformation';
import { DocumentSettings } from './DocumentSettings';
import { QuickActions } from './QuickActions';
import { DocumentOutline } from './DocumentOutline';
import { DocumentMetadata } from '../types/document';
import { OutlineItem } from '../utils/headingNumbering';

interface SidebarPanelProps {
  metadata: DocumentMetadata;
  onUpdateMetadata: (updated: Partial<DocumentMetadata>) => void;
  onInsertBlock: () => void;
  onOpenShortcuts?: () => void;
  onOpenTemplates?: () => void;
  onOpenSnippetLibrary?: () => void;
  outline?: OutlineItem[];
  selectedBlockId?: string | null;
  onNavigateToHeading?: (headingId: string) => void;
}

export function SidebarPanel({
  metadata,
  onUpdateMetadata,
  onInsertBlock,
  onOpenShortcuts,
  onOpenTemplates,
  onOpenSnippetLibrary,
  outline = [],
  selectedBlockId = null,
  onNavigateToHeading,
}: SidebarPanelProps) {
  // Sidebar tab switcher: 'properties' (Document info & settings) vs 'outline' (Document structure)
  const [activeTab, setActiveTab] = useState<'properties' | 'outline'>('properties');

  return (
    <aside
      aria-label="Document Navigation, Metadata and Settings"
      className="h-full min-w-0 bg-slate-50/70 border-r border-slate-200 flex flex-col overflow-hidden"
    >
      {/* Compact Tab Switcher Header */}
      <div className="p-2 border-b border-slate-200 bg-white shrink-0">
        <div className="grid grid-cols-2 p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'properties'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Properties</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outline')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'outline'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Outline</span>
            {outline.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200 text-slate-700 font-mono">
                {outline.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'properties' ? (
          <>
            <DocumentInformation
              metadata={metadata}
              onChange={onUpdateMetadata}
            />
            <hr className="border-slate-200" />
            <DocumentSettings
              metadata={metadata}
              onChange={onUpdateMetadata}
            />
            <hr className="border-slate-200" />
            <QuickActions
              onInsertBlock={onInsertBlock}
              onOpenShortcuts={onOpenShortcuts}
              onOpenTemplates={onOpenTemplates}
              onOpenSnippetLibrary={onOpenSnippetLibrary}
            />
          </>
        ) : (
          <DocumentOutline
            outline={outline}
            selectedBlockId={selectedBlockId}
            onNavigateToHeading={(headingId) => {
              if (onNavigateToHeading) {
                onNavigateToHeading(headingId);
              }
            }}
          />
        )}
      </div>
    </aside>
  );
}
