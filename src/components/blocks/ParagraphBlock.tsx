import React, { useRef } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Eraser,
} from 'lucide-react';
import { ParagraphBlockData, TextAlignment } from '../../types/document';
import {
  applyInlineWrapToInput,
  handleFormattingKeyboardShortcut,
} from '../../utils/textFormatting';

interface ParagraphBlockProps {
  block: ParagraphBlockData;
  onChange: (updated: Partial<ParagraphBlockData>) => void;
}

export function ParagraphBlock({ block, onChange }: ParagraphBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const align = block.align || 'left';

  const alignClasses: Record<TextAlignment, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const applyInlineWrap = (prefix: string, suffix: string, placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const result = applyInlineWrapToInput(textarea, block.text, prefix, suffix, placeholder);
    onChange({ text: result.updatedText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
    }, 0);
  };

  const handleClearFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      // Clean entire paragraph of markdown markers
      const cleaned = block.text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/<u>(.*?)<\/u>/g, '$1')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/==(.*? vampires)?==/g, '$1')
        .replace(/==(.*?)==/g, '$1');
      onChange({ text: cleaned });
      return;
    }

    const selected = block.text.slice(start, end);
    const cleanedSelected = selected
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/<u>(.*?)<\/u>/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/==(.*?)==/g, '$1');

    const updated = block.text.slice(0, start) + cleanedSelected + block.text.slice(end);
    onChange({ text: updated });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + cleanedSelected.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check standard Ctrl/Cmd+B, Ctrl/Cmd+I, Ctrl/Cmd+U, Ctrl/Cmd+`
    if (handleFormattingKeyboardShortcut(e, block.text, (newText) => onChange({ text: newText }))) {
      return;
    }
  };

  return (
    <div className="space-y-2">
      {/* Mini formatting bar: Bold, Italic, Underline, Strike, Code, Highlight + Alignment */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Inline formatting buttons */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-slate-500 mr-0.5">Style:</span>
          <div className="inline-flex items-center rounded border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => applyInlineWrap('**', '**', 'bold')}
              title="Bold (Ctrl+B)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineWrap('*', '*', 'italic')}
              title="Italic (Ctrl+I)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineWrap('<u>', '</u>', 'underlined')}
              title="Underline (Ctrl+U)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineWrap('~~', '~~', 'strikethrough')}
              title="Strikethrough (~~text~~)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineWrap('`', '`', 'code')}
              title="Inline Code (`code`)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyInlineWrap('==', '==', 'highlight')}
              title="Highlight (==text==)"
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClearFormatting}
              title="Clear formatting"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer ml-0.5 border-l border-slate-200"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Alignment controls */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-slate-500 mr-0.5">Align:</span>
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
            <button
              type="button"
              onClick={() => onChange({ align: 'justify' })}
              title="Justify"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'justify' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Multiline textarea with line wrapping and line breaks */}
      <textarea
        ref={textareaRef}
        value={block.text}
        onChange={(e) => onChange({ text: e.target.value })}
        onKeyDown={handleKeyDown}
        placeholder="Enter paragraph text..."
        rows={4}
        className={`w-full px-2.5 py-2 text-xs text-slate-800 leading-relaxed bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition-colors resize-y font-sans ${
          alignClasses[align]
        }`}
      />

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>Supports multi-line text &amp; inline formatting (Ctrl+B, Ctrl+I, Ctrl+U)</span>
        <span className="font-mono tabular-nums">
          {block.text.length} chars · {block.text.trim().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  );
}
