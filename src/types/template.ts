import { DocumentModel, DocumentBlockItem } from './document';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Technical' | 'Business' | 'Academic' | 'Reports' | 'General';
  isBuiltIn: boolean;
  createdAt: string;
  document: DocumentModel;
}

export interface BlockSnippet {
  id: string;
  name: string;
  description: string;
  category: 'Signatures' | 'Legal & Notices' | 'Tables' | 'Metadata' | 'Formulas' | 'Content';
  isBuiltIn: boolean;
  createdAt: string;
  block: DocumentBlockItem;
}
