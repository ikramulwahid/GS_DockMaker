/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TitleBar } from './components/TitleBar';
import { SidebarPanel } from './components/SidebarPanel';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { RecoveryBanner } from './components/RecoveryBanner';
import { TemplateModal } from './components/TemplateModal';
import { SaveTemplateModal } from './components/SaveTemplateModal';
import { SnippetLibraryModal } from './components/SnippetLibraryModal';
import { SaveSnippetModal } from './components/SaveSnippetModal';
import {
  DocumentModel,
  DocumentBlockItem,
  DocumentMetadata,
  BlockType,
} from './types/document';
import { DocumentTemplate, BlockSnippet } from './types/template';
import {
  createInitialDocument,
  createDefaultBlock,
  cloneBlockWithNewId,
} from './utils/documentModel';
import {
  serializeDocument,
  triggerFileDownload,
  sanitizeFilename,
} from './services/documentSerializer';
import { validateNativeDocument } from './services/documentValidator';
import {
  saveLocalDocument,
  loadLocalDocument,
  saveRecoverySnapshot,
  loadRecoverySnapshot,
  clearRecoverySnapshot,
  RecoveryMeta,
} from './services/documentPersistence';
import {
  saveUserTemplate,
  saveUserSnippet,
  instantiateTemplate,
  instantiateSnippet,
} from './services/templateService';
import { exportDocumentToPdf } from './services/pdfExportService';
import { useDocumentHistory } from './utils/useDocumentHistory';
import { calculateHeadingNumbers, buildDocumentOutline } from './utils/headingNumbering';

export default function App() {
  // Check if there is an unsaved recovery snapshot available on startup
  const [recoveryData, setRecoveryData] = useState<{
    document: DocumentModel;
    meta: RecoveryMeta;
  } | null>(() => {
    const snapshot = loadRecoverySnapshot();
    // Only offer recovery if the snapshot wasn't a clean saved file
    if (snapshot && !snapshot.meta.cleanSaved) {
      return snapshot;
    }
    return null;
  });

  // Initialize with persisted document or default demonstration document
  const initialDoc = useRef<DocumentModel>(
    loadLocalDocument() || createInitialDocument()
  ).current;

  // Integrated Undo/Redo history manager
  const {
    document,
    setDocument,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDocumentHistory<DocumentModel>(initialDoc);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(() => {
    return document.blocks[0]?.id || null;
  });

  // State to trigger preview scrolling to a targeted heading when clicked in Outline
  const [targetPreviewHeadingId, setTargetPreviewHeadingId] = useState<string | null>(null);

  // Compute hierarchical heading numbers dynamically
  const headingNumbers = useMemo(() => {
    return calculateHeadingNumbers(document.blocks, document.metadata.headingNumbering);
  }, [document.blocks, document.metadata.headingNumbering]);

  // Compute outline tree dynamically
  const documentOutline = useMemo(() => {
    return buildDocumentOutline(document.blocks, document.metadata.headingNumbering);
  }, [document.blocks, document.metadata.headingNumbering]);

  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hidden native file input ref for opening .document.json files
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isSnippetLibraryOpen, setIsSnippetLibraryOpen] = useState(false);
  const [snippetBlockToSave, setSnippetBlockToSave] = useState<DocumentBlockItem | null>(null);

  // Navigate to heading in both editor and preview
  const handleNavigateToHeading = useCallback((headingId: string) => {
    setSelectedBlockId(headingId);
    setTargetPreviewHeadingId(headingId);

    // Scroll editor to target block
    const editorEl = window.document.getElementById(`editor-block-${headingId}`);
    if (editorEl) {
      editorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Unsaved changes confirmation modal state
  const [pendingAction, setPendingAction] = useState<
    | { type: 'new' }
    | { type: 'template'; template: DocumentTemplate }
    | { type: 'open'; file: File }
    | null
  >(null);

  // Helper to add toast notifications
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto-persist local document on change and record recovery snapshot
  useEffect(() => {
    saveLocalDocument(document);

    // Save recovery snapshot with debouncing for dirty work
    const timer = setTimeout(() => {
      saveRecoverySnapshot(document, !isModified);
    }, 500);

    return () => clearTimeout(timer);
  }, [document, isModified]);

  // Warn user on window unload/tab close if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isModified) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes that will be lost.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModified]);

  // Document metadata update
  const handleUpdateMetadata = (updated: Partial<DocumentMetadata>) => {
    setDocument((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...updated,
      },
    }), 'metadata');
    setIsModified(true);
  };

  // Block updates with typing coalescing
  const handleUpdateBlock = (
    id: string,
    updated: Partial<DocumentBlockItem>,
    isTyping: boolean = false
  ) => {
    const coalesceKey = isTyping ? `block-typing-${id}` : undefined;
    setDocument((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === id ? ({ ...block, ...updated } as DocumentBlockItem) : block
      ),
    }), coalesceKey);
    setIsModified(true);
  };

  // Block movement
  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    setDocument((prev) => {
      const index = prev.blocks.findIndex((b) => b.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.blocks.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const newBlocks = [...prev.blocks];
      const [moved] = newBlocks.splice(index, 1);
      newBlocks.splice(targetIndex, 0, moved);

      return {
        ...prev,
        blocks: newBlocks,
      };
    });
    setIsModified(true);
  };

  // Block duplication
  const handleDuplicateBlock = (id: string) => {
    setDocument((prev) => {
      const index = prev.blocks.findIndex((b) => b.id === id);
      if (index === -1) return prev;
      const target = prev.blocks[index];
      const duplicated = cloneBlockWithNewId(target);
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, duplicated);

      setSelectedBlockId(duplicated.id);

      return {
        ...prev,
        blocks: newBlocks,
      };
    });
    setIsModified(true);
  };

  // Block deletion
  const handleDeleteBlock = (id: string) => {
    setDocument((prev) => {
      const filtered = prev.blocks.filter((b) => b.id !== id);
      if (selectedBlockId === id) {
        const nextSelected = filtered.length > 0 ? filtered[0].id : null;
        setSelectedBlockId(nextSelected);
      }
      return {
        ...prev,
        blocks: filtered,
      };
    });
    setIsModified(true);
  };

  // Block insertion
  const handleInsertBlock = (type: BlockType, afterId?: string | null) => {
    const newBlock = createDefaultBlock(type);
    setDocument((prev) => {
      if (!afterId) {
        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
        };
      }
      const index = prev.blocks.findIndex((b) => b.id === afterId);
      if (index === -1) {
        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
        };
      }
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return {
        ...prev,
        blocks: newBlocks,
      };
    });
    setSelectedBlockId(newBlock.id);
    setIsInsertMenuOpen(false);
    setIsModified(true);
  };

  // Execute Save Native File (.document.json)
  const handlePerformSave = (): boolean => {
    try {
      const serialized = serializeDocument(document);
      const filename = `${sanitizeFilename(document.metadata.title, 'Document')}.document.json`;
      triggerFileDownload(serialized, filename, 'application/json');
      setIsModified(false);
      // Mark recovery snapshot as cleanly saved
      saveRecoverySnapshot(document, true);
      addToast('success', 'Document Saved', `Downloaded ${filename} successfully.`);
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      addToast('error', 'Save Failed', 'An error occurred while serializing the document.');
      return false;
    }
  };

  // Apply a selected template
  const applyTemplate = (template: DocumentTemplate) => {
    const freshDoc = instantiateTemplate(template);
    resetHistory(freshDoc);
    setSelectedBlockId(freshDoc.blocks[0]?.id || null);
    setIsModified(false);
    clearRecoverySnapshot();
    setRecoveryData(null);
    addToast('success', 'Template Applied', `"${template.name}" loaded (${freshDoc.blocks.length} blocks).`);
  };

  // Execute New Document Creation
  const handlePerformNew = () => {
    const freshDoc = createInitialDocument();
    resetHistory(freshDoc);
    setSelectedBlockId(freshDoc.blocks[0]?.id || null);
    setIsModified(false);
    clearRecoverySnapshot();
    setRecoveryData(null);
    addToast('info', 'New Document Created', 'Initialized with a fresh document specification.');
  };

  // Request New Document (opens template selection modal)
  const handleRequestNew = () => {
    setIsTemplateModalOpen(true);
  };

  // User selects template from template picker
  const handleSelectTemplate = (template: DocumentTemplate) => {
    if (isModified) {
      setPendingAction({ type: 'template', template });
    } else {
      applyTemplate(template);
    }
  };

  // User selects blank document from template picker
  const handleSelectBlank = () => {
    if (isModified) {
      setPendingAction({ type: 'new' });
    } else {
      handlePerformNew();
    }
  };

  // Save current document as custom reusable template
  const handleSaveCurrentAsTemplate = (
    templateData: Omit<DocumentTemplate, 'id' | 'isBuiltIn' | 'createdAt'>
  ) => {
    saveUserTemplate(templateData);
    addToast('success', 'Template Saved', `"${templateData.name}" has been saved to your custom templates library.`);
  };

  // Insert reusable snippet from library into editor
  const handleInsertSnippet = (snippet: BlockSnippet) => {
    const newBlock = instantiateSnippet(snippet);
    setDocument((prev) => {
      if (!selectedBlockId) {
        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
        };
      }
      const index = prev.blocks.findIndex((b) => b.id === selectedBlockId);
      if (index === -1) {
        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
        };
      }
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      return {
        ...prev,
        blocks: newBlocks,
      };
    });
    setSelectedBlockId(newBlock.id);
    setIsModified(true);
    addToast('success', 'Snippet Inserted', `Added "${snippet.name}" to document.`);
  };

  // Save a block as reusable snippet in library
  const handleSaveBlockAsSnippet = (
    snippetData: Omit<BlockSnippet, 'id' | 'isBuiltIn' | 'createdAt'>
  ) => {
    saveUserSnippet(snippetData);
    addToast('success', 'Snippet Saved', `"${snippetData.name}" added to Reusable Snippet Library.`);
  };

  // Request Open Document (opens native browser file dialog)
  const handleRequestOpen = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // File chosen from native file dialog
  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isModified) {
      setPendingAction({ type: 'open', file });
    } else {
      processOpenFile(file);
    }
  };

  // Process and validate imported JSON file
  const processOpenFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateNativeDocument(parsed);

        if (!result.isValid || !result.document) {
          addToast(
            'error',
            'Cannot Open Document',
            result.error || 'The file is corrupted or not a valid Document Studio native file.'
          );
          return;
        }

        resetHistory(result.document);
        setSelectedBlockId(result.document.blocks[0]?.id || null);
        setIsModified(false);
        clearRecoverySnapshot();
        setRecoveryData(null);
        addToast(
          'success',
          'Document Opened',
          `"${result.document.metadata.title}" loaded successfully (${result.document.blocks.length} blocks).`
        );
      } catch (err) {
        addToast(
          'error',
          'File Read Error',
          'Could not parse file as JSON. Please ensure it is a valid Document Studio file.'
        );
      }
    };

    reader.onerror = () => {
      addToast('error', 'File Read Error', 'Failed to read the selected file from disk.');
    };

    reader.readAsText(file);
  };

  // Recovery handling
  const handleRestoreRecovery = () => {
    if (!recoveryData) return;
    resetHistory(recoveryData.document);
    setSelectedBlockId(recoveryData.document.blocks[0]?.id || null);
    setIsModified(true); // it was uncommitted work
    setRecoveryData(null);
    addToast('success', 'Session Restored', 'Recovered unsaved document snapshot from prior session.');
  };

  const handleDismissRecovery = () => {
    clearRecoverySnapshot();
    setRecoveryData(null);
    addToast('info', 'Recovery Discarded', 'Previous autosaved snapshot removed.');
  };

  // Unsaved changes modal actions
  const handleModalSaveAndProceed = () => {
    const saved = handlePerformSave();
    if (saved && pendingAction) {
      if (pendingAction.type === 'new') {
        handlePerformNew();
      } else if (pendingAction.type === 'template') {
        applyTemplate(pendingAction.template);
      } else if (pendingAction.type === 'open') {
        processOpenFile(pendingAction.file);
      }
    }
    setPendingAction(null);
  };

  const handleModalDiscardAndProceed = () => {
    if (pendingAction) {
      if (pendingAction.type === 'new') {
        handlePerformNew();
      } else if (pendingAction.type === 'template') {
        applyTemplate(pendingAction.template);
      } else if (pendingAction.type === 'open') {
        processOpenFile(pendingAction.file);
      }
    }
    setPendingAction(null);
  };

  const handleModalCancel = () => {
    setPendingAction(null);
  };

  // Export PDF Action
  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    addToast('info', 'Generating PDF', 'Typesetting pages and preparing print-grade PDF layout...');

    try {
      await exportDocumentToPdf(document);
      addToast('success', 'PDF Export Complete', 'Your document PDF has been downloaded.');
    } catch (err) {
      console.error('PDF Export Error:', err);
      addToast(
        'error',
        'Export Failed',
        'Failed to generate PDF. Check if remote images or formulas caused an error.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Global Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Check if user is typing inside an input/textarea/editable element
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // 1. Undo: Ctrl+Z (or Cmd+Z) without Shift
      if (modKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        // If not in input, or if user wants document undo
        if (!isInput) {
          e.preventDefault();
          if (canUndo) {
            undo();
            setIsModified(true);
            addToast('info', 'Undo', 'Reverted document change.');
          }
        }
        return;
      }

      // 2. Redo: Ctrl+Shift+Z or Ctrl+Y (Cmd+Shift+Z on Mac)
      if (
        (modKey && e.shiftKey && e.key.toLowerCase() === 'z') ||
        (modKey && e.key.toLowerCase() === 'y')
      ) {
        if (!isInput) {
          e.preventDefault();
          if (canRedo) {
            redo();
            setIsModified(true);
            addToast('info', 'Redo', 'Reapplied document change.');
          }
        }
        return;
      }

      // 3. Save: Ctrl+S / Cmd+S
      if (modKey && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handlePerformSave();
        return;
      }

      // 4. New Document: Ctrl+Alt+N / Cmd+Alt+N
      if (modKey && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleRequestNew();
        return;
      }

      // 5. Open File: Ctrl+O / Cmd+O
      if (modKey && !e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleRequestOpen();
        return;
      }

      // 6. Export PDF: Ctrl+Shift+E / Cmd+Shift+E
      if (modKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportPdf();
        return;
      }

      // 7. Add Block menu: Ctrl+Alt+B / Cmd+Alt+B
      if (modKey && e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsInsertMenuOpen((v) => !v);
        return;
      }

      // 8. Keyboard Shortcuts Modal: Ctrl+/ or Cmd+/
      if (modKey && e.key === '/') {
        e.preventDefault();
        setIsShortcutsModalOpen((v) => !v);
        return;
      }

      // 9. Block Navigation (Alt + Arrow Up / Down) when not typing
      if (!isInput && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const currentIndex = document.blocks.findIndex((b) => b.id === selectedBlockId);
        if (currentIndex === -1 && document.blocks.length > 0) {
          setSelectedBlockId(document.blocks[0].id);
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          setSelectedBlockId(document.blocks[currentIndex - 1].id);
        } else if (e.key === 'ArrowDown' && currentIndex < document.blocks.length - 1) {
          setSelectedBlockId(document.blocks[currentIndex + 1].id);
        }
        return;
      }

      // 10. Reorder Block: Ctrl+Shift+ArrowUp / Down
      if (!isInput && modKey && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        if (selectedBlockId) {
          e.preventDefault();
          handleMoveBlock(selectedBlockId, e.key === 'ArrowUp' ? 'up' : 'down');
        }
        return;
      }

      // 11. Duplicate Block: Ctrl+Shift+D
      if (!isInput && modKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        if (selectedBlockId) {
          e.preventDefault();
          handleDuplicateBlock(selectedBlockId);
        }
        return;
      }

      // 12. Delete Block: Ctrl+Shift+Backspace or Ctrl+Shift+Delete
      if (!isInput && modKey && e.shiftKey && (e.key === 'Backspace' || e.key === 'Delete')) {
        if (selectedBlockId) {
          e.preventDefault();
          handleDeleteBlock(selectedBlockId);
        }
        return;
      }

      // 13. Close modals on Escape
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
        if (isInsertMenuOpen) setIsInsertMenuOpen(false);
        if (isTemplateModalOpen) setIsTemplateModalOpen(false);
        if (isSaveTemplateModalOpen) setIsSaveTemplateModalOpen(false);
        if (isSnippetLibraryOpen) setIsSnippetLibraryOpen(false);
        if (snippetBlockToSave) setSnippetBlockToSave(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    canUndo,
    canRedo,
    undo,
    redo,
    document.blocks,
    selectedBlockId,
    isShortcutsModalOpen,
    isInsertMenuOpen,
    isTemplateModalOpen,
    isSaveTemplateModalOpen,
    isSnippetLibraryOpen,
    snippetBlockToSave,
    isModified,
  ]);

  return (
    <div className="h-screen w-full min-w-[960px] overflow-hidden flex flex-col bg-white text-slate-900">
      {/* Hidden file input for native Open file dialog */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChosen}
        className="hidden"
      />

      {/* Fixed-height Top Title Bar */}
      <TitleBar
        onNew={handleRequestNew}
        onOpen={handleRequestOpen}
        onSave={handlePerformSave}
        onExport={handleExportPdf}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        isExporting={isExporting}
        isModified={isModified}
      />

      {/* Recovery Banner if unsaved session exists */}
      {recoveryData && (
        <RecoveryBanner
          meta={recoveryData.meta}
          onRestore={handleRestoreRecovery}
          onDismiss={handleDismissRecovery}
        />
      )}

      {/* Three-Column Workspace in exact 20% : 35% : 45% proportions */}
      <main className="flex-1 min-h-0 w-full grid grid-cols-[20%_35%_45%] overflow-hidden">
        {/* Left Column (20%) */}
        <SidebarPanel
          metadata={document.metadata}
          onUpdateMetadata={handleUpdateMetadata}
          onInsertBlock={() => setIsInsertMenuOpen(true)}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          onOpenSnippetLibrary={() => setIsSnippetLibraryOpen(true)}
          outline={documentOutline}
          selectedBlockId={selectedBlockId}
          onNavigateToHeading={handleNavigateToHeading}
        />

        {/* Middle Column (35%) */}
        <EditorPanel
          blocks={document.blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={(id) => setSelectedBlockId(id)}
          onUpdateBlock={handleUpdateBlock}
          onMoveBlock={handleMoveBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onDeleteBlock={handleDeleteBlock}
          onInsertBlock={handleInsertBlock}
          isInsertMenuOpen={isInsertMenuOpen}
          onToggleInsertMenu={() => setIsInsertMenuOpen((v) => !v)}
          onCloseInsertMenu={() => setIsInsertMenuOpen(false)}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onSaveSnippet={(block) => setSnippetBlockToSave(block)}
          onOpenSnippetLibrary={() => setIsSnippetLibraryOpen(true)}
          headingNumbers={headingNumbers}
        />

        {/* Right Column (45%) — Live Paginated Document Preview */}
        <PreviewPanel
          document={document}
          headingNumbers={headingNumbers}
          targetHeadingId={targetPreviewHeadingId}
        />
      </main>

      {/* Template Selection Dialog */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onSelectBlank={handleSelectBlank}
        onOpenSaveCurrentModal={() => setIsSaveTemplateModalOpen(true)}
      />

      {/* Save Document as Template Dialog */}
      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        document={document}
        onSave={handleSaveCurrentAsTemplate}
      />

      {/* Reusable Content Block Snippet Library Dialog */}
      <SnippetLibraryModal
        isOpen={isSnippetLibraryOpen}
        onClose={() => setIsSnippetLibraryOpen(false)}
        onInsertSnippet={handleInsertSnippet}
      />

      {/* Save Block to Snippet Library Dialog */}
      <SaveSnippetModal
        isOpen={Boolean(snippetBlockToSave)}
        onClose={() => setSnippetBlockToSave(null)}
        block={snippetBlockToSave}
        onSave={handleSaveBlockAsSnippet}
      />

      {/* Unsaved changes prompt dialog */}
      <UnsavedChangesModal
        isOpen={Boolean(pendingAction)}
        actionTitle={
          pendingAction?.type === 'new'
            ? 'create a blank document'
            : pendingAction?.type === 'template'
            ? `apply template "${pendingAction.template.name}"`
            : 'open another document'
        }
        onSave={handleModalSaveAndProceed}
        onDiscard={handleModalDiscardAndProceed}
        onCancel={handleModalCancel}
      />

      {/* Keyboard Shortcuts Reference Dialog */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Toast Feedback notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
