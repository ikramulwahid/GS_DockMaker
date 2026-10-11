import { DocumentMetadata, DocumentBlockItem } from './document';

export const DOCUMENT_STUDIO_FORMAT_ID = 'document-studio-native';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Native File Format for Document Studio (.document.json)
 */
export interface NativeDocumentFile {
  format: typeof DOCUMENT_STUDIO_FORMAT_ID;
  version: number;
  createdAt: string;
  updatedAt: string;
  metadata: DocumentMetadata;
  blocks: DocumentBlockItem[];
}
