'use client';

import React, { useEffect, useState } from 'react';

const STEPS = [
  'Requesting the page…',
  'Rendering with Lighthouse…',
  'Running accessibility audits…',
  'Collecting affected elements…',
  'Almost there — compiling the report…',
];

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-canvas-deep ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-ink/5 to-transparent" />
    </div>
  );
}

export default function ScanSkeleton() {
  const [step, setStep] = useState(0);

  // A slow, honest progression — a real scan takes 10–30s.
  useEffect(() => {
    const id = setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8" aria-hidden="true">
        <div className="grid gap-8 lg:grid-cols-[auto,1fr] lg:items-center">
          <div className="mx-auto h-40 w-40 rounded-full border-8 border-canvas-deep border-t-accent motion-safe:animate-spin lg:mx-0" />
          <div className="space-y-3">
            <Shimmer className="h-7 w-52" />
            <Shimmer className="h-4 w-72" />
            <Shimmer className="h-2.5 w-full" />
            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Shimmer key={i} className="h-12" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="text-center text-sm font-medium text-ink-muted"
      >
        {STEPS[step]}
      </p>

      <div className="card space-y-3 p-5 sm:p-6" aria-hidden="true">
        {['opacity-100', 'opacity-75', 'opacity-50'].map((opacity) => (
          <Shimmer key={opacity} className={`h-20 ${opacity}`} />
        ))}
      </div>
    </div>
  );
}
