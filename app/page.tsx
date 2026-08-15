'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import UrlInput from '@/components/UrlInput';
import ScoreDisplay from '@/components/ScoreDisplay';
import IssueList from '@/components/IssueList';
import FixPreview from '@/components/FixPreview';
import ScanSkeleton from '@/components/ScanSkeleton';
import RecentScans from '@/components/RecentScans';
import ThemeToggle from '@/components/ThemeToggle';
import { AlertIcon, CheckIcon, InfoIcon } from '@/components/ui/Icons';
import type { HistoryEntry, ScanResult, Strategy } from '@/types/accessibility';

const HISTORY_KEY = 'a11y-history';
const HISTORY_LIMIT = 6;

const FEATURES = [
  {
    title: 'Real Lighthouse audits',
    // Not "no simulated results": without a PageSpeed API key the deployment
    // shares Google's anonymous quota and falls back to clearly-flagged sample
    // data once that runs out, so the absolute claim was not always true.
    body: 'Scans run the same accessibility audits Chrome ships with, via the Google PageSpeed Insights API. If the quota is unavailable the results are clearly flagged as sample data.',
  },
  {
    title: 'Prioritised by impact',
    body: 'Findings are ranked by the weight Lighthouse assigns them, so the failures that block the most people surface first.',
  },
  {
    title: 'Fixes you can act on',
    body: 'Each issue carries the affected selectors, a concrete remediation, and a link to the underlying rule documentation.',
  },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restore history on mount; localStorage is unavailable during SSR.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      /* Corrupt or blocked storage — start empty. */
    }
  }, []);

  const rememberScan = useCallback((scan: ScanResult) => {
    setHistory((previous) => {
      const entry: HistoryEntry = {
        url: scan.url,
        score: scan.score,
        issueCount: scan.issues.length,
        strategy: scan.strategy,
        timestamp: scan.timestamp,
      };
      const next = [entry, ...previous.filter((item) => item.url !== scan.url)].slice(
        0,
        HISTORY_LIMIT,
      );
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* Storage full or blocked — history is best-effort. */
      }
      return next;
    });
  }, []);

  const handleScan = useCallback(
    async (url: string, strategy: Strategy) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, strategy }),
          signal: controller.signal,
        });

        let data: any;
        try {
          data = await response.json();
        } catch {
          throw new Error('The server returned an unreadable response. Please try again.');
        }

        if (!response.ok) {
          throw new Error(data?.error || `Scan failed with status ${response.status}`);
        }

        setResult(data as ScanResult);
        rememberScan(data as ScanResult);
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // Superseded by a newer scan.
        setError(err?.message || 'Something went wrong while scanning.');
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [rememberScan],
  );

  // Move focus and scroll to the report once it lands.
  useEffect(() => {
    if (result) resultsRef.current?.focus();
  }, [result]);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* Nothing to do. */
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  const showIdleContent = !isLoading && !result && !error;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#main" className="flex items-center gap-2.5 font-bold tracking-tight text-ink">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm text-accent-ink">
              A11
            </span>
            A11y Scan
          </a>

          <nav className="ml-auto flex items-center gap-2">
            {result && (
              <button type="button" onClick={reset} className="btn-ghost text-xs">
                New scan
              </button>
            )}
            <a
              href="https://www.w3.org/WAI/WCAG22/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm font-medium text-ink-muted hover:text-ink sm:block"
            >
              WCAG reference
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main id="main" className="relative">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-border">
          <div className="grid-texture pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                Powered by Lighthouse via PageSpeed Insights
              </span>

              <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                Find what your site breaks for real users
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
                Scan any public page against the WCAG rules Lighthouse checks, ranked by how much
                damage each failure does — with the selectors and the fix for every one.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-4xl">
              <UrlInput onScan={handleScan} isLoading={isLoading} history={history} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          {isLoading && <ScanSkeleton />}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-critical/30 bg-critical/10 p-5"
            >
              <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-critical" />
              <div>
                <h2 className="font-semibold text-ink">Scan failed</h2>
                <p className="mt-1 text-sm text-ink-muted">{error}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-3 text-sm font-semibold text-critical hover:underline"
                >
                  Dismiss and try again
                </button>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div
              ref={resultsRef}
              tabIndex={-1}
              className="animate-fade-up space-y-8 outline-none"
              aria-label="Scan results"
            >
              {result.warning ? (
                // Deliberately loud: these numbers describe a fixture, not the
                // user's page, and acting on them would waste their time.
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border-2 border-moderate bg-moderate/15 p-4"
                >
                  <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-moderate" />
                  <div>
                    <h2 className="text-sm font-semibold text-ink">
                      Sample results — this is not a scan of {result.url}
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">{result.warning}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success/10 p-4">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p className="text-sm text-ink-muted">
                    <span className="font-semibold text-ink">Live scan complete.</span> Results come
                    straight from Lighthouse via the PageSpeed Insights API.
                  </p>
                </div>
              )}

              <ScoreDisplay result={result} />
              <IssueList issues={result.issues} />
              <FixPreview />
            </div>
          )}

          {showIdleContent && (
            <div className="space-y-10">
              <RecentScans
                entries={history}
                onSelect={(entry) => handleScan(entry.url, entry.strategy)}
                onClear={clearHistory}
              />

              <div className="grid gap-4 md:grid-cols-3">
                {FEATURES.map((feature, index) => (
                  <div key={feature.title} className="card p-6">
                    <span className="font-mono text-xs font-semibold text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="mt-3 text-base font-semibold text-ink">{feature.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
                      {feature.body}
                    </p>
                  </div>
                ))}
              </div>

              <FixPreview />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-subtle sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            Automated testing catches roughly a third of accessibility barriers — pair it with
            keyboard and screen reader testing.
          </p>
          <a
            href="https://www.w3.org/WAI/test-evaluate/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink-muted hover:text-ink hover:underline sm:ml-auto sm:shrink-0"
          >
            W3C evaluation guide
          </a>
        </div>
      </footer>
    </div>
  );
}
