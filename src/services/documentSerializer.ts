import { DocumentModel } from '../types/document';
import {
  NativeDocumentFile,
  DOCUMENT_STUDIO_FORMAT_ID,
  CURRENT_SCHEMA_VERSION,
} from '../types/nativeDocument';

/**
 * Sanitizes a title for safe cross-platform filesystem filenames.
 */
export function sanitizeFilename(title: string, defaultName: string = 'Untitled_Document'): string {
  if (!title || !title.trim()) return defaultName;
  // Replace illegal filename characters with underscores
  const cleaned = title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
  return cleaned.slice(0, 100) || defaultName;
}

/**
 * Serializes the authoritative document model into the versioned native format.
 */
export function serializeDocument(document: DocumentModel): string {
  const fileData: NativeDocumentFile = {
    format: DOCUMENT_STUDIO_FORMAT_ID,
    version: CURRENT_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: { ...document.metadata },
    blocks: document.blocks.map((b) => ({ ...b })),
  };

  return JSON.stringify(fileData, null, 2);
}

/**
 * Triggers a browser download of the serialized document JSON file.
 */
export function triggerFileDownload(
  content: string,
  filename: string,
  mimeType: string = 'application/json'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  window.document.body.appendChild(anchor);
  anchor.click();
  window.document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
