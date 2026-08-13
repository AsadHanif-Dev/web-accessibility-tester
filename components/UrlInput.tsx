'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import type { HistoryEntry, Strategy } from '@/types/accessibility';
import { DesktopIcon, HistoryIcon, MobileIcon, SearchIcon } from './ui/Icons';

interface UrlInputProps {
  onScan: (url: string, strategy: Strategy) => void;
  isLoading: boolean;
  history: HistoryEntry[];
}

const EXAMPLES = ['https://example.com', 'https://wikipedia.org', 'https://developer.mozilla.org'];

/** Accepts "example.com" as well as a full URL, and normalises to an absolute URL. */
function normalise(input: string): { url: string } | { error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { error: 'Enter a URL to scan.' };

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { error: 'That does not look like a valid URL. Try https://example.com' };
  }

  if (!parsed.hostname.includes('.')) {
    return { error: 'Enter a full domain, for example https://example.com' };
  }

  return { url: parsed.toString() };
}

export default function UrlInput({ onScan, isLoading, history }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [strategy, setStrategy] = useState<Strategy>('desktop');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const listId = useId();

  // "/" focuses the field the way search-first tools do.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = normalise(url);
    if ('error' in result) {
      setError(result.error);
      inputRef.current?.focus();
      return;
    }
    setError('');
    setUrl(result.url);
    onScan(result.url, strategy);
  };

  const runExample = (value: string) => {
    setUrl(value);
    setError('');
    onScan(value, strategy);
  };

  return (
    <form onSubmit={submit} className="card p-4 shadow-lift sm:p-5" noValidate>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="url-input" className="sr-only">
            Website URL to scan
          </label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-subtle" />
          <input
            ref={inputRef}
            id="url-input"
            type="url"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            list={history.length ? listId : undefined}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="example.com  —  press / to focus"
            disabled={isLoading}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={Boolean(error)}
            className="h-14 w-full rounded-xl border border-border bg-canvas pl-12 pr-4 text-base
                       text-ink placeholder:text-ink-subtle
                       focus:border-accent focus:bg-surface
                       disabled:cursor-not-allowed disabled:opacity-60"
          />
          {history.length > 0 && (
            <datalist id={listId}>
              {history.map((entry) => (
                <option key={entry.url} value={entry.url} />
              ))}
            </datalist>
          )}
        </div>

        <fieldset
          className="flex shrink-0 rounded-xl border border-border bg-canvas p-1"
          disabled={isLoading}
        >
          <legend className="sr-only">Device profile</legend>
          {(
            [
              ['desktop', 'Desktop', DesktopIcon],
              ['mobile', 'Mobile', MobileIcon],
            ] as const
          ).map(([value, label, Icon]) => {
            const active = strategy === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium
                            transition-colors ${
                              active
                                ? 'bg-surface text-ink shadow-card'
                                : 'text-ink-subtle hover:text-ink'
                            }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  value={value}
                  checked={active}
                  onChange={() => setStrategy(value)}
                  className="sr-only"
                />
                <Icon className="h-4 w-4" />
                {label}
              </label>
            );
          })}
        </fieldset>

        <button type="submit" disabled={isLoading} className="btn-primary h-14 shrink-0 px-7 text-base">
          {isLoading ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              Scanning…
            </>
          ) : (
            'Run scan'
          )}
        </button>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm font-medium text-critical">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
          Try
        </span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => runExample(example)}
            disabled={isLoading}
            className="rounded-lg bg-canvas-deep px-2.5 py-1 font-mono text-xs text-ink-muted
                       transition-colors hover:text-ink disabled:opacity-50"
          >
            {example.replace('https://', '')}
          </button>
        ))}

        {history.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-subtle">
            <HistoryIcon className="h-3.5 w-3.5" />
            {history.length} recent {history.length === 1 ? 'scan' : 'scans'} saved
          </span>
        )}
      </div>
    </form>
  );
}
