'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from './Icons';

interface CopyButtonProps {
  value: string;
  /** What is being copied, e.g. "selector" — used for the accessible name. */
  label: string;
  className?: string;
  withText?: boolean;
}

export default function CopyButton({ value, label, className = '', withText = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // Clipboard blocked (insecure context or denied permission).
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium
                  text-ink-subtle transition-colors hover:bg-canvas-deep hover:text-ink ${className}`}
    >
      {copied ? (
        <CheckIcon className="h-3.5 w-3.5 text-success" />
      ) : (
        <CopyIcon className="h-3.5 w-3.5" />
      )}
      {withText && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  );
}
