import { NextRequest, NextResponse } from 'next/server';
import type {
  AccessibilityIssue,
  AffectedElement,
  Category,
  ScanResult,
  Severity,
  Strategy,
} from '@/types/accessibility';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const PAGESPEED_TIMEOUT_MS = 55_000;

/* -------------------------------------------------------------------------- */
/*                              Audit classification                          */
/* -------------------------------------------------------------------------- */

/**
 * Lighthouse audit ids grouped by the bucket we surface in the UI. Anything not
 * listed falls back to keyword matching and finally to `other`.
 */
const CATEGORY_BY_AUDIT: Record<string, Category> = {
  'image-alt': 'images',
  'image-redundant-alt': 'images',
  'input-image-alt': 'images',
  'object-alt': 'images',
  'video-caption': 'images',
  'color-contrast': 'contrast',
  label: 'forms',
  'form-field-multiple-labels': 'forms',
  'select-name': 'forms',
  'input-button-name': 'forms',
  'document-title': 'structure',
  'html-has-lang': 'structure',
  'html-lang-valid': 'structure',
  'html-xml-lang-mismatch': 'structure',
  'heading-order': 'structure',
  'duplicate-id-aria': 'structure',
  'meta-viewport': 'structure',
  'meta-refresh': 'structure',
  bypass: 'structure',
  'frame-title': 'structure',
  list: 'structure',
  listitem: 'structure',
  'definition-list': 'structure',
  dlitem: 'structure',
  tablist: 'structure',
  'td-headers-attr': 'structure',
  'th-has-data-cells': 'structure',
  'skip-link': 'structure',
  'link-name': 'aria',
  'button-name': 'aria',
  'accesskeys': 'aria',
  'tabindex': 'aria',
  'valid-lang': 'structure',
};

const FIXES: Record<string, string> = {
  'image-alt':
    'Give every <img> an alt attribute. Describe what the image conveys, or use alt="" when it is purely decorative so screen readers skip it.',
  'input-image-alt':
    'Add an alt attribute to <input type="image"> describing the action the button performs.',
  'object-alt': 'Provide fallback text inside <object> elements for assistive technology.',
  'video-caption': 'Add a <track kind="captions"> element to every <video> so audio content is available as text.',
  'color-contrast':
    'Raise the contrast ratio to at least 4.5:1 for body text and 3:1 for text 18pt+ or bold 14pt+. Darken the foreground or lighten the background until it passes.',
  'link-name':
    'Give each link discernible text. For icon-only links add aria-label, or include visually hidden text inside the anchor.',
  'button-name':
    'Give each button an accessible name via its text content, aria-label, or aria-labelledby.',
  label:
    'Associate every form control with a <label for="id"> or wrap it in a <label>. Placeholder text is not a substitute.',
  'select-name': 'Associate each <select> with a visible <label> or an aria-label.',
  'form-field-multiple-labels':
    'Use exactly one <label> per form control — multiple labels are announced inconsistently across screen readers.',
  'document-title': 'Add a unique, descriptive <title> that names the page and the site.',
  'html-has-lang': 'Set the page language on the root element, e.g. <html lang="en">.',
  'html-lang-valid': 'Use a valid BCP 47 language tag in the lang attribute, e.g. "en" or "en-GB".',
  'heading-order':
    'Use headings in sequential order (h1 → h2 → h3) without skipping levels. Style with CSS instead of picking a level for its size.',
  'duplicate-id-aria': 'Make every id referenced by ARIA unique so aria-labelledby and friends resolve correctly.',
  'meta-viewport':
    'Remove user-scalable=no and maximum-scale from the viewport meta tag so users can zoom to at least 5x.',
  'meta-refresh': 'Remove <meta http-equiv="refresh"> — timed redirects disorient users who need more time.',
  bypass:
    'Add a skip link, landmark regions (<main>, <nav>), or headings so keyboard users can jump past repeated navigation.',
  'frame-title': 'Give every <iframe> a title attribute describing its content.',
  tabindex:
    'Avoid tabindex values greater than 0. Order elements in the DOM to match the intended focus order instead.',
  accesskeys: 'Make accesskey values unique, or drop them — they frequently collide with assistive technology shortcuts.',
  list: 'Ensure <ul> and <ol> contain only <li>, <script>, or <template> children.',
  listitem: 'Ensure every <li> is contained by a <ul>, <ol>, or an element with role="list".',
  'aria-required-attr': 'Add the ARIA attributes that the element’s role requires.',
  'aria-required-children': 'Add the child roles that this ARIA role requires (e.g. a listbox needs options).',
  'aria-required-parent': 'Nest this element inside the parent role that its ARIA role requires.',
  'aria-valid-attr': 'Correct the misspelled ARIA attribute names.',
  'aria-valid-attr-value': 'Use a valid value for each ARIA attribute — check the id references resolve.',
  'aria-hidden-body': 'Never set aria-hidden="true" on <body>; it hides the whole page from assistive technology.',
  'aria-hidden-focus': 'Elements with aria-hidden="true" must not contain focusable children.',
  'aria-allowed-attr': 'Remove ARIA attributes that are not allowed on this element’s role.',
  'aria-roles': 'Use a valid ARIA role, or prefer the equivalent native HTML element.',
  'target-size': 'Make touch targets at least 24x24 CSS pixels, or add spacing around them.',
};

function categoryFor(auditId: string): Category {
  const known = CATEGORY_BY_AUDIT[auditId];
  if (known) return known;
  if (/(image|alt|video|audio)/.test(auditId)) return 'images';
  if (/(contrast|color)/.test(auditId)) return 'contrast';
  if (/(label|form|input|select|textarea)/.test(auditId)) return 'forms';
  if (/(aria|role|name)/.test(auditId)) return 'aria';
  if (/(heading|list|lang|title|landmark|table|th|td|frame)/.test(auditId)) return 'structure';
  return 'other';
}

/**
 * Lighthouse expresses importance as an audit weight inside the category. A
 * weight of 10 is the most damaging class of failure, 0 means informational.
 */
function severityFor(weight: number): Severity {
  if (weight >= 7) return 'critical';
  if (weight >= 3) return 'serious';
  if (weight > 0) return 'moderate';
  return 'minor';
}

function fixFor(auditId: string): string {
  if (FIXES[auditId]) return FIXES[auditId];
  const partial = Object.keys(FIXES).find((key) => auditId.includes(key));
  if (partial) return FIXES[partial];
  return 'Open the linked documentation for the recommended remediation for this audit.';
}

/** Lighthouse descriptions embed a markdown "[Learn more](url)" tail. */
function extractHelpUrl(description = ''): string | undefined {
  const match = description.match(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/);
  return match?.[1];
}

function cleanDescription(description = ''): string {
  return description
    .replace(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g, '$1')
    .replace(/\s*\[Learn more[^.]*\.?/i, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function toElements(audit: any): AffectedElement[] {
  const items: any[] = audit?.details?.items ?? [];
  const seen = new Set<string>();
  const elements: AffectedElement[] = [];

  for (const item of items) {
    const node = item.node ?? item.subItems?.items?.[0]?.node;
    if (!node) continue;
    const key = node.selector || node.snippet;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    elements.push({
      selector: node.selector,
      snippet: node.snippet,
      label: node.nodeLabel && node.nodeLabel !== node.snippet ? node.nodeLabel : undefined,
    });
    if (elements.length >= 8) break;
  }

  return elements;
}

/* -------------------------------------------------------------------------- */
/*                                 Demo payload                               */
/* -------------------------------------------------------------------------- */

function generateMockData(url: string, strategy: Strategy): ScanResult {
  const issues: AccessibilityIssue[] = [
    {
      id: 'issue-0',
      auditId: 'image-alt',
      title: 'Image elements do not have [alt] attributes',
      description:
        'Informative elements should aim for short, descriptive alternate text. Decorative elements can be ignored with an empty alt attribute.',
      severity: 'critical',
      category: 'images',
      weight: 10,
      elements: [
        { selector: 'header > a > img', snippet: '<img src="/logo.png">', label: 'Site logo' },
        { selector: 'section.hero > img', snippet: '<img src="/banner.jpg">' },
      ],
      fix: FIXES['image-alt'],
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/image-alt',
    },
    {
      id: 'issue-1',
      auditId: 'color-contrast',
      title: 'Background and foreground colors do not have a sufficient contrast ratio',
      description: 'Low-contrast text is difficult or impossible for many users to read.',
      severity: 'critical',
      category: 'contrast',
      weight: 7,
      elements: [
        { selector: 'div.header > p', snippet: '<p class="subtitle">Trusted by teams</p>' },
        { selector: 'button.submit', snippet: '<button class="submit">Send</button>' },
      ],
      fix: FIXES['color-contrast'],
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
    },
    {
      id: 'issue-2',
      auditId: 'button-name',
      title: 'Buttons do not have an accessible name',
      description:
        'When a button does not have an accessible name, screen readers announce it as "button", making it unusable for people who rely on screen readers.',
      severity: 'critical',
      category: 'aria',
      weight: 10,
      elements: [{ selector: 'button.close-btn', snippet: '<button class="close-btn"><span class="icon-close"></span></button>' }],
      fix: FIXES['button-name'],
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name',
    },
    {
      id: 'issue-3',
      auditId: 'link-name',
      title: 'Links do not have a discernible name',
      description:
        'Link text that is discernible, unique, and focusable improves the navigation experience for screen reader users.',
      severity: 'serious',
      category: 'aria',
      weight: 7,
      elements: [{ selector: 'nav > a:nth-child(3)', snippet: '<a href="/more"><span class="icon"></span></a>' }],
      fix: FIXES['link-name'],
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/link-name',
    },
    {
      id: 'issue-4',
      auditId: 'label',
      title: 'Form elements do not have associated labels',
      description:
        'Labels ensure that form controls are announced properly by assistive technologies like screen readers.',
      severity: 'serious',
      category: 'forms',
      weight: 7,
      elements: [{ selector: 'form > input[type=email]', snippet: '<input type="email" placeholder="Enter email">' }],
      fix: FIXES['label'],
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label',
    },
    {
      id: 'issue-5',
      auditId: 'heading-order',
      title: 'Heading elements are not in a sequentially-descending order',
      description:
        'Properly ordered headings that do not skip levels convey the semantic structure of the page, making it easier to navigate.',
      severity: 'moderate',
      category: 'structure',
      weight: 3,
      elements: [{ selector: 'section.pricing > h4', snippet: '<h4>Plans</h4>' }],
      fix: FIXES['heading-order'],
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/heading-order',
    },
  ];

  return {
    url,
    finalUrl: url,
    strategy,
    timestamp: Date.now(),
    score: 67,
    issues,
    summary: { passed: 24, notApplicable: 19, manual: 10 },
    isMockData: true,
  };
}

/* -------------------------------------------------------------------------- */
/*                                    Route                                   */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const rawUrl: unknown = body?.url;
  const strategy: Strategy = body?.strategy === 'mobile' ? 'mobile' : 'desktop';

  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl.trim());
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json({ error: 'URL must start with http:// or https://' }, { status: 400 });
  }

  const url = target.toString();

  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || '';
    const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    endpoint.searchParams.set('url', url);
    endpoint.searchParams.set('category', 'accessibility');
    endpoint.searchParams.set('strategy', strategy);
    if (apiKey) endpoint.searchParams.set('key', apiKey);

    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(PAGESPEED_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`PageSpeed API returned ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`);
    }

    const data = await response.json();
    const lighthouseResult = data?.lighthouseResult;
    const accessibility = lighthouseResult?.categories?.accessibility;

    if (!accessibility) {
      throw new Error('PageSpeed API did not return accessibility results');
    }

    const audits = lighthouseResult.audits ?? {};
    const auditRefs: Array<{ id: string; weight: number }> = accessibility.auditRefs ?? [];

    const issues: AccessibilityIssue[] = [];
    const summary = { passed: 0, notApplicable: 0, manual: 0 };

    auditRefs.forEach((ref, index) => {
      const audit = audits[ref.id];
      if (!audit) return;

      if (audit.scoreDisplayMode === 'notApplicable') {
        summary.notApplicable += 1;
        return;
      }
      if (audit.scoreDisplayMode === 'manual' || audit.scoreDisplayMode === 'informative') {
        summary.manual += 1;
        return;
      }
      if (audit.score === null || audit.score >= 1) {
        summary.passed += 1;
        return;
      }

      issues.push({
        id: `${ref.id}-${index}`,
        auditId: ref.id,
        title: audit.title,
        description: cleanDescription(audit.description),
        severity: severityFor(ref.weight ?? 0),
        category: categoryFor(ref.id),
        weight: ref.weight ?? 0,
        elements: toElements(audit),
        fix: fixFor(ref.id),
        helpUrl: extractHelpUrl(audit.description),
      });
    });

    // Most damaging first, then by how many elements are affected.
    issues.sort((a, b) => b.weight - a.weight || b.elements.length - a.elements.length);

    const result: ScanResult = {
      url,
      finalUrl: lighthouseResult.finalUrl || lighthouseResult.finalDisplayedUrl || url,
      strategy,
      timestamp: Date.now(),
      score: Math.round((accessibility.score ?? 0) * 100),
      issues,
      summary,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    const reason =
      error?.name === 'TimeoutError'
        ? 'the scan timed out'
        : error?.message || 'the scan could not be completed';
    console.error('PageSpeed API error, falling back to demo data:', reason);

    return NextResponse.json({
      ...generateMockData(url, strategy),
      warning: `Showing demo data because ${reason}. Google PageSpeed Insights may be rate-limited — add a GOOGLE_PAGESPEED_API_KEY or retry shortly.`,
    } satisfies ScanResult);
  }
}
