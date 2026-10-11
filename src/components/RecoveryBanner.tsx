import React from 'react';
import { History, ArrowRight, Trash2, X, Clock, FileText } from 'lucide-react';
import { RecoveryMeta } from '../services/documentPersistence';

interface RecoveryBannerProps {
  meta: RecoveryMeta;
  onRestore: () => void;
  onDismiss: () => void;
}

export function RecoveryBanner({ meta, onRestore, onDismiss }: RecoveryBannerProps) {
  const formattedTime = new Date(meta.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formattedDate = new Date(meta.timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      role="alert"
      className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-4 text-xs select-none shadow-xs animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
          <History className="w-3 h-3" />
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-semibold text-amber-900">
            Unsaved session recovered:
          </span>
          <span className="text-amber-800 font-medium truncate max-w-[220px]">
            &ldquo;{meta.title}&rdquo;
          </span>
          <span className="text-amber-600 inline-flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3 h-3 inline" />
            {formattedDate} {formattedTime} ({meta.blockCount} blocks)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 border border-amber-600 rounded shadow-2xs transition-colors cursor-pointer"
        >
          <span>Restore Work</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={onDismiss}
          title="Discard recovery snapshot"
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-800 hover:text-amber-900 hover:bg-amber-100 rounded transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Discard</span>
        </button>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss banner"
          className="p-1 text-amber-600 hover:text-amber-900 rounded hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
