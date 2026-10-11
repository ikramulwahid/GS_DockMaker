import React, { useMemo, useRef } from 'react';
import katex from 'katex';
import { AlertCircle, Eye, Code } from 'lucide-react';
import { FormulaBlockData } from '../../types/document';

interface FormulaBlockProps {
  block: FormulaBlockData;
  onChange: (updated: Partial<FormulaBlockData>) => void;
}

export function FormulaBlock({ block, onChange }: FormulaBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayMode = block.displayMode !== false; // default true

  // Safely render LaTeX using KaTeX
  const { renderedHtml, renderError } = useMemo(() => {
    if (!block.latex || !block.latex.trim()) {
      return { renderedHtml: '', renderError: null };
    }
    try {
      const html = katex.renderToString(block.latex, {
        displayMode: displayMode,
        throwOnError: true,
        output: 'htmlAndMathml',
      });
      return { renderedHtml: html, renderError: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid LaTeX syntax';
      return { renderedHtml: '', renderError: message };
    }
  }, [block.latex, displayMode]);

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({ latex: (block.latex ? `${block.latex} ` : '') + snippet });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const original = block.latex || '';

    const updated = original.slice(0, start) + snippet + original.slice(end);
    onChange({ latex: updated });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };

  const mathSnippets = [
    { label: 'a/b', snippet: '\\frac{a}{b}', title: 'Fraction' },
    { label: 'x²', snippet: 'x^{2}', title: 'Exponent' },
    { label: 'xᵢ', snippet: 'x_{i}', title: 'Subscript' },
    { label: '√x', snippet: '\\sqrt{x}', title: 'Square Root' },
    { label: '∑', snippet: '\\sum_{i=1}^{n} x_i', title: 'Summation' },
    { label: '∫', snippet: '\\int_{a}^{b} f(x)\\,dx', title: 'Definite Integral' },
    { label: 'α', snippet: '\\alpha', title: 'Alpha' },
    { label: 'β', snippet: '\\beta', title: 'Beta' },
    { label: 'θ', snippet: '\\theta', title: 'Theta' },
    { label: '±', snippet: '\\pm', title: 'Plus-Minus' },
    { label: '≤', snippet: '\\le', title: 'Less Than or Equal' },
    { label: '≥', snippet: '\\ge', title: 'Greater Than or Equal' },
  ];

  return (
    <div className="space-y-3">
      {/* Source input & options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Code className="w-3.5 h-3.5 text-slate-400" />
            <span>LaTeX Source:</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Display mode toggle */}
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={displayMode}
                onChange={(e) => onChange({ displayMode: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Display Style</span>
            </label>

            {/* Equation Number */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-medium">Eq #:</span>
              <input
                type="text"
                value={block.equationNumber || ''}
                onChange={(e) => onChange({ equationNumber: e.target.value })}
                placeholder="1.1"
                className="w-16 px-1.5 py-0.5 font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded text-center focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Quick math template chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mr-0.5">
            Insert:
          </span>
          {mathSnippets.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => insertSnippet(item.snippet)}
              title={item.title}
              className="px-1.5 py-0.5 text-[11px] font-mono text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded transition-colors cursor-pointer shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={block.latex}
          onChange={(e) => onChange({ latex: e.target.value })}
          placeholder="e.g. \int_{a}^{b} f(x)\,dx = F(b) - F(a)"
          rows={2}
          className="w-full px-2.5 py-1.5 font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition-colors"
        />
      </div>

      {/* Rendered Mathematical Preview */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>Typeset Math Preview:</span>
        </div>

        {renderError ? (
          <div className="p-3 bg-red-50/70 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              <div className="font-semibold text-red-800">LaTeX Compilation Error</div>
              <div className="font-mono text-[11px] break-all leading-tight">{renderError}</div>
              <div className="text-[10px] text-red-600">
                Original source is preserved. Check your LaTeX tags or brackets.
              </div>
            </div>
          </div>
        ) : block.latex.trim() ? (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between gap-4 overflow-x-auto min-h-[52px]">
            <div
              className="flex-1 text-center py-1 overflow-x-auto text-slate-900"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
            {block.equationNumber && (
              <span className="text-xs font-mono tabular-nums text-slate-500 select-none shrink-0 pl-2">
                ({block.equationNumber})
              </span>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50/50 border border-dashed border-slate-200 rounded text-center text-xs text-slate-400 italic">
            Enter LaTeX syntax above or click snippet chips to insert formulas
          </div>
        )}
      </div>
    </div>
  );
}
