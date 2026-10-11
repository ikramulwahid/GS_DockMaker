import { DocumentBlockItem, HeadingBlockData, HeadingLevel } from '../types/document';
import { HeadingNumberingSettings } from '../types/numbering';

export interface OutlineItem {
  id: string;
  level: HeadingLevel;
  levelNumber: number; // 1 to 6
  text: string;
  displayNumber?: string;
  isExcluded: boolean;
  blockIndex: number;
}

/**
 * Converts a positive number to Roman numerals (1 -> I, 2 -> II, 4 -> IV, etc.)
 */
export function toRomanNumeral(num: number): string {
  if (num <= 0) return String(num);
  const romanMap: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let result = '';
  let n = num;
  for (const [val, sym] of romanMap) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result;
}

/**
 * Converts a positive 1-based index to alphabetical string (1 -> A, 2 -> B, 26 -> Z, 27 -> AA)
 */
export function toAlphabetical(num: number): string {
  if (num <= 0) return String(num);
  let result = '';
  let n = num;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

/**
 * Formats a hierarchical counter array into the configured presentation format.
 * E.g. [1, 2, 1] with style 'decimal' -> '1.2.1'
 * [1, 2, 1] with style 'decimal-period' -> '1.2.1.'
 * [1, 2, 1] with style 'parenthesized' -> '(1.2.1)'
 * [1, 2, 1] with style 'roman' -> 'I.2.1'
 * [1, 2, 1] with style 'alphabetical' -> 'A.2.1'
 */
export function formatHeadingCounters(
  counters: number[],
  settings: HeadingNumberingSettings
): string {
  if (counters.length === 0) return '';

  const { style } = settings;

  if (style === 'off' || !settings.enabled) {
    return '';
  }

  // Format top-level prefix
  const topVal = counters[0];
  let topFormatted: string;
  if (style === 'roman') {
    topFormatted = toRomanNumeral(topVal);
  } else if (style === 'alphabetical') {
    topFormatted = toAlphabetical(topVal);
  } else {
    topFormatted = String(topVal);
  }

  // Subordinate levels are always standard decimal
  let body: string;
  if (counters.length === 1) {
    body = topFormatted;
  } else {
    const subParts = counters.slice(1).map((c) => String(c));
    body = [topFormatted, ...subParts].join('.');
  }

  if (style === 'decimal-period') {
    return `${body}.`;
  }
  if (style === 'parenthesized') {
    return `(${body})`;
  }

  return body;
}

/**
 * Maps heading level string 'h1'-'h6' to numeric 1-6.
 */
export function getHeadingLevelNumber(level: HeadingLevel): number {
  switch (level) {
    case 'h1':
      return 1;
    case 'h2':
      return 2;
    case 'h3':
      return 3;
    case 'h4':
      return 4;
    case 'h5':
      return 5;
    case 'h6':
      return 6;
    default:
      return 2;
  }
}

/**
 * Calculates hierarchical heading display numbers for all heading blocks in the document.
 * Returns a map of blockId -> calculated display number (e.g. "1.1", "II.3", etc.).
 *
 * Rules:
 * - Counters at levels 1..6
 * - Starts top-level at settings.startNumber (default 1)
 * - Heading of level L resets counters at all deeper levels (L+1 .. 6)
 * - Excluded headings (override or level > maxLevel) do not increment counters and receive no number.
 * - Handles skipped levels gracefully (e.g. H1 followed immediately by H3 assigns 1.0.1 or increments subordinate level).
 */
export function calculateHeadingNumbers(
  blocks: DocumentBlockItem[],
  settings?: HeadingNumberingSettings
): Map<string, string> {
  const result = new Map<string, string>();
  if (!settings || !settings.enabled || settings.style === 'off') {
    return result;
  }

  const startNum = typeof settings.startNumber === 'number' && settings.startNumber > 0
    ? Math.floor(settings.startNumber)
    : 1;
  const maxLvl = typeof settings.maxLevel === 'number' ? settings.maxLevel : 6;

  // 6 levels of counters: index 0 is H1, index 5 is H6
  const counters: number[] = [startNum - 1, 0, 0, 0, 0, 0];
  let hasEncounteredTopLevel = false;

  for (const block of blocks) {
    if (block.type !== 'heading') continue;

    const heading = block as HeadingBlockData;
    const lvlNum = getHeadingLevelNumber(heading.level);

    // Check if excluded: explicit override or beyond maxLevel
    const isExcluded =
      heading.excludeFromNumbering === true ||
      heading.numberingOverride === 'unnumbered' ||
      lvlNum > maxLvl;

    if (isExcluded) {
      continue;
    }

    // Heading participating in numbering
    if (lvlNum === 1) {
      counters[0] += 1;
      // Reset subordinate counters
      for (let i = 1; i < 6; i++) {
        counters[i] = 0;
      }
      hasEncounteredTopLevel = true;
    } else {
      // If we encounter a sub-heading before any H1, initialize H1 counter
      if (!hasEncounteredTopLevel) {
        counters[0] = startNum;
        hasEncounteredTopLevel = true;
      }

      // If skipped levels (e.g. H1 then H3 directly), ensure intermediate counters are at least 1
      for (let i = 1; i < lvlNum - 1; i++) {
        if (counters[i] === 0) {
          counters[i] = 1;
        }
      }

      // Increment current level counter
      counters[lvlNum - 1] += 1;

      // Reset deeper levels
      for (let i = lvlNum; i < 6; i++) {
        counters[i] = 0;
      }
    }

    const activeCounters = counters.slice(0, lvlNum);
    const formatted = formatHeadingCounters(activeCounters, settings);
    result.set(heading.id, formatted);
  }

  return result;
}

/**
 * Builds a structured document outline array from the document blocks.
 * Used for the Outline navigation tree.
 */
export function buildDocumentOutline(
  blocks: DocumentBlockItem[],
  settings?: HeadingNumberingSettings
): OutlineItem[] {
  const numberMap = calculateHeadingNumbers(blocks, settings);
  const outline: OutlineItem[] = [];

  blocks.forEach((block, index) => {
    if (block.type !== 'heading') return;

    const heading = block as HeadingBlockData;
    const lvlNum = getHeadingLevelNumber(heading.level);
    const isExcluded =
      heading.excludeFromNumbering === true ||
      heading.numberingOverride === 'unnumbered' ||
      (settings?.enabled && lvlNum > (settings.maxLevel ?? 6));

    const displayNumber = numberMap.get(heading.id);

    outline.push({
      id: heading.id,
      level: heading.level,
      levelNumber: lvlNum,
      text: heading.text || 'Untitled Heading',
      displayNumber,
      isExcluded: Boolean(isExcluded),
      blockIndex: index,
    });
  });

  return outline;
}
