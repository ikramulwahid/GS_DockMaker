import React from 'react';
import {
  Heading,
  AlignLeft,
  List,
  Sigma,
  Table as TableIcon,
  Image as ImageIcon,
  SeparatorHorizontal,
  PenTool,
  SlidersHorizontal,
  LucideIcon,
} from 'lucide-react';
import {
  DocumentBlockItem,
  HeadingBlockData,
  ParagraphBlockData,
  ListBlockData,
  FormulaBlockData,
  MetadataBlockData,
  TableBlockData,
  ImageBlockData,
  PageBreakBlockData,
  SignatureBlockData,
} from '../types/document';
import { BlockToolbar } from './BlockToolbar';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { ListBlock } from './blocks/ListBlock';
import { FormulaBlock } from './blocks/FormulaBlock';
import { MetadataBlock } from './blocks/MetadataBlock';
import { TableBlock } from './blocks/TableBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { PageBreakBlock } from './blocks/PageBreakBlock';
import { SignatureBlock } from './blocks/SignatureBlock';

interface BlockRendererProps {
  block: DocumentBlockItem;
  blockIndex: number;
  totalBlocks: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updatedData: Partial<DocumentBlockItem>, isTyping?: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSaveSnippet?: () => void;
  displayNumber?: string;
}

export function BlockRenderer({
  block,
  blockIndex,
  totalBlocks,
  isSelected,
  onSelect,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSaveSnippet,
  displayNumber,
}: BlockRendererProps) {
  const getBlockMeta = (): { label: string; icon: LucideIcon } => {
    switch (block.type) {
      case 'heading':
        return { label: `Heading (${block.level.toUpperCase()})`, icon: Heading };
      case 'paragraph':
        return { label: 'Paragraph', icon: AlignLeft };
      case 'list':
        return { label: `List (${block.style})`, icon: List };
      case 'formula':
        return { label: 'Formula (LaTeX)', icon: Sigma };
      case 'metadata':
        return { label: 'Metadata Block', icon: SlidersHorizontal };
      case 'table':
        return { label: 'Table Grid', icon: TableIcon };
      case 'image':
        return { label: 'Image Block', icon: ImageIcon };
      case 'page-break':
        return { label: 'Page Break', icon: SeparatorHorizontal };
      case 'signature':
        return { label: 'Signature Line', icon: PenTool };
    }
  };

  const { label, icon } = getBlockMeta();
  const formattedIndex = String(blockIndex + 1).padStart(2, '0');

  const renderContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <HeadingBlock
            block={block as HeadingBlockData}
            displayNumber={displayNumber}
            onChange={(data) => {
              const isTyping = 'text' in data;
              onUpdate(data, isTyping);
            }}
          />
        );
      case 'paragraph':
        return (
          <ParagraphBlock
            block={block as ParagraphBlockData}
            onChange={(data) => {
              const isTyping = 'text' in data;
              onUpdate(data, isTyping);
            }}
          />
        );
      case 'list':
        return (
          <ListBlock
            block={block as ListBlockData}
            onChange={(data) => onUpdate(data, false)}
          />
        );
      case 'formula':
        return (
          <FormulaBlock
            block={block as FormulaBlockData}
            onChange={(data) => {
              const isTyping = 'latex' in data;
              onUpdate(data, isTyping);
            }}
          />
        );
      case 'metadata':
        return (
          <MetadataBlock
            block={block as MetadataBlockData}
            onChange={(data) => onUpdate(data, false)}
          />
        );
      case 'table':
        return (
          <TableBlock
            block={block as TableBlockData}
            onChange={(data) => onUpdate(data, false)}
          />
        );
      case 'image':
        return (
          <ImageBlock
            block={block as ImageBlockData}
            onChange={(data) => onUpdate(data, false)}
          />
        );
      case 'page-break':
        return (
          <PageBreakBlock
            block={block as PageBreakBlockData}
            onChange={(data) => onUpdate(data, false)}
          />
        );
      case 'signature':
        return (
          <SignatureBlock
            block={block as SignatureBlockData}
            onChange={(data) => onUpdate(data, false)}
          />
        );
    }
  };

  return (
    <article
      onClick={onSelect}
      className={`group relative bg-white border rounded-md transition-all ${
        isSelected
          ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <BlockToolbar
        typeLabel={label}
        icon={icon}
        blockIndex={formattedIndex}
        isSelected={isSelected}
        isFirst={blockIndex === 0}
        isLast={blockIndex === totalBlocks - 1}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onSaveSnippet={onSaveSnippet}
      />

      <div className="p-3.5">{renderContent()}</div>
    </article>
  );
}
