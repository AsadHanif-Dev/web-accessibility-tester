'use client';

import React, { useId, useState } from 'react';
import type { AccessibilityIssue } from '@/types/accessibility';
import { CATEGORY_META, SEVERITY_META } from '@/lib/issue-meta';
import { ChevronIcon, ExternalIcon, SparkIcon } from './ui/Icons';
import CopyButton from './ui/CopyButton';

interface IssueCardProps {
  issue: AccessibilityIssue;
  defaultOpen?: boolean;
}

export default function IssueCard({ issue, defaultOpen = false }: IssueCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const severity = SEVERITY_META[issue.severity];

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-surface transition-colors ${
        open ? 'border-border-strong' : 'border-border hover:border-border-strong'
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start gap-4 p-4 text-left sm:p-5"
        >
          <span
            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${severity.bg}`}
            aria-hidden="true"
          />

          <span className="min-w-0 flex-1">
            <span className="mb-1.5 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider
                            ${severity.soft} ${severity.text}`}
              >
                {severity.label}
              </span>
              <span className="text-xs font-medium text-ink-subtle">
                {CATEGORY_META[issue.category].label}
              </span>
              {issue.elements.length > 0 && (
                <span className="text-xs text-ink-subtle">
                  · {issue.elements.length} element{issue.elements.length === 1 ? '' : 's'}
                </span>
              )}
            </span>

            <span className="block text-base font-semibold leading-snug text-ink">
              {issue.title}
            </span>

            {!open && (
              <span className="mt-1 line-clamp-2 block text-sm text-ink-muted">
                {issue.description}
              </span>
            )}
          </span>

          <ChevronIcon
            className={`mt-1 h-5 w-5 shrink-0 text-ink-subtle transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </h3>

      {open && (
        <div id={panelId} className="animate-fade-up border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <p className="text-sm leading-relaxed text-ink-muted text-pretty">{issue.description}</p>

          <div className="mt-4 rounded-xl border border-accent/25 bg-accent-soft p-4">
            <h4 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
              <SparkIcon className="h-4 w-4 text-accent" />
              How to fix
            </h4>
            <p className="text-sm leading-relaxed text-ink-muted text-pretty">{issue.fix}</p>
          </div>

          {issue.elements.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                Affected elements
              </h4>
              <ul className="space-y-2">
                {issue.elements.map((element, index) => {
                  const code = element.snippet ?? element.selector ?? '';
                  return (
                    <li
                      key={`${issue.id}-el-${index}`}
                      className="group rounded-lg border border-border bg-canvas-deep/60 p-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-ink-muted">
                          {code}
                        </code>
                        <CopyButton value={code} label="element" className="shrink-0" />
                      </div>
                      {element.selector && element.snippet && (
                        <p className="mt-1.5 truncate font-mono text-[11px] text-ink-subtle">
                          {element.selector}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
            <code className="rounded bg-canvas-deep px-2 py-1 font-mono text-[11px] text-ink-subtle">
              {issue.auditId}
            </code>
            {issue.helpUrl && (
              <a
                href={issue.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
              >
                Full documentation
                <ExternalIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
