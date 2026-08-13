'use client';

import React, { useId, useMemo, useState } from 'react';
import type { AccessibilityIssue, Category, Severity } from '@/types/accessibility';
import { CATEGORY_META, CATEGORY_ORDER, SEVERITY_META, SEVERITY_ORDER } from '@/lib/issue-meta';
import IssueCard from './IssueCard';
import { CheckIcon, CloseIcon, SearchIcon } from './ui/Icons';

interface IssueListProps {
  issues: AccessibilityIssue[];
}

type CategoryFilter = Category | 'all';
type SeverityFilter = Severity | 'all';

export default function IssueList({ issues }: IssueListProps) {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [query, setQuery] = useState('');
  const searchId = useId();

  const counts = useMemo(() => {
    const byCategory = {} as Record<Category, number>;
    const bySeverity = {} as Record<Severity, number>;
    for (const issue of issues) {
      byCategory[issue.category] = (byCategory[issue.category] ?? 0) + 1;
      bySeverity[issue.severity] = (bySeverity[issue.severity] ?? 0) + 1;
    }
    return { byCategory, bySeverity };
  }, [issues]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return issues.filter((issue) => {
      if (category !== 'all' && issue.category !== category) return false;
      if (severity !== 'all' && issue.severity !== severity) return false;
      if (!needle) return true;
      return (
        issue.title.toLowerCase().includes(needle) ||
        issue.description.toLowerCase().includes(needle) ||
        issue.auditId.toLowerCase().includes(needle) ||
        issue.elements.some((el) =>
          `${el.selector ?? ''} ${el.snippet ?? ''}`.toLowerCase().includes(needle),
        )
      );
    });
  }, [issues, category, severity, query]);

  const hasFilters = category !== 'all' || severity !== 'all' || query.trim() !== '';

  const reset = () => {
    setCategory('all');
    setSeverity('all');
    setQuery('');
  };

  if (issues.length === 0) {
    return (
      <section className="card p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10">
          <CheckIcon className="h-7 w-7 text-success" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-ink">No automated failures found</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted text-pretty">
          This page passed every automated check. Automated tools catch roughly a third of
          accessibility problems — follow up with keyboard-only navigation and a screen reader pass.
        </p>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden" aria-labelledby="issues-heading">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="issues-heading" className="text-xl font-bold tracking-tight text-ink">
            Issues found
            <span className="ml-2 rounded-full bg-canvas-deep px-2.5 py-0.5 font-mono text-sm font-semibold text-ink-muted">
              {issues.length}
            </span>
          </h2>

          <div className="relative w-full sm:w-72">
            <label htmlFor={searchId} className="sr-only">
              Search issues
            </label>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search issues or selectors"
              className="h-10 w-full rounded-lg border border-border bg-canvas pl-9 pr-3 text-sm
                         text-ink placeholder:text-ink-subtle focus:border-accent focus:bg-surface"
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <FilterRow label="Severity">
            <FilterChip active={severity === 'all'} onClick={() => setSeverity('all')}>
              All <Count>{issues.length}</Count>
            </FilterChip>
            {SEVERITY_ORDER.filter((s) => counts.bySeverity[s]).map((s) => (
              <FilterChip key={s} active={severity === s} onClick={() => setSeverity(s)}>
                <span
                  className={`h-2 w-2 rounded-full ${SEVERITY_META[s].bg}`}
                  aria-hidden="true"
                />
                {SEVERITY_META[s].label} <Count>{counts.bySeverity[s]}</Count>
              </FilterChip>
            ))}
          </FilterRow>

          <FilterRow label="Area">
            <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
              All <Count>{issues.length}</Count>
            </FilterChip>
            {CATEGORY_ORDER.filter((c) => counts.byCategory[c]).map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_META[c].label} <Count>{counts.byCategory[c]}</Count>
              </FilterChip>
            ))}
          </FilterRow>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <p className="text-sm text-ink-subtle" role="status">
            Showing {filtered.length} of {issues.length}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        {filtered.length > 0 ? (
          filtered.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} defaultOpen={index === 0 && !hasFilters} />
          ))
        ) : (
          <p className="py-10 text-center text-sm text-ink-subtle">
            No issues match these filters.
          </p>
        )}
      </div>
    </section>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chip text-xs ${active ? 'chip-active' : ''}`}
    >
      {children}
    </button>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return <span className="font-mono opacity-70">{children}</span>;
}
