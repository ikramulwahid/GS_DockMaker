import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutCategory {
  category: string;
  items: {
    label: string;
    keys: string[];
    description?: string;
  }[];
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    category: 'Document Management',
    items: [
      { label: 'Save Document', keys: ['Ctrl', 'S'], description: 'Download native .document.json' },
      { label: 'New / Templates', keys: ['Ctrl', 'Alt', 'N'], description: 'Open template selector or blank document' },
      { label: 'Open File', keys: ['Ctrl', 'O'], description: 'Open local .document.json file' },
      { label: 'Export PDF', keys: ['Ctrl', 'Shift', 'E'], description: 'Generate high-fidelity paginated PDF' },
    ],
  },
  {
    category: 'History & Editing',
    items: [
      { label: 'Undo', keys: ['Ctrl', 'Z'], description: 'Revert last modification' },
      { label: 'Redo', keys: ['Ctrl', 'Shift', 'Z'], description: 'Reapply undone modification (or Ctrl+Y)' },
      { label: 'Insert Block Menu', keys: ['Ctrl', 'Alt', 'B'], description: 'Open block insertion dropdown' },
      { label: 'Shortcuts Reference', keys: ['Ctrl', '/'], description: 'Toggle this keyboard shortcut guide' },
    ],
  },
  {
    category: 'Text Formatting & Lists',
    items: [
      { label: 'Bold Text', keys: ['Ctrl', 'B'], description: 'Wrap selection in **bold**' },
      { label: 'Italic Text', keys: ['Ctrl', 'I'], description: 'Wrap selection in *italics*' },
      { label: 'Underline Text', keys: ['Ctrl', 'U'], description: 'Wrap selection in <u>underline</u>' },
      { label: 'Indent List Item', keys: ['Tab'], description: 'Increase list item indent level' },
      { label: 'Outdent List Item', keys: ['Shift', 'Tab'], description: 'Decrease list item indent level' },
      { label: 'Add Next Item', keys: ['Enter'], description: 'Create next item in list' },
    ],
  },
  {
    category: 'Block Selection & Operations',
    items: [
      { label: 'Select Next Block', keys: ['Alt', '↓'], description: 'Move selection focus down' },
      { label: 'Select Prev Block', keys: ['Alt', '↑'], description: 'Move selection focus up' },
      { label: 'Move Block Up', keys: ['Ctrl', 'Shift', '↑'], description: 'Shift selected block upwards' },
      { label: 'Move Block Down', keys: ['Ctrl', 'Shift', '↓'], description: 'Shift selected block downwards' },
      { label: 'Duplicate Block', keys: ['Ctrl', 'Shift', 'D'], description: 'Duplicate active block' },
      { label: 'Delete Block', keys: ['Ctrl', 'Shift', 'Backspace'], description: 'Safely remove selected block' },
    ],
  },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        className="w-full max-w-xl bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="shortcuts-modal-title"
                className="text-sm font-semibold text-slate-900 tracking-tight"
              >
                Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-slate-500">
                Speed up your document authoring workflow
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

        {/* Shortcuts list grouped by category */}
        <div className="p-5 overflow-y-auto space-y-5">
          {SHORTCUTS.map((section) => (
            <div key={section.category} className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.category}
              </h4>
              <div className="border border-slate-200 rounded divide-y divide-slate-100 bg-white">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="px-3 py-2 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800">{item.label}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400">{item.description}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-300 rounded shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Press <kbd className="px-1 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded">Esc</kbd> to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
