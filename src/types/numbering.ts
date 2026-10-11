export type HeadingNumberingStyle =
  | 'off'
  | 'decimal' // 1, 1.1, 1.1.1
  | 'decimal-period' // 1., 1.1., 1.1.1.
  | 'parenthesized' // (1), (1.1), (1.1.1)
  | 'roman' // I, I.1, I.1.1, II
  | 'alphabetical'; // A, A.1, A.1.1, B

export interface HeadingNumberingSettings {
  enabled: boolean;
  style: HeadingNumberingStyle;
  startNumber: number; // default 1
  maxLevel: number; // 1 to 6 (e.g. 3 means number h1, h2, h3 only)
}

export const DEFAULT_HEADING_NUMBERING_SETTINGS: HeadingNumberingSettings = {
  enabled: false,
  style: 'decimal',
  startNumber: 1,
  maxLevel: 6,
};
