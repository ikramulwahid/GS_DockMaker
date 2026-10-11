import { DocumentModel, DocumentBlockItem } from '../types/document';
import { DocumentTemplate, BlockSnippet } from '../types/template';
import { generateBlockId, cloneBlockWithNewId } from '../utils/documentModel';

const USER_TEMPLATES_STORAGE_KEY = 'document_studio_user_templates_v1';
const USER_SNIPPETS_STORAGE_KEY = 'document_studio_user_snippets_v1';

// ==========================================
// BUILT-IN TEMPLATES
// ==========================================

export const BUILT_IN_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'builtin-tech-spec',
    name: 'Technical Specification',
    description: 'Engineering design doc with architecture overview, throughput formulas, hardware tier matrix, and approval signatures.',
    category: 'Technical',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    document: {
      metadata: {
        title: 'Distributed Event Pipeline Specification',
        author: 'Principal Systems Architect',
        date: new Date().toISOString().split('T')[0],
        documentType: 'Technical Specification',
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
          id: 'ts-b1',
          type: 'heading',
          level: 'h1',
          text: 'Distributed Event Pipeline Specification',
          align: 'left',
        },
        {
          id: 'ts-b2',
          type: 'metadata',
          title: 'Document Control & Release Record',
          style: 'table',
          rows: [
            { id: 'ts-r1', label: 'System Tier', value: 'Tier-1 Critical Infrastructure' },
            { id: 'ts-r2', label: 'Target Version', value: 'v2.4.0-Production' },
            { id: 'ts-r3', label: 'Security Classification', value: 'Internal Restricted' },
            { id: 'ts-r4', label: 'Review Cycle', value: 'Bi-weekly Architecture Board' },
          ],
        },
        {
          id: 'ts-b3',
          type: 'heading',
          level: 'h2',
          text: 'Executive Architecture Summary',
          align: 'left',
        },
        {
          id: 'ts-b4',
          type: 'paragraph',
          align: 'justify',
          text: 'This technical specification outlines the resilient microservices architecture for the next-generation distributed data pipeline. The system enforces sub-10ms p99 latency across cross-regional clusters while guaranteeing strict FIFO event sequencing and transactional idempotency under peak stress conditions.',
        },
        {
          id: 'ts-b5',
          type: 'heading',
          level: 'h2',
          text: 'Capacity & Throughput Formulation',
          align: 'left',
        },
        {
          id: 'ts-b6',
          type: 'paragraph',
          align: 'left',
          text: 'Buffer capacity and cluster partition concurrency are modeled following Little\'s Law and optimal queue distribution formulas:',
        },
        {
          id: 'ts-b7',
          type: 'formula',
          latex: 'L = \\lambda W \\implies N_{\\text{workers}} = \\left\\lceil \\frac{Q_{\\text{peak}} \\cdot T_{\\text{service}}}{C_{\\text{node}}} \\right\\rceil',
          equationNumber: '(1.1)',
          displayMode: true,
        },
        {
          id: 'ts-b8',
          type: 'heading',
          level: 'h2',
          text: 'Cluster Provisioning & Latency SLAs',
          align: 'left',
        },
        {
          id: 'ts-b9',
          type: 'table',
          caption: 'Table 1: Target deployment specifications and P99 latency commitments',
          headers: ['Component', 'Minimum Provision', 'Recommended Tier', 'Target P99'],
          columnAlignments: ['left', 'left', 'left', 'right'],
          headerStyle: 'accent',
          rows: [
            ['Ingress Gateway', '4 vCPU / 8 GB RAM', '8 vCPU / 16 GB NVMe', '< 4 ms'],
            ['Kafka Broker Cluster', '3x c6i.2xlarge Multi-AZ', '5x c6i.4xlarge Multi-AZ', '< 8 ms'],
            ['Schema Registry', '2 vCPU / 4 GB RAM', '4 vCPU / 8 GB RAM', '< 2 ms'],
            ['PostgreSQL Standby', '8 vCPU / 32 GB RAM', '16 vCPU / 64 GB NVMe', '< 12 ms'],
          ],
        },
        {
          id: 'ts-b10',
          type: 'heading',
          level: 'h2',
          text: 'Phased Deployment Plan',
          align: 'left',
        },
        {
          id: 'ts-b11',
          type: 'list',
          style: 'bullet',
          items: [
            { id: 'ts-l1', text: '**Stage 1: Canaries in staging environment** with 10% synthetic traffic generation', indent: 0 },
            { id: 'ts-l2', text: '**Stage 2: Gradual 25% traffic diversion** with continuous chaos engineering stress tests', indent: 0 },
            { id: 'ts-l3', text: '**Stage 3: Full regional multi-AZ cutover** and real-time observability verification', indent: 0 },
          ],
        },
        {
          id: 'ts-b12',
          type: 'signature',
          signatoryName: 'Marcus Sterling',
          designation: 'Principal Infrastructure Architect',
          organization: 'Cloud Platform Engineering Group',
          signatureLabel: 'Architecture Board Approval',
          date: new Date().toISOString().split('T')[0],
          align: 'left',
        },
      ],
    },
  },
  {
    id: 'builtin-biz-proposal',
    name: 'Business Proposal & Pitch',
    description: 'Executive project pitch with client metadata, scope deliverables, milestone budget table, and authorization signatures.',
    category: 'Business',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    document: {
      metadata: {
        title: 'Enterprise Digital Modernization Proposal',
        author: 'Strategic Solutions Advisory',
        date: new Date().toISOString().split('T')[0],
        documentType: 'Business Proposal',
        pageSize: 'Letter',
        pageOrientation: 'Portrait',
        pageMargins: 'Standard',
      },
      blocks: [
        {
          id: 'bp-b1',
          type: 'heading',
          level: 'h1',
          text: 'Enterprise Digital Modernization Proposal',
          align: 'left',
        },
        {
          id: 'bp-b2',
          type: 'metadata',
          title: 'Engagement & Client Details',
          style: 'cards',
          rows: [
            { id: 'bp-r1', label: 'Client Organization', value: 'Global Logistics Corp.' },
            { id: 'bp-r2', label: 'Engagement Lead', value: 'Strategic Advisory Practice' },
            { id: 'bp-r3', label: 'Duration', value: '6 Months (24 Sprints)' },
            { id: 'bp-r4', label: 'Proposal Validity', value: '30 Calendar Days' },
          ],
        },
        {
          id: 'bp-b3',
          type: 'heading',
          level: 'h2',
          text: 'Executive Summary',
          align: 'left',
        },
        {
          id: 'bp-b4',
          type: 'paragraph',
          align: 'justify',
          text: 'We are pleased to submit this strategic proposal to modernize Global Logistics Corp\'s legacy fulfillment platform. Our cloud-native architecture reduces operating expenditure by **38%** while scaling order processing throughput by **5x** ahead of peak holiday demand.',
        },
        {
          id: 'bp-b5',
          type: 'heading',
          level: 'h2',
          text: 'Strategic Objectives & Deliverables',
          align: 'left',
        },
        {
          id: 'bp-b6',
          type: 'list',
          style: 'bullet',
          items: [
            { id: 'bp-l1', text: '**Cloud-Native Containerization:** Migrate core workloads to managed Kubernetes with zero downtime', indent: 0 },
            { id: 'bp-l2', text: '**Real-Time Inventory Streaming:** Sub-second event sync between warehouse and ecommerce channels', indent: 0 },
            { id: 'bp-l3', text: '**Zero-Trust Security:** Strict mutual TLS, automated certificate rotation, and IAM least privilege', indent: 0 },
          ],
        },
        {
          id: 'bp-b7',
          type: 'heading',
          level: 'h2',
          text: 'Investment Schedule & Milestone Roadmap',
          align: 'left',
        },
        {
          id: 'bp-b8',
          type: 'table',
          caption: 'Table: Deliverable schedule and investment milestones',
          headers: ['Phase / Milestone', 'Key Deliverables', 'Timeline', 'Investment'],
          columnAlignments: ['left', 'left', 'center', 'right'],
          headerStyle: 'accent',
          rows: [
            ['Phase 1: Architecture Blueprint', 'Gap analysis, target design, security audit', 'Weeks 1–4', '$35,000'],
            ['Phase 2: Core Platform MVP', 'Microservices migration, automated CI/CD', 'Weeks 5–14', '$85,000'],
            ['Phase 3: Production Cutover', 'Scale validation, hypercare, staff enablement', 'Weeks 15–24', '$55,000'],
          ],
        },
        {
          id: 'bp-b9',
          type: 'paragraph',
          align: 'left',
          text: 'All phases include dedicated 24/7 post-launch hypercare support and comprehensive operational handoff documentation.',
        },
        {
          id: 'bp-b10',
          type: 'signature',
          signatoryName: 'Eleanor Vance',
          designation: 'Managing Partner, Enterprise Practice',
          organization: 'Apex Solutions Group LLC',
          signatureLabel: 'Authorized Representative Signature',
          date: new Date().toISOString().split('T')[0],
          align: 'left',
        },
      ],
    },
  },
  {
    id: 'builtin-meeting-minutes',
    name: 'Meeting Minutes & Status Report',
    description: 'Executive committee record with attendees metadata, agenda discussion points, decisions, and an action item accountability matrix.',
    category: 'Reports',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    document: {
      metadata: {
        title: 'Executive Committee Meeting Minutes',
        author: 'Executive Secretariat',
        date: new Date().toISOString().split('T')[0],
        documentType: 'Meeting Minutes',
        pageSize: 'A4',
        pageOrientation: 'Portrait',
        pageMargins: 'Standard',
      },
      blocks: [
        {
          id: 'mm-b1',
          type: 'heading',
          level: 'h1',
          text: 'Executive Committee Meeting Minutes',
          align: 'left',
        },
        {
          id: 'mm-b2',
          type: 'metadata',
          title: 'Session Information & Attendees',
          style: 'table',
          rows: [
            { id: 'mm-r1', label: 'Meeting Date & Time', value: `${new Date().toISOString().split('T')[0]} 10:00 AM UTC` },
            { id: 'mm-r2', label: 'Chairperson', value: 'Chief Technology Officer' },
            { id: 'mm-r3', label: 'Present Attendees', value: 'VP Engineering, Product Director, Lead Architect' },
            { id: 'mm-r4', label: 'Next Session', value: 'Alternate Tuesday, Same Time' },
          ],
        },
        {
          id: 'mm-b3',
          type: 'heading',
          level: 'h2',
          text: '1. Agenda & Key Discussion Topics',
          align: 'left',
        },
        {
          id: 'mm-b4',
          type: 'list',
          style: 'numbered',
          items: [
            { id: 'mm-l1', text: 'Review of Q3 product delivery roadmap and sprint velocity metrics', indent: 0 },
            { id: 'mm-l2', text: 'Infrastructure reliability retrospective and regional latency trends', indent: 0 },
            { id: 'mm-l3', text: 'Approval of budget allocation for cloud modernization initiatives', indent: 0 },
          ],
        },
        {
          id: 'mm-b5',
          type: 'heading',
          level: 'h2',
          text: '2. Formal Decisions & Resolutions',
          align: 'left',
        },
        {
          id: 'mm-b6',
          type: 'paragraph',
          align: 'justify',
          text: 'The committee unanimously approved the proposed Q4 infrastructure budget expansion. Teams are directed to complete staging performance benchmarks before the annual freeze date.',
        },
        {
          id: 'mm-b7',
          type: 'heading',
          level: 'h2',
          text: '3. Action Items & Accountability Matrix',
          align: 'left',
        },
        {
          id: 'mm-b8',
          type: 'table',
          caption: 'Table: Action items and ownership assignments',
          headers: ['Action ID', 'Task Description', 'Accountable Owner', 'Target Date', 'Status'],
          columnAlignments: ['left', 'left', 'left', 'center', 'right'],
          headerStyle: 'accent',
          rows: [
            ['ACT-101', 'Finalize multi-region disaster recovery runbook', 'DevOps Lead', 'Next Friday', 'In Progress'],
            ['ACT-102', 'Complete SOC2 compliance remediation audit', 'Security Officer', 'Oct 28', 'Pending Review'],
            ['ACT-103', 'Provision benchmark test environment', 'QA Lead', 'Nov 04', 'On Track'],
          ],
        },
        {
          id: 'mm-b9',
          type: 'signature',
          signatoryName: 'David K. Tanaka',
          designation: 'Committee Secretariat & Recording Officer',
          organization: 'Governance & Operations Directorate',
          signatureLabel: 'Minutes Certified By',
          date: new Date().toISOString().split('T')[0],
          align: 'left',
        },
      ],
    },
  },
  {
    id: 'builtin-research-paper',
    name: 'Academic Research Article',
    description: 'Scholarly document layout with formal abstract, mathematical theorem formulations, experimental validation table, and citations.',
    category: 'Academic',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    document: {
      metadata: {
        title: 'Stochastic Modeling of Non-Markovian Networks',
        author: 'Dr. Elena Rostova & Dr. Marcus Vance',
        date: new Date().toISOString().split('T')[0],
        documentType: 'Research Paper',
        pageSize: 'A4',
        pageOrientation: 'Portrait',
        pageMargins: 'Academic',
      },
      blocks: [
        {
          id: 'rp-b1',
          type: 'heading',
          level: 'h1',
          text: 'Stochastic Modeling of Non-Markovian Networks',
          align: 'center',
        },
        {
          id: 'rp-b2',
          type: 'paragraph',
          align: 'center',
          text: '*Institute for Computational Applied Mathematics & Network Sciences*',
        },
        {
          id: 'rp-b3',
          type: 'heading',
          level: 'h2',
          text: 'Abstract',
          align: 'left',
        },
        {
          id: 'rp-b4',
          type: 'paragraph',
          align: 'justify',
          text: 'We investigate the steady-state and transient dynamics of non-Markovian queueing topologies subjected to heavy-tailed arrival processes. Through rigorous analytical derivations verified by extensive numerical simulations, we formulate closed-form boundary approximations for queue length distributions under saturated operating regimes.',
        },
        {
          id: 'rp-b5',
          type: 'heading',
          level: 'h2',
          text: '1. Theoretical Framework & Governing Equations',
          align: 'left',
        },
        {
          id: 'rp-b6',
          type: 'paragraph',
          align: 'justify',
          text: 'Let \\(\\lambda\\) denote the mean arrival rate and \\(\\mu\\) represent the service capacity. The stationary distribution function \\(f(x)\\) satisfies the generalized integro-differential relation:',
        },
        {
          id: 'rp-b7',
          type: 'formula',
          latex: 'f(x) = \\frac{1}{\\sqrt{2\\pi \\sigma^2}} \\exp\\left( -\\frac{(x - \\mu)^2}{2\\sigma^2} \\right) + \\sum_{k=1}^{K} \\lambda_k e^{-\\alpha_k x}',
          equationNumber: '(2.4)',
          displayMode: true,
        },
        {
          id: 'rp-b8',
          type: 'heading',
          level: 'h2',
          text: '2. Numerical Results & Empirical Verification',
          align: 'left',
        },
        {
          id: 'rp-b9',
          type: 'table',
          caption: 'Table: Comparison between theoretical bounds and empirical Monte Carlo runs',
          headers: ['Traffic Load (ρ)', 'Analytical Bound', 'Empirical Mean', 'Variance Error'],
          columnAlignments: ['center', 'left', 'left', 'right'],
          headerStyle: 'minimal',
          rows: [
            ['0.30', '1.42 ± 0.04', '1.41 ± 0.03', '0.7%'],
            ['0.60', '4.15 ± 0.11', '4.12 ± 0.10', '0.7%'],
            ['0.85', '16.80 ± 0.35', '16.92 ± 0.32', '0.7%'],
            ['0.95', '72.30 ± 1.80', '71.95 ± 1.65', '0.5%'],
          ],
        },
        {
          id: 'rp-b10',
          type: 'signature',
          signatoryName: 'Dr. Elena Rostova',
          designation: 'Lead Investigator & Chair of Department',
          organization: 'National Laboratory for Applied Mathematics',
          signatureLabel: 'Peer-Review Verification',
          date: new Date().toISOString().split('T')[0],
          align: 'left',
        },
      ],
    },
  },
  {
    id: 'builtin-blank',
    name: 'Blank Document',
    description: 'Clean start with standard margins, default document settings, and an empty editable canvas.',
    category: 'General',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    document: {
      metadata: {
        title: 'Untitled Document',
        author: 'Author Name',
        date: new Date().toISOString().split('T')[0],
        documentType: 'General Document',
        pageSize: 'A4',
        pageOrientation: 'Portrait',
        pageMargins: 'Standard',
      },
      blocks: [
        {
          id: 'blank-b1',
          type: 'heading',
          level: 'h1',
          text: 'Untitled Document',
          align: 'left',
        },
        {
          id: 'blank-b2',
          type: 'paragraph',
          align: 'left',
          text: 'Start typing your document content here...',
        },
      ],
    },
  },
];

// ==========================================
// BUILT-IN BLOCK SNIPPETS
// ==========================================

export const BUILT_IN_SNIPPETS: BlockSnippet[] = [
  {
    id: 'snippet-confidentiality',
    name: 'Confidentiality & Legal Notice',
    description: 'Standard formal legal disclaimer paragraph with bold confidentiality terms.',
    category: 'Legal & Notices',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    block: {
      id: 'snip-legal-1',
      type: 'paragraph',
      align: 'justify',
      text: '**CONFIDENTIALITY & LEGAL NOTICE:** The information contained in this document is strictly confidential, legally privileged, and intended solely for the use of the designated recipient. Any unauthorized disclosure, distribution, copying, or taking of any action in reliance on these contents is strictly prohibited.',
    },
  },
  {
    id: 'snippet-dual-signature',
    name: 'Executive Sign-off Block',
    description: 'Formal signature block with signatory title, organization, and date.',
    category: 'Signatures',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    block: {
      id: 'snip-sig-1',
      type: 'signature',
      signatoryName: 'Eleanor Vance, Ph.D.',
      designation: 'Chief Executive Officer & Managing Director',
      organization: 'Apex Horizon Enterprise Holdings',
      signatureLabel: 'Authorized Executive Signatory',
      date: new Date().toISOString().split('T')[0],
      align: 'left',
    },
  },
  {
    id: 'snippet-action-items-table',
    name: 'Action Items & Milestone Grid',
    description: 'Project task tracking table with ID, task description, assignee, due date, and priority.',
    category: 'Tables',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    block: {
      id: 'snip-table-1',
      type: 'table',
      caption: 'Table: Action Items & Milestone Responsibility Matrix',
      headers: ['Task ID', 'Description', 'Owner', 'Due Date', 'Priority'],
      columnAlignments: ['left', 'left', 'left', 'center', 'right'],
      headerStyle: 'accent',
      rows: [
        ['ACT-01', 'Finalize engineering architecture document', 'Alex Chen', 'Friday', 'High'],
        ['ACT-02', 'Execute security penetration test', 'Sarah Miller', 'Next Tue', 'Urgent'],
        ['ACT-03', 'Deploy staging canary release', 'Dave Patel', 'Next Fri', 'Normal'],
      ],
    },
  },
  {
    id: 'snippet-doc-control',
    name: 'Document Control Metadata',
    description: 'Revision metadata card with document ID, version number, classification, and status.',
    category: 'Metadata',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    block: {
      id: 'snip-meta-1',
      type: 'metadata',
      title: 'Document Revision Control',
      style: 'table',
      rows: [
        { id: 'meta-r1', label: 'Document Identifier', value: 'DOC-2026-X1' },
        { id: 'meta-r2', label: 'Revision Version', value: 'v1.0.0-Final' },
        { id: 'meta-r3', label: 'Security Classification', value: 'Internal Restricted' },
        { id: 'meta-r4', label: 'Document Lifecycle', value: 'Approved & Active' },
      ],
    },
  },
  {
    id: 'snippet-bayes-formula',
    name: 'Bayes Theorem & Probability Formula',
    description: 'Standard mathematical formula block in LaTeX display format.',
    category: 'Formulas',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    block: {
      id: 'snip-formula-1',
      type: 'formula',
      latex: 'P(A \\mid B) = \\frac{P(B \\mid A) \\cdot P(A)}{P(B)} = \\frac{P(B \\mid A) \\cdot P(A)}{\\sum_i P(B \\mid A_i) P(A_i)}',
      equationNumber: '(1.1)',
      displayMode: true,
    },
  },
  {
    id: 'snippet-feature-matrix',
    name: 'Feature Tier Comparison Table',
    description: 'Comparison table comparing capabilities across tiers with aligned columns.',
    category: 'Tables',
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    block: {
      id: 'snip-table-2',
      type: 'table',
      caption: 'Table: Edition feature matrix and service tier commitments',
      headers: ['Capability', 'Standard Tier', 'Professional', 'Enterprise Cloud'],
      columnAlignments: ['left', 'center', 'center', 'right'],
      headerStyle: 'accent',
      rows: [
        ['Concurrency', '1,000 req/s', '10,000 req/s', 'Unlimited Global'],
        ['Automated Failover', 'Manual (24h)', '< 5 Minutes', 'Active-Active (< 1s)'],
        ['Dedicated Support', 'Email / Forum', '8x5 Business SLA', '24/7/365 Dedicated TAM'],
      ],
    },
  },
];

// ==========================================
// USER TEMPLATES STORAGE
// ==========================================

export function getUserTemplates(): DocumentTemplate[] {
  try {
    const raw = localStorage.getItem(USER_TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load user templates from localStorage:', err);
    return [];
  }
}

export function saveUserTemplate(
  data: Omit<DocumentTemplate, 'id' | 'isBuiltIn' | 'createdAt'>
): DocumentTemplate {
  const templates = getUserTemplates();
  const newTemplate: DocumentTemplate = {
    ...data,
    id: `custom-template-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };

  const updated = [newTemplate, ...templates];
  try {
    localStorage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save user template to localStorage:', err);
  }
  return newTemplate;
}

export function deleteUserTemplate(id: string): boolean {
  try {
    const templates = getUserTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete user template:', err);
    return false;
  }
}

// ==========================================
// USER BLOCK SNIPPETS STORAGE
// ==========================================

export function getUserSnippets(): BlockSnippet[] {
  try {
    const raw = localStorage.getItem(USER_SNIPPETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load user snippets from localStorage:', err);
    return [];
  }
}

export function saveUserSnippet(
  data: Omit<BlockSnippet, 'id' | 'isBuiltIn' | 'createdAt'>
): BlockSnippet {
  const snippets = getUserSnippets();
  const newSnippet: BlockSnippet = {
    ...data,
    id: `custom-snippet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };

  const updated = [newSnippet, ...snippets];
  try {
    localStorage.setItem(USER_SNIPPETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save user snippet to localStorage:', err);
  }
  return newSnippet;
}

export function deleteUserSnippet(id: string): boolean {
  try {
    const snippets = getUserSnippets();
    const filtered = snippets.filter((s) => s.id !== id);
    localStorage.setItem(USER_SNIPPETS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete user snippet:', err);
    return false;
  }
}

// ==========================================
// UTILITY INSTANTIATION HELPERS
// ==========================================

/**
 * Creates a brand new instance of a template document with fresh block IDs
 * to avoid collision and keep existing history/state clean.
 */
export function instantiateTemplate(template: DocumentTemplate): DocumentModel {
  const blocks = template.document.blocks.map((b) => cloneBlockWithNewId(b));
  return {
    metadata: {
      ...template.document.metadata,
      date: new Date().toISOString().split('T')[0],
    },
    blocks,
  };
}

/**
 * Clones a block snippet with a unique ID ready for insertion into the editor.
 */
export function instantiateSnippet(snippet: BlockSnippet): DocumentBlockItem {
  return cloneBlockWithNewId(snippet.block);
}

/**
 * Exports a template as a downloadable JSON file.
 */
export function exportTemplateAsJson(template: DocumentTemplate): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const safeName = template.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  downloadAnchor.setAttribute('download', `${safeName}.template.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
