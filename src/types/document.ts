export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'formula'
  | 'metadata'
  | 'table'
  | 'image'
  | 'page-break'
  | 'signature';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

export interface HeadingBlockData extends BaseBlock {
  type: 'heading';
  level: HeadingLevel;
  text: string;
  align?: 'left' | 'center' | 'right';
  excludeFromNumbering?: boolean; // if true, unnumbered and doesn't increment sequence
  numberingOverride?: 'default' | 'unnumbered'; // explicit per-heading override
}

export interface ParagraphBlockData extends BaseBlock {
  type: 'paragraph';
  text: string;
  align?: TextAlignment;
}

export type ListStyle =
  | 'bullet'
  | 'dash'
  | 'arrow'
  | 'dot'
  | 'numbered'
  | 'alphabetical'
  | 'uppercase-alpha';

export interface ListItemData {
  id: string;
  text: string;
  indent: number; // 0, 1, 2
}

export interface ListBlockData extends BaseBlock {
  type: 'list';
  style: ListStyle;
  items: (string | ListItemData)[];
}

export interface FormulaBlockData extends BaseBlock {
  type: 'formula';
  latex: string;
  equationNumber?: string;
  displayMode?: boolean; // display/block vs inline
}

export interface MetadataRow {
  id: string;
  label: string;
  value: string;
}

export type MetadataStyle = 'table' | 'cards' | 'badges';

export interface MetadataBlockData extends BaseBlock {
  type: 'metadata';
  title?: string;
  style?: MetadataStyle;
  rows: MetadataRow[];
}

export type TableAlignment = 'left' | 'center' | 'right';

export interface TableBlockData extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
  columnAlignments?: TableAlignment[];
  headerStyle?: 'default' | 'accent' | 'minimal';
}

export interface ImageBlockData extends BaseBlock {
  type: 'image';
  caption: string;
  altText: string;
  url?: string;
  widthPercent: number; // 100, 75, 50, 33
  align?: 'left' | 'center' | 'right';
}

export interface PageBreakBlockData extends BaseBlock {
  type: 'page-break';
  label?: string;
}

export interface SignatureBlockData extends BaseBlock {
  type: 'signature';
  signatoryName: string;
  designation: string;
  organization?: string;
  signatureLabel?: string;
  date?: string;
  align?: 'left' | 'center' | 'right';
}

export type DocumentBlockItem =
  | HeadingBlockData
  | ParagraphBlockData
  | ListBlockData
  | FormulaBlockData
  | MetadataBlockData
  | TableBlockData
  | ImageBlockData
  | PageBreakBlockData
  | SignatureBlockData;

import { HeadingNumberingSettings } from './numbering';
export interface DocumentMetadata {
  title: string;
  author: string;
  date: string;
  documentType: string;
  pageSize: 'A4' | 'Letter' | 'Legal' | 'A5';
  pageOrientation: 'Portrait' | 'Landscape';
  pageMargins: 'Standard' | 'Narrow' | 'Wide' | 'Academic';
  headingNumbering?: HeadingNumberingSettings;
}

export interface DocumentModel {
  metadata: DocumentMetadata;
  blocks: DocumentBlockItem[];
}
