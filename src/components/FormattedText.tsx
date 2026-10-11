import React from 'react';

interface FormattedTextProps {
  text: string | undefined | null;
  className?: string;
}

/**
 * Robust formatted text component that parses inline formatting tokens:
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Underline: <u>text</u>
 * - Strikethrough: ~~text~~
 * - Inline Code: `text`
 * - Highlight: ==text== or <mark>text</mark>
 * - Line breaks: \n rendered as <br />
 */
export function FormattedText({ text, className }: FormattedTextProps) {
  if (!text) return null;

  // Split lines on newline characters to preserve deliberate line breaks
  const lines = text.split('\n');

  return (
    <span className={className}>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {parseInlineFormatting(line)}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
}

/**
 * Recursively parses inline formatting tokens so combinations like
 * `**bold and _italic_**` or `<u>underlined **bold**</u>` work predictably.
 */
function parseInlineFormatting(str: string): React.ReactNode[] {
  if (!str) return [];

  // Match token pairs: **bold**, __bold__, *italic*, _italic_, <u>underline</u>, ~~strike~~, `code`, ==highlight==, <mark>highlight</mark>
  const tokenRegex = /(\*\*.*?\*\*|__.*?__|(?<!\*)\*(?!\*).*?(?<!\*)\*(?!\*)|(?<!_)_(?!_).*?(?<!_)_(?!_)|<u>.*?<\/u>|~~.*?~~|`.*?`|==.*?==|<mark>.*?<\/mark>)/g;
  const parts = str.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold (**text** or __text__)
    if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
        (part.startsWith('__') && part.endsWith('__') && part.length >= 4)) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {parseInlineFormatting(inner)}
        </strong>
      );
    }

    // Italic (*text* or _text_)
    if ((part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length >= 2)) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-slate-800">
          {parseInlineFormatting(inner)}
        </em>
      );
    }

    // Underline (<u>text</u>)
    if (part.startsWith('<u>') && part.endsWith('</u>') && part.length >= 7) {
      const inner = part.slice(3, -4);
      return (
        <span key={idx} className="underline decoration-slate-400 underline-offset-2">
          {parseInlineFormatting(inner)}
        </span>
      );
    }

    // Strikethrough (~~text~~)
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <span key={idx} className="line-through text-slate-500">
          {parseInlineFormatting(inner)}
        </span>
      );
    }

    // Inline Code (`text`)
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1 py-0.5 mx-0.5 bg-slate-100 text-slate-800 font-mono text-[11px] rounded border border-slate-200"
        >
          {inner}
        </code>
      );
    }

    // Highlight (==text== or <mark>text</mark>)
    if ((part.startsWith('==') && part.endsWith('==') && part.length >= 4) ||
        (part.startsWith('<mark>') && part.endsWith('</mark>') && part.length >= 13)) {
      const inner = part.startsWith('==') ? part.slice(2, -2) : part.slice(6, -7);
      return (
        <mark key={idx} className="bg-yellow-100 text-slate-900 px-0.5 py-0.2 rounded font-medium">
          {parseInlineFormatting(inner)}
        </mark>
      );
    }

    return part;
  });
}
