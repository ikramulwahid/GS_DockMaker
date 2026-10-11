import React from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { SignatureBlockData } from '../../types/document';

interface SignatureBlockProps {
  block: SignatureBlockData;
  onChange: (updated: Partial<SignatureBlockData>) => void;
}

export function SignatureBlock({ block, onChange }: SignatureBlockProps) {
  const align = block.align || 'left';

  const alignContainerClass =
    align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

  return (
    <div className="space-y-3.5">
      {/* Alignment and Label Setting */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
          <label htmlFor={`sig-label-${block.id}`} className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
            Line Label:
          </label>
          <input
            id={`sig-label-${block.id}`}
            type="text"
            value={block.signatureLabel || ''}
            onChange={(e) => onChange({ signatureLabel: e.target.value })}
            placeholder="Authorized Signatory / Peer Reviewer"
            className="flex-1 px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-slate-500">Align:</span>
          <div className="inline-flex items-center rounded border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => onChange({ align: 'left' })}
              title="Align Left"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'left' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'center' })}
              title="Align Center"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'center' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'right' })}
              title="Align Right"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'right' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editable Fields: Signatory Name, Role/Designation, Organization, Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label htmlFor={`sig-name-${block.id}`} className="block text-[11px] font-medium text-slate-500">
            Signatory Name:
          </label>
          <input
            id={`sig-name-${block.id}`}
            type="text"
            value={block.signatoryName}
            onChange={(e) => onChange({ signatoryName: e.target.value })}
            placeholder="Full Legal Name"
            className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`sig-desig-${block.id}`} className="block text-[11px] font-medium text-slate-500">
            Designation / Role:
          </label>
          <input
            id={`sig-desig-${block.id}`}
            type="text"
            value={block.designation}
            onChange={(e) => onChange({ designation: e.target.value })}
            placeholder="e.g. Principal Systems Architect"
            className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`sig-org-${block.id}`} className="block text-[11px] font-medium text-slate-500">
            Organization / Department:
          </label>
          <input
            id={`sig-org-${block.id}`}
            type="text"
            value={block.organization || ''}
            onChange={(e) => onChange({ organization: e.target.value })}
            placeholder="e.g. Core Architecture Group"
            className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`sig-date-${block.id}`} className="block text-[11px] font-medium text-slate-500">
            Sign-off Date:
          </label>
          <input
            id={`sig-date-${block.id}`}
            type="date"
            value={block.date || ''}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs text-slate-800 font-mono tabular-nums bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* Formal Visual Signing Preview Layout */}
      <div className="pt-3 border-t border-slate-100">
        <div className={`w-72 max-w-full space-y-1.5 ${alignContainerClass}`}>
          <div className="h-9 border-b border-slate-400 flex items-end pb-1 px-1">
            <span className="text-sm italic font-serif text-slate-700 tracking-wide select-none">
              {block.signatoryName || 'Signature Line'}
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-800">
            {block.signatoryName || 'Signatory Name'}
          </div>

          <div className="text-[11px] text-slate-600">
            {block.designation || 'Designation'}
            {block.organization ? ` · ${block.organization}` : ''}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>{block.signatureLabel || 'Authorized Signatory'}</span>
            <span className="font-mono tabular-nums">
              {block.date ? `Date: ${block.date}` : 'Date: ________'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
