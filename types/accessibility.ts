export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';

export type Category = 'images' | 'contrast' | 'aria' | 'forms' | 'structure' | 'other';

export type Strategy = 'desktop' | 'mobile';

export interface AffectedElement {
  selector?: string;
  snippet?: string;
  label?: string;
}

export interface AccessibilityIssue {
  id: string;
  auditId: string;
  title: string;
  description: string;
  severity: Severity;
  category: Category;
  /** Lighthouse audit weight — how much this audit contributes to the score. */
  weight: number;
  elements: AffectedElement[];
  fix: string;
  helpUrl?: string;
}

export interface ScanSummary {
  /** Audits that fully passed. */
  passed: number;
  /** Audits that could not be evaluated on this page. */
  notApplicable: number;
  /** Audits requiring a human to verify. */
  manual: number;
}

export interface ScanResult {
  url: string;
  finalUrl?: string;
  strategy: Strategy;
  timestamp: number;
  score: number;
  issues: AccessibilityIssue[];
  summary: ScanSummary;
  isMockData?: boolean;
  warning?: string;
}

export interface HistoryEntry {
  url: string;
  score: number;
  issueCount: number;
  strategy: Strategy;
  timestamp: number;
}
