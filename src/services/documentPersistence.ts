import { DocumentModel } from '../types/document';
import { serializeDocument } from './documentSerializer';
import { validateNativeDocument } from './documentValidator';

const AUTOSAVE_STORAGE_KEY = 'document_studio_autosave_v1';
const RECOVERY_SNAPSHOT_KEY = 'document_studio_recovery_snapshot_v1';
const RECOVERY_META_KEY = 'document_studio_recovery_meta_v1';

export interface RecoveryMeta {
  timestamp: number;
  title: string;
  blockCount: number;
  cleanSaved: boolean; // true if saved to file, false if dirty/uncommitted
}

/**
 * Standard local persistence (keeps latest state cached across page reloads)
 */
export function saveLocalDocument(document: DocumentModel): boolean {
  try {
    const serialized = serializeDocument(document);
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
    return false;
  }
}

export function loadLocalDocument(): DocumentModel | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = validateNativeDocument(parsed);
    if (result.isValid && result.document) {
      return result.document;
    }
    return null;
  } catch (err) {
    console.warn('LocalStorage load failed:', err);
    return null;
  }
}

export function clearLocalDocument(): void {
  try {
    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
  } catch {
    // Ignore error
  }
}

/**
 * Dedicated Crash & Recovery Snapshot Storage
 * Stores a separate recovery snapshot with metadata and timestamp
 */
export function saveRecoverySnapshot(document: DocumentModel, isCleanSaved: boolean = false): boolean {
  try {
    const serialized = serializeDocument(document);
    localStorage.setItem(RECOVERY_SNAPSHOT_KEY, serialized);
    const meta: RecoveryMeta = {
      timestamp: Date.now(),
      title: document.metadata.title || 'Untitled Document',
      blockCount: document.blocks.length,
      cleanSaved: isCleanSaved,
    };
    localStorage.setItem(RECOVERY_META_KEY, JSON.stringify(meta));
    return true;
  } catch (err) {
    console.warn('Autosave recovery snapshot failed:', err);
    return false;
  }
}

export function getRecoverySnapshotMeta(): RecoveryMeta | null {
  try {
    const raw = localStorage.getItem(RECOVERY_META_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RecoveryMeta;
  } catch {
    return null;
  }
}

export function loadRecoverySnapshot(): { document: DocumentModel; meta: RecoveryMeta } | null {
  try {
    const rawMeta = localStorage.getItem(RECOVERY_META_KEY);
    const rawDoc = localStorage.getItem(RECOVERY_SNAPSHOT_KEY);
    if (!rawMeta || !rawDoc) return null;

    const meta = JSON.parse(rawMeta) as RecoveryMeta;
    const parsed = JSON.parse(rawDoc);
    const result = validateNativeDocument(parsed);

    if (result.isValid && result.document) {
      return { document: result.document, meta };
    }
    return null;
  } catch (err) {
    console.warn('Failed loading recovery snapshot:', err);
    return null;
  }
}

export function clearRecoverySnapshot(): void {
  try {
    localStorage.removeItem(RECOVERY_SNAPSHOT_KEY);
    localStorage.removeItem(RECOVERY_META_KEY);
  } catch {
    // Ignore error
  }
}
