import React from 'react';
import { AlertTriangle, Save, Trash2, X } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  actionTitle: string; // e.g. "Create New Document" or "Open Document"
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  actionTitle,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-modal-title"
        className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3
                id="unsaved-modal-title"
                className="text-sm font-semibold text-slate-900 tracking-tight"
              >
                Unsaved Changes Detected
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have unsaved changes in the current document. Before you proceed to{' '}
                <span className="font-medium text-slate-900 lowercase">{actionTitle}</span>,
                would you like to save your work?
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard Changes</span>
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save &amp; Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
