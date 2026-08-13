'use client';

import React, { useEffect, useState } from 'react';
import type { ScanResult, Severity } from '@/types/accessibility';
import { SEVERITY_META, SEVERITY_ORDER, scoreBand } from '@/lib/issue-meta';
import { download, fileStem, hostOf, toMarkdown } from '@/lib/report';
import { DownloadIcon, ExternalIcon } from './ui/Icons';
import CopyButton from './ui/CopyButton';

interface ScoreDisplayProps {
  result: ScanResult;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Counts up to the final score once, respecting reduced-motion preferences. */
function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const animatedScore = useCountUp(result.score);
  const band = scoreBand(result.score);

  const counts = SEVERITY_ORDER.map((severity) => ({
    severity,
    count: result.issues.filter((issue) => issue.severity === severity).length,
  })).filter((entry) => entry.count > 0);

  const totalIssues = result.issues.length;
  const audited = totalIssues + result.summary.passed;

  return (
    <section className="card overflow-hidden" aria-labelledby="score-heading">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto,1fr] lg:items-center">
        {/* Gauge */}
        <div className="relative mx-auto grid h-40 w-40 place-items-center lg:mx-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              className="stroke-canvas-deep"
            />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={`${band.stroke} transition-[stroke-dashoffset] duration-1000 ease-out`}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - animatedScore / 100)}
            />
          </svg>
          <div className="absolute text-center">
            <div className={`font-mono text-4xl font-bold tabular-nums ${band.text}`}>
              {animatedScore}
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-ink-subtle">/ 100</div>
          </div>
        </div>

        {/* Meta */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 id="score-heading" className="text-2xl font-bold tracking-tight text-ink">
              {hostOf(result.url)}
            </h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${band.text} ${
                result.score >= 90
                  ? 'bg-success/10'
                  : result.score >= 50
                    ? 'bg-moderate/10'
                    : 'bg-critical/10'
              }`}
            >
              {band.label}
            </span>
            <span className="rounded-full bg-canvas-deep px-2.5 py-1 text-xs font-medium capitalize text-ink-muted">
              {result.strategy}
            </span>
          </div>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-subtle">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 truncate font-mono text-xs hover:text-ink hover:underline"
            >
              <span className="truncate">{result.url}</span>
              <ExternalIcon className="h-3.5 w-3.5 shrink-0" />
            </a>
            <span aria-hidden="true">·</span>
            <time dateTime={new Date(result.timestamp).toISOString()}>
              {new Date(result.timestamp).toLocaleString()}
            </time>
          </p>

          {/* Severity breakdown */}
          <div className="mt-6">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-canvas-deep" aria-hidden="true">
              {counts.map(({ severity, count }) => (
                <div
                  key={severity}
                  className={SEVERITY_META[severity].bg}
                  style={{ width: `${(count / totalIssues) * 100}%` }}
                />
              ))}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              {SEVERITY_ORDER.map((severity: Severity) => {
                const count = result.issues.filter((i) => i.severity === severity).length;
                return (
                  <div key={severity}>
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-subtle">
                      <span
                        className={`h-2 w-2 rounded-full ${SEVERITY_META[severity].bg}`}
                        aria-hidden="true"
                      />
                      {SEVERITY_META[severity].label}
                    </dt>
                    <dd className="mt-0.5 font-mono text-xl font-semibold tabular-nums text-ink">
                      {count}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>

      {/* Footer stats + export */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border bg-canvas-deep/50 px-6 py-4 sm:px-8">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{result.summary.passed}</span> of{' '}
          <span className="font-semibold text-ink">{audited}</span> automated checks passed
        </p>
        <p className="text-sm text-ink-subtle">
          {result.summary.manual} need manual review · {result.summary.notApplicable} not applicable
        </p>

        <div className="ml-auto flex items-center gap-2">
          <CopyButton
            value={toMarkdown(result)}
            label="report as Markdown"
            withText
            className="px-3 py-2"
          />
          <button
            type="button"
            onClick={() =>
              download(`${fileStem(result)}.json`, JSON.stringify(result, null, 2), 'application/json')
            }
            className="btn-ghost px-3 py-2 text-xs"
          >
            <DownloadIcon className="h-4 w-4" />
            JSON
          </button>
          <button
            type="button"
            onClick={() => download(`${fileStem(result)}.md`, toMarkdown(result), 'text/markdown')}
            className="btn-ghost px-3 py-2 text-xs"
          >
            <DownloadIcon className="h-4 w-4" />
            Markdown
          </button>
        </div>
      </div>
    </section>
  );
}
