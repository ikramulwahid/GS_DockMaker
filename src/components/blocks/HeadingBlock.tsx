import React, { useRef } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Code,
  Hash,
} from 'lucide-react';
import { HeadingBlockData, HeadingLevel } from '../../types/document';
import {
  applyInlineWrapToInput,
  handleFormattingKeyboardShortcut,
} from '../../utils/textFormatting';

interface HeadingBlockProps {
  block: HeadingBlockData;
  displayNumber?: string;
  onChange: (updated: Partial<HeadingBlockData>) => void;
}

export function HeadingBlock({ block, displayNumber, onChange }: HeadingBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const align = block.align || 'left';
  const isExcluded =
    block.excludeFromNumbering === true || block.numberingOverride === 'unnumbered';

  const levelStyles: Record<HeadingLevel, { textClass: string; spacingClass: string; badgeLabel: string }> = {
    h1: {
      textClass: 'text-lg font-bold tracking-tight text-slate-900',
      spacingClass: 'pt-1 pb-1',
      badgeLabel: 'H1',
    },
    h2: {
      textClass: 'text-base font-semibold tracking-tight text-slate-900',
      spacingClass: 'pt-0.5 pb-0.5',
      badgeLabel: 'H2',
    },
    h3: {
      textClass: 'text-sm font-semibold tracking-tight text-slate-800',
      spacingClass: 'pt-0 pb-0.5',
      badgeLabel: 'H3',
    },
    h4: {
      textClass: 'text-xs font-semibold tracking-tight text-slate-800 uppercase',
      spacingClass: 'pt-0 pb-0.5',
      badgeLabel: 'H4',
    },
    h5: {
      textClass: 'text-xs font-medium tracking-tight text-slate-700 italic',
      spacingClass: 'pt-0 pb-0.5',
      badgeLabel: 'H5',
    },
    h6: {
      textClass: 'text-xs font-normal tracking-tight text-slate-600',
      spacingClass: 'pt-0 pb-0.5',
      badgeLabel: 'H6',
    },
  };

  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const applyFormat = (prefix: string, suffix: string, placeholder = 'text') => {
    const input = inputRef.current;
    if (!input) return;

    const result = applyInlineWrapToInput(input, block.text, prefix, suffix, placeholder);
    onChange({ text: result.updatedText });

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (handleFormattingKeyboardShortcut(e, block.text, (newText) => onChange({ text: newText }))) {
      return;
    }
  };

  const toggleNumberingOverride = () => {
    if (isExcluded) {
      onChange({ excludeFromNumbering: false, numberingOverride: 'default' });
    } else {
      onChange({ excludeFromNumbering: true, numberingOverride: 'unnumbered' });
    }
  };

  return (
    <div className={`space-y-2.5 ${levelStyles[block.level]?.spacingClass || ''}`}>
      {/* Level, Style & Alignment Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Level:</span>
            <div className="inline-flex items-center rounded border border-slate-200 bg-slate-50 p-0.5 text-xs">
              {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as HeadingLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChange({ level: lvl })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    block.level === lvl
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quick inline formatting */}
          <div className="inline-flex items-center rounded border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => applyFormat('**', '**', 'bold')}
              title="Bold (Ctrl+B)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*', 'italic')}
              title="Italic (Ctrl+I)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('`', '`', 'code')}
              title="Code (`code`)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Per-heading Numbering Override Toggle */}
          <button
            type="button"
            onClick={toggleNumberingOverride}
            title={
              isExcluded
                ? 'Heading is excluded from numbering (Click to include)'
                : 'Heading is included in automatic numbering (Click to make unnumbered)'
            }
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium transition-colors cursor-pointer ${
              isExcluded
                ? 'bg-amber-50/80 border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Hash className="w-3 h-3" />
            <span>{isExcluded ? 'Unnumbered' : 'Numbered'}</span>
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-slate-500">Align:</span>
          <div className="inline-flex items-center rounded border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => onChange({ align: 'left' })}
              title="Align Left"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'left' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'center' })}
              title="Align Center"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'center' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'right' })}
              title="Align Right"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'right' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editable Heading Text with Optional Display Number Indicator */}
      <div className="relative flex items-center">
        {displayNumber && !isExcluded && (
          <span
            className="inline-flex items-center px-2 py-0.5 mr-2 rounded bg-blue-50 text-blue-700 font-mono text-xs font-semibold shrink-0 select-none border border-blue-100"
            title="Auto-calculated heading display number (not serialized into text)"
          >
            {displayNumber}
          </span>
        )}
        {isExcluded && (
          <span
            className="inline-flex items-center px-1.5 py-0.5 mr-2 rounded bg-amber-50 text-amber-700 font-sans text-[10px] font-medium shrink-0 select-none border border-amber-200"
            title="Excluded from hierarchical numbering"
          >
            Unnumbered
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Enter section title..."
          className={`w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition-colors ${
            levelStyles[block.level]?.textClass || 'text-base font-semibold text-slate-900'
          } ${alignClass}`}
        />
      </div>
    </div>
  );
}
