'use client';

import React from 'react';
import type { HistoryEntry } from '@/types/accessibility';
import { scoreBand } from '@/lib/issue-meta';
import { hostOf } from '@/lib/report';
import { HistoryIcon } from './ui/Icons';

interface RecentScansProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

function relativeTime(timestamp: number): string {
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.35],
    ['month', 12],
  ];

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  let value = seconds;

  for (const [unit, size] of units) {
    if (Math.abs(value) < size) return formatter.format(Math.round(value), unit);
    value /= size;
  }
  return formatter.format(Math.round(value), 'year');
}

export default function RecentScans({ entries, onSelect, onClear }: RecentScansProps) {
  if (entries.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="recent-heading"
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink-subtle"
        >
          <HistoryIcon className="h-4 w-4" />
          Recent scans
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-ink-subtle hover:text-ink hover:underline"
        >
          Clear history
        </button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          const band = scoreBand(entry.score);
          return (
            <li key={`${entry.url}-${entry.timestamp}`}>
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className="card flex w-full items-center gap-4 p-4 text-left transition-shadow hover:shadow-lift"
              >
                <span className={`font-mono text-2xl font-bold tabular-nums ${band.text}`}>
                  {entry.score}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{hostOf(entry.url)}</span>
                  <span className="block text-xs text-ink-subtle">
                    {entry.issueCount} {entry.issueCount === 1 ? 'issue' : 'issues'} ·{' '}
                    {entry.strategy} · {relativeTime(entry.timestamp)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
