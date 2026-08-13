import type { ScanResult } from '@/types/accessibility';
import { CATEGORY_META, SEVERITY_META } from './issue-meta';

export function toMarkdown(result: ScanResult): string {
  const lines: string[] = [
    `# Accessibility report — ${hostOf(result.url)}`,
    '',
    `- **URL:** ${result.url}`,
    `- **Device:** ${result.strategy}`,
    `- **Scanned:** ${new Date(result.timestamp).toISOString()}`,
    `- **Score:** ${result.score}/100`,
    `- **Failing audits:** ${result.issues.length}`,
    `- **Passing audits:** ${result.summary.passed}`,
  ];

  if (result.isMockData) {
    lines.push('', '> Generated from demo data — not a live scan.');
  }

  if (result.issues.length === 0) {
    lines.push('', 'No automated accessibility failures were detected.');
    return lines.join('\n');
  }

  lines.push('', '## Issues', '');

  result.issues.forEach((issue, index) => {
    lines.push(
      `### ${index + 1}. ${issue.title}`,
      '',
      `**Severity:** ${SEVERITY_META[issue.severity].label} · **Area:** ${CATEGORY_META[issue.category].label} · **Audit:** \`${issue.auditId}\``,
      '',
      issue.description,
      '',
      `**How to fix:** ${issue.fix}`,
    );

    if (issue.elements.length) {
      lines.push('', '**Affected elements:**', '');
      issue.elements.forEach((element) => {
        lines.push(`- \`${element.selector ?? element.snippet ?? 'unknown'}\``);
      });
    }

    if (issue.helpUrl) lines.push('', `[Reference](${issue.helpUrl})`);
    lines.push('');
  });

  return lines.join('\n');
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function download(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

export function fileStem(result: ScanResult): string {
  const date = new Date(result.timestamp).toISOString().slice(0, 10);
  return `a11y-${hostOf(result.url).replace(/[^a-z0-9.-]/gi, '-')}-${date}`;
}
