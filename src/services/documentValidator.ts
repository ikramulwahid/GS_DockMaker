import { DocumentModel, DocumentBlockItem } from '../types/document';
import {
  NativeDocumentFile,
  DOCUMENT_STUDIO_FORMAT_ID,
  CURRENT_SCHEMA_VERSION,
} from '../types/nativeDocument';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  document?: DocumentModel;
}

const VALID_BLOCK_TYPES = new Set([
  'heading',
  'paragraph',
  'list',
  'formula',
  'metadata',
  'table',
  'image',
  'page-break',
  'signature',
]);

const VALID_PAGE_SIZES = new Set(['A4', 'Letter', 'Legal', 'A5']);
const VALID_PAGE_ORIENTATIONS = new Set(['Portrait', 'Landscape']);
const VALID_PAGE_MARGINS = new Set(['Standard', 'Narrow', 'Wide', 'Academic']);

/**
 * Validates untrusted parsed JSON input against the Document Studio schema.
 */
export function validateNativeDocument(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Document data must be a valid JSON object.' };
  }

  const candidate = data as Partial<NativeDocumentFile>;

  // Check format identifier
  if (candidate.format !== DOCUMENT_STUDIO_FORMAT_ID) {
    return {
      isValid: false,
      error: `Invalid file format identifier. Expected "${DOCUMENT_STUDIO_FORMAT_ID}".`,
    };
  }

  // Check schema version
  if (typeof candidate.version !== 'number' || candidate.version > CURRENT_SCHEMA_VERSION) {
    return {
      isValid: false,
      error: `Unsupported schema version (${candidate.version}). Supported up to version ${CURRENT_SCHEMA_VERSION}.`,
    };
  }

  // Validate metadata
  const meta = candidate.metadata;
  if (!meta || typeof meta !== 'object') {
    return { isValid: false, error: 'Missing or invalid document metadata section.' };
  }

  if (typeof meta.title !== 'string') {
    return { isValid: false, error: 'Document title must be a string.' };
  }

  if (!VALID_PAGE_SIZES.has(meta.pageSize)) {
    return { isValid: false, error: `Invalid page size "${meta.pageSize}".` };
  }

  if (!VALID_PAGE_ORIENTATIONS.has(meta.pageOrientation)) {
    return { isValid: false, error: `Invalid page orientation "${meta.pageOrientation}".` };
  }

  if (!VALID_PAGE_MARGINS.has(meta.pageMargins)) {
    return { isValid: false, error: `Invalid page margins "${meta.pageMargins}".` };
  }

  // Validate blocks array
  if (!Array.isArray(candidate.blocks)) {
    return { isValid: false, error: 'Document blocks must be an array.' };
  }

  const seenIds = new Set<string>();
  const validatedBlocks: DocumentBlockItem[] = [];

  for (let i = 0; i < candidate.blocks.length; i++) {
    const block = candidate.blocks[i];
    if (!block || typeof block !== 'object') {
      return { isValid: false, error: `Block at index ${i} is not a valid object.` };
    }

    if (!block.id || typeof block.id !== 'string') {
      return { isValid: false, error: `Block at index ${i} has a missing or invalid ID.` };
    }

    if (seenIds.has(block.id)) {
      return { isValid: false, error: `Duplicate block ID detected: "${block.id}".` };
    }
    seenIds.add(block.id);

    if (!VALID_BLOCK_TYPES.has(block.type)) {
      return { isValid: false, error: `Unrecognized block type "${block.type}" at index ${i}.` };
    }

    // Block-type specific assertions
    if (block.type === 'heading') {
      if (typeof block.text !== 'string') {
        return { isValid: false, error: `Heading block "${block.id}" must contain string text.` };
      }
    } else if (block.type === 'paragraph') {
      if (typeof block.text !== 'string') {
        return { isValid: false, error: `Paragraph block "${block.id}" must contain string text.` };
      }
    } else if (block.type === 'list') {
      if (!Array.isArray(block.items)) {
        return { isValid: false, error: `List block "${block.id}" must contain an items array.` };
      }
    } else if (block.type === 'table') {
      if (!Array.isArray(block.headers) || !Array.isArray(block.rows)) {
        return { isValid: false, error: `Table block "${block.id}" headers and rows must be arrays.` };
      }
    }

    validatedBlocks.push(block as DocumentBlockItem);
  }

  return {
    isValid: true,
    document: {
      metadata: {
        title: meta.title || 'Untitled Document',
        author: meta.author || '',
        date: meta.date || new Date().toISOString().slice(0, 10),
        documentType: meta.documentType || 'technical-report',
        pageSize: meta.pageSize,
        pageOrientation: meta.pageOrientation,
        pageMargins: meta.pageMargins,
        headingNumbering: meta.headingNumbering
          ? {
              enabled: Boolean(meta.headingNumbering.enabled),
              style: meta.headingNumbering.style || 'decimal',
              startNumber: Number(meta.headingNumbering.startNumber) || 1,
              maxLevel: Number(meta.headingNumbering.maxLevel) || 6,
            }
          : undefined,
      },
      blocks: validatedBlocks,
    },
  };
}
