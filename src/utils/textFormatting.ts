import React from 'react';

/**
 * Standard utility to apply or toggle inline markdown/html tags to an input or textarea element.
 */
export function applyInlineWrapToInput(
  input: HTMLInputElement | HTMLTextAreaElement,
  currentValue: string,
  prefix: string,
  suffix: string,
  placeholder = 'text'
): { updatedText: string; newSelectionStart: number; newSelectionEnd: number } {
  const start = input.selectionStart ?? currentValue.length;
  const end = input.selectionEnd ?? currentValue.length;

  if (start === end) {
    // No text selected: insert prefix + placeholder + suffix
    const inserted = `${prefix}${placeholder}${suffix}`;
    const updated = currentValue.slice(0, start) + inserted + currentValue.slice(end);
    return {
      updatedText: updated,
      newSelectionStart: start + prefix.length,
      newSelectionEnd: start + prefix.length + placeholder.length,
    };
  }

  const selected = currentValue.slice(start, end);

  // Check if selection is already surrounded by prefix and suffix, if so, toggle/unwrap
  const beforeSlice = currentValue.slice(Math.max(0, start - prefix.length), start);
  const afterSlice = currentValue.slice(end, end + suffix.length);
  if (beforeSlice === prefix && afterSlice === suffix) {
    const unwrapped =
      currentValue.slice(0, start - prefix.length) +
      selected +
      currentValue.slice(end + suffix.length);
    return {
      updatedText: unwrapped,
      newSelectionStart: start - prefix.length,
      newSelectionEnd: end - prefix.length,
    };
  }

  const updated = currentValue.slice(0, start) + prefix + selected + suffix + currentValue.slice(end);
  return {
    updatedText: updated,
    newSelectionStart: start + prefix.length,
    newSelectionEnd: end + prefix.length,
  };
}

/**
 * Helper to handle common formatting keyboard shortcuts (Ctrl/Cmd+B, Ctrl/Cmd+I, Ctrl/Cmd+U, Ctrl/Cmd+`)
 */
export function handleFormattingKeyboardShortcut(
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  currentValue: string,
  onChange: (val: string) => void
): boolean {
  const isModifier = e.ctrlKey || e.metaKey;
  if (!isModifier) return false;

  const key = e.key.toLowerCase();
  const target = e.currentTarget;

  if (key === 'b') {
    e.preventDefault();
    const result = applyInlineWrapToInput(target, currentValue, '**', '**', 'bold');
    onChange(result.updatedText);
    setTimeout(() => {
      target.focus();
      target.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
    }, 0);
    return true;
  }

  if (key === 'i') {
    e.preventDefault();
    const result = applyInlineWrapToInput(target, currentValue, '*', '*', 'italic');
    onChange(result.updatedText);
    setTimeout(() => {
      target.focus();
      target.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
    }, 0);
    return true;
  }

  if (key === 'u') {
    e.preventDefault();
    const result = applyInlineWrapToInput(target, currentValue, '<u>', '</u>', 'underlined');
    onChange(result.updatedText);
    setTimeout(() => {
      target.focus();
      target.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
    }, 0);
    return true;
  }

  if (key === '`') {
    e.preventDefault();
    const result = applyInlineWrapToInput(target, currentValue, '`', '`', 'code');
    onChange(result.updatedText);
    setTimeout(() => {
      target.focus();
      target.setSelectionRange(result.newSelectionStart, result.newSelectionEnd);
    }, 0);
    return true;
  }

  return false;
}
