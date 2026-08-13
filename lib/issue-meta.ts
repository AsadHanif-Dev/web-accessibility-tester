import type { Category, Severity } from '@/types/accessibility';

interface SeverityMeta {
  label: string;
  /** Tailwind text colour token. */
  text: string;
  /** Solid background used for filled chips and the breakdown bar. */
  bg: string;
  /** Tinted background used for badges inside cards. */
  soft: string;
  border: string;
}

export const SEVERITY_ORDER: Severity[] = ['critical', 'serious', 'moderate', 'minor'];

export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  critical: {
    label: 'Critical',
    text: 'text-critical',
    bg: 'bg-critical',
    soft: 'bg-critical/10',
    border: 'border-critical/30',
  },
  serious: {
    label: 'Serious',
    text: 'text-serious',
    bg: 'bg-serious',
    soft: 'bg-serious/10',
    border: 'border-serious/30',
  },
  moderate: {
    label: 'Moderate',
    text: 'text-moderate',
    bg: 'bg-moderate',
    soft: 'bg-moderate/10',
    border: 'border-moderate/30',
  },
  minor: {
    label: 'Minor',
    text: 'text-minor',
    bg: 'bg-minor',
    soft: 'bg-minor/10',
    border: 'border-minor/30',
  },
};

export const CATEGORY_ORDER: Category[] = [
  'images',
  'contrast',
  'aria',
  'forms',
  'structure',
  'other',
];

export const CATEGORY_META: Record<Category, { label: string; blurb: string }> = {
  images: { label: 'Images & media', blurb: 'Alternative text for images, video and audio' },
  contrast: { label: 'Colour contrast', blurb: 'Text legibility against its background' },
  aria: { label: 'Names & ARIA', blurb: 'Accessible names, roles and ARIA usage' },
  forms: { label: 'Forms', blurb: 'Labels and grouping for interactive controls' },
  structure: { label: 'Structure', blurb: 'Headings, landmarks, language and tables' },
  other: { label: 'Other', blurb: 'Remaining accessibility audits' },
};

export function scoreBand(score: number): { label: string; text: string; stroke: string } {
  if (score >= 90) return { label: 'Good', text: 'text-success', stroke: 'stroke-success' };
  if (score >= 50)
    return { label: 'Needs improvement', text: 'text-moderate', stroke: 'stroke-moderate' };
  return { label: 'Poor', text: 'text-critical', stroke: 'stroke-critical' };
}
