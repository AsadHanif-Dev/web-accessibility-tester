export interface AccessibilityIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'success';
  category: 'images' | 'contrast' | 'aria' | 'other';
  impact: string;
  elements: string[];
  fix: string;
  helpUrl?: string;
}

export interface ScanResult {
  url: string;
  timestamp: number;
  score: number;
  issues: AccessibilityIssue[];
}

export interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  details?: {
    items?: Array<{
      node?: {
        selector?: string;
        snippet?: string;
      };
    }>;
  };
}
