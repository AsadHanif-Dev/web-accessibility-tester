import { NextRequest, NextResponse } from 'next/server';
import type { AccessibilityIssue } from '@/types/accessibility';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Mock data for fallback when Lighthouse isn't available
function generateMockData(url: string) {
  const mockIssues: AccessibilityIssue[] = [
    {
      id: 'issue-0',
      title: 'Image elements do not have [alt] attributes',
      description: 'Informative elements should aim for short, descriptive alternate text. Decorative elements can be ignored with an empty alt attribute.',
      severity: 'critical',
      category: 'images',
      impact: 'High',
      elements: ['<img src="/logo.png">', '<img src="/banner.jpg">'],
      fix: 'Add descriptive alt text to all images. Use alt="" for decorative images.',
      helpUrl: 'https://web.dev/image-alt/',
    },
    {
      id: 'issue-1',
      title: 'Background and foreground colors do not have a sufficient contrast ratio',
      description: 'Low-contrast text is difficult or impossible for many users to read.',
      severity: 'critical',
      category: 'contrast',
      impact: 'High',
      elements: ['body > div.header > p', 'button.submit'],
      fix: 'Increase color contrast between text and background to at least 4.5:1 for normal text.',
      helpUrl: 'https://web.dev/color-contrast/',
    },
    {
      id: 'issue-2',
      title: 'Buttons do not have an accessible name',
      description: 'When a button doesn\'t have an accessible name, screen readers announce it as "button", making it unusable for users who rely on screen readers.',
      severity: 'critical',
      category: 'aria',
      impact: 'High',
      elements: ['<button class="close-btn"><span class="icon-close"></span></button>'],
      fix: 'Ensure all buttons have accessible text via aria-label or text content.',
      helpUrl: 'https://web.dev/button-name/',
    },
    {
      id: 'issue-3',
      title: 'Links do not have a discernible name',
      description: 'Link text (and alternate text for images, when used as links) that is discernible, unique, and focusable improves the navigation experience for screen reader users.',
      severity: 'warning',
      category: 'aria',
      impact: 'Medium',
      elements: ['<a href="/more"><span class="icon"></span></a>'],
      fix: 'Ensure all links have descriptive text that indicates their purpose.',
      helpUrl: 'https://web.dev/link-name/',
    },
    {
      id: 'issue-4',
      title: 'Form elements do not have associated labels',
      description: 'Labels ensure that form controls are announced properly by assistive technologies, like screen readers.',
      severity: 'warning',
      category: 'aria',
      impact: 'Medium',
      elements: ['<input type="email" placeholder="Enter email">'],
      fix: 'Associate form inputs with labels using for/id attributes.',
      helpUrl: 'https://web.dev/label/',
    },
  ];

  return {
    url,
    timestamp: Date.now(),
    score: 67,
    issues: mockIssues,
    isMockData: true,
  };
}

function mapAuditToCategory(auditId: string): 'images' | 'contrast' | 'aria' | 'other' {
  if (auditId.includes('alt') || auditId.includes('image')) return 'images';
  if (auditId.includes('contrast') || auditId.includes('color')) return 'contrast';
  if (auditId.includes('aria') || auditId.includes('role') || auditId.includes('label') || auditId.includes('button') || auditId.includes('link')) return 'aria';
  return 'other';
}

function getSeverity(score: number | null): 'critical' | 'warning' | 'success' {
  if (score === null || score < 0.5) return 'critical';
  if (score < 0.9) return 'warning';
  return 'success';
}

function getFixSuggestion(auditId: string): string {
  const fixes: Record<string, string> = {
    'image-alt': 'Add descriptive alt text to all images. Use alt="" for decorative images.',
    'color-contrast': 'Increase color contrast between text and background to at least 4.5:1 for normal text.',
    'aria-roles': 'Add appropriate ARIA roles to interactive elements (e.g., role="button").',
    'aria-required-attr': 'Add missing required ARIA attributes to elements with ARIA roles.',
    'button-name': 'Ensure all buttons have accessible text via aria-label or text content.',
    'link-name': 'Ensure all links have descriptive text that indicates their purpose.',
    'label': 'Associate form inputs with labels using for/id attributes.',
    'document-title': 'Add a descriptive <title> tag to the document.',
    'html-has-lang': 'Add a lang attribute to the <html> tag (e.g., <html lang="en">).',
    'meta-viewport': 'Add a viewport meta tag for responsive design.',
    'heading-order': 'Ensure heading elements are in a sequentially-descending order (h1, h2, h3).',
    'duplicate-id': 'Remove duplicate IDs to ensure all IDs are unique.',
  };

  for (const [key, fix] of Object.entries(fixes)) {
    if (auditId.includes(key)) return fix;
  }

  return 'Review the accessibility documentation for best practices.';
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('http')) {
        return NextResponse.json({ error: 'URL must start with http:// or https://' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Try to use Google PageSpeed Insights API (includes Lighthouse data)
    try {
      // Build API URL with optional API key for higher rate limits
      const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || '';
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=accessibility${apiKey ? `&key=${apiKey}` : ''}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`PageSpeed API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.lighthouseResult) {
        throw new Error('PageSpeed API did not return Lighthouse results');
      }

      const { lighthouseResult } = data;
      
      if (!lighthouseResult.categories?.accessibility) {
        throw new Error('No accessibility data in PageSpeed results');
      }

      const accessibilityScore = lighthouseResult.categories.accessibility.score;
      const audits = lighthouseResult.audits;

      // Process audits into accessibility issues
      const issues: AccessibilityIssue[] = [];
      let issueCounter = 0;

      for (const [auditId, audit] of Object.entries(audits)) {
        const typedAudit = audit as any;
        // Only include failed or warned audits
        if (typedAudit.score !== null && typedAudit.score < 1 && typedAudit.scoreDisplayMode !== 'notApplicable') {
          const elements: string[] = [];

          if (typedAudit.details?.items) {
            typedAudit.details.items.forEach((item: any) => {
              if (item.node?.selector) {
                elements.push(item.node.selector);
              } else if (item.node?.snippet) {
                elements.push(item.node.snippet);
              }
            });
          }

          issues.push({
            id: `issue-${issueCounter++}`,
            title: typedAudit.title,
            description: typedAudit.description,
            severity: getSeverity(typedAudit.score),
            category: mapAuditToCategory(auditId),
            impact: typedAudit.score === 0 ? 'High' : typedAudit.score < 0.5 ? 'Medium' : 'Low',
            elements: elements.slice(0, 5),
            fix: getFixSuggestion(auditId),
            helpUrl: typedAudit.helpText ? `https://web.dev/${auditId}/` : `https://web.dev/accessibility/`,
          });
        }
      }

      const result = {
        url,
        timestamp: Date.now(),
        score: Math.round((accessibilityScore || 0) * 100),
        issues,
      };

      return NextResponse.json(result);
    } catch (pageSpeedError: any) {
      console.error('PageSpeed API error, falling back to mock data:', pageSpeedError.message);

      // Return mock data as fallback
      const mockResult = generateMockData(url);
      return NextResponse.json({
        ...mockResult,
        warning: 'Using demo data. Google PageSpeed Insights API is unavailable or rate-limited.',
      });
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
