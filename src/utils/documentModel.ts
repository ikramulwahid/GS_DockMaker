import { DocumentModel, DocumentBlockItem, BlockType, ListItemData } from '../types/document';

let idCounter = 1;

export function generateBlockId(prefix: string = 'blk'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}

export function normalizeListItems(items: (string | ListItemData)[]): ListItemData[] {
  return items.map((item) => {
    if (typeof item === 'string') {
      return { id: generateBlockId('item'), text: item, indent: 0 };
    }
    return item;
  });
}

export function createDefaultBlock(type: BlockType): DocumentBlockItem {
  const id = generateBlockId(type);
  switch (type) {
    case 'heading':
      return {
        id,
        type: 'heading',
        level: 'h2',
        text: 'New Section Heading',
        align: 'left',
      };
    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        text: 'Enter your paragraph text here. This block supports multi-line content with natural text wrapping and text alignment options.',
        align: 'left',
      };
    case 'list':
      return {
        id,
        type: 'list',
        style: 'bullet',
        items: [
          { id: generateBlockId('item'), text: 'First list item', indent: 0 },
          { id: generateBlockId('item'), text: 'Second list item', indent: 0 },
        ],
      };
    case 'formula':
      return {
        id,
        type: 'formula',
        latex: 'E = mc^2',
        equationNumber: '1.1',
        displayMode: true,
      };
    case 'metadata':
      return {
        id,
        type: 'metadata',
        title: 'Document Attributes',
        style: 'table',
        rows: [
          { id: generateBlockId('row'), label: 'Document ID', value: 'DOC-2026-001' },
          { id: generateBlockId('row'), label: 'Department', value: 'Systems Architecture' },
          { id: generateBlockId('row'), label: 'Classification', value: 'Internal / Confidential' },
          { id: generateBlockId('row'), label: 'Reference Number', value: 'REF-ARCH-409' },
        ],
      };
    case 'table':
      return {
        id,
        type: 'table',
        caption: 'Performance Metric Summary',
        headers: ['Metric', 'Target Threshold'],
        rows: [
          ['Throughput (req/s)', '10,000'],
          ['Latency (p99)', '< 20 ms'],
        ],
        columnAlignments: ['left', 'right'],
        headerStyle: 'default',
      };
    case 'image':
      return {
        id,
        type: 'image',
        caption: 'System Component Diagram',
        altText: 'Schematic illustrating high-level architecture',
        url: '',
        widthPercent: 100,
        align: 'center',
      };
    case 'page-break':
      return {
        id,
        type: 'page-break',
        label: 'Page Break',
      };
    case 'signature':
      return {
        id,
        type: 'signature',
        signatoryName: 'Elena Rostova',
        designation: 'Principal Systems Architect',
        organization: 'Core Architecture Group',
        signatureLabel: 'Authorized Signatory',
        date: '2026-10-09',
        align: 'left',
      };
  }
}

export function createInitialDocument(): DocumentModel {
  return {
    metadata: {
      title: 'Q4 Infrastructure Architecture Specification',
      author: 'Elena Rostova, Principal Systems Architect',
      date: '2026-10-09',
      documentType: 'technical-report',
      pageSize: 'A4',
      pageOrientation: 'Portrait',
      pageMargins: 'Standard',
      headingNumbering: {
        enabled: true,
        style: 'decimal',
        startNumber: 1,
        maxLevel: 6,
      },
    },
    blocks: [
      {
        id: generateBlockId('head'),
        type: 'heading',
        level: 'h1',
        text: 'Project Overview',
        align: 'left',
      },
      {
        id: generateBlockId('para'),
        type: 'paragraph',
        text: 'This technical specification outlines the multi-region consensus architecture and deterministic failover protocols scheduled for fourth-quarter deployment. The objective is to maintain sub-millisecond read availability while enforcing strict transactional serializability across distributed storage nodes.',
        align: 'left',
      },
      {
        id: generateBlockId('head'),
        type: 'heading',
        level: 'h2',
        text: 'System Objectives & Principles',
        align: 'left',
      },
      {
        id: generateBlockId('list'),
        type: 'list',
        style: 'bullet',
        items: [
          {
            id: generateBlockId('item'),
            text: 'Automated quorum rebalancing across three primary availability zones with zero manual intervention.',
            indent: 0,
          },
          {
            id: generateBlockId('item'),
            text: 'Cryptographic ledger verification for every cross-region state snapshot prior to replication commit.',
            indent: 0,
          },
          {
            id: generateBlockId('item'),
            text: 'Deterministic rollback execution if consensus divergence exceeds threshold.',
            indent: 1,
          },
        ],
      },
      {
        id: generateBlockId('meta'),
        type: 'metadata',
        title: 'Specification Attributes',
        style: 'table',
        rows: [
          { id: generateBlockId('row'), label: 'Document ID', value: 'ARCH-SPEC-2026-Q4' },
          { id: generateBlockId('row'), label: 'Department', value: 'Core Systems Engineering' },
          { id: generateBlockId('row'), label: 'Classification', value: 'Internal Restricted' },
          { id: generateBlockId('row'), label: 'Reference Number', value: 'RFC-4091-B' },
        ],
      },
      {
        id: generateBlockId('head'),
        type: 'heading',
        level: 'h2',
        text: 'Performance Formulation & Thresholds',
        align: 'left',
      },
      {
        id: generateBlockId('form'),
        type: 'formula',
        latex: 'L(q) = \\tau_{net} + \\max(t_{commit}) + \\sum (w_i \\cdot \\delta_{sync})',
        equationNumber: '1.1',
        displayMode: true,
      },
      {
        id: generateBlockId('tbl'),
        type: 'table',
        caption: 'Table 1.1 — Consensus Performance Thresholds',
        headers: ['System Metric', 'Target Threshold'],
        rows: [
          ['Replication Latency (p99)', '14.2 ms'],
          ['Failover Recovery Window', '< 250 ms'],
        ],
        columnAlignments: ['left', 'right'],
        headerStyle: 'default',
      },
      {
        id: generateBlockId('img'),
        type: 'image',
        caption: 'Figure 1.1 — Multi-Region Consensus Topology Diagram',
        altText: 'Diagram of replication rings and quorum availability zones',
        url: '',
        widthPercent: 100,
        align: 'center',
      },
      {
        id: generateBlockId('pb'),
        type: 'page-break',
        label: 'End of Section 1',
      },
      {
        id: generateBlockId('head'),
        type: 'heading',
        level: 'h1',
        text: 'Verification & Architectural Sign-Off',
        align: 'left',
      },
      {
        id: generateBlockId('sig'),
        type: 'signature',
        signatoryName: 'Elena Rostova',
        designation: 'Principal Systems Architect',
        organization: 'Core Architecture Group',
        signatureLabel: 'Authorized Signatory',
        date: '2026-10-09',
        align: 'left',
      },
    ],
  };
}

export function cloneBlockWithNewId(block: DocumentBlockItem): DocumentBlockItem {
  const newId = generateBlockId(block.type);
  if (block.type === 'metadata') {
    return {
      ...block,
      id: newId,
      rows: block.rows.map((r) => ({
        ...r,
        id: generateBlockId('row'),
      })),
    };
  }
  if (block.type === 'list') {
    const norm = normalizeListItems(block.items);
    return {
      ...block,
      id: newId,
      items: norm.map((it) => ({
        ...it,
        id: generateBlockId('item'),
      })),
    };
  }
  if (block.type === 'table') {
    return {
      ...block,
      id: newId,
      headers: [...block.headers],
      rows: block.rows.map((row) => [...row]),
      columnAlignments: block.columnAlignments ? [...block.columnAlignments] : undefined,
    };
  }
  return {
    ...block,
    id: newId,
  };
}
