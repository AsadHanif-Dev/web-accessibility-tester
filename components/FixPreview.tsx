'use client';

import React, { useState } from 'react';
import CopyButton from './ui/CopyButton';

interface FixExample {
  id: string;
  title: string;
  wcag: string;
  description: string;
  before: string;
  after: string;
}

const FIX_EXAMPLES: FixExample[] = [
  {
    id: 'alt',
    title: 'Image alt text',
    wcag: 'WCAG 1.1.1',
    description:
      'Describe what the image communicates, not that it is an image. Purely decorative images take an empty alt so screen readers skip them.',
    before: `<img src="logo.png">
<img src="divider.svg">`,
    after: `<img src="logo.png" alt="Acme home">
<img src="divider.svg" alt="">`,
  },
  {
    id: 'contrast',
    title: 'Colour contrast',
    wcag: 'WCAG 1.4.3',
    description:
      'Body text needs a 4.5:1 ratio against its background; 3:1 is enough for text 18pt and larger, or bold 14pt and larger.',
    before: `.subtitle {
  color: #b9b9b9;   /* 2.1:1 — fails */
  background: #fff;
}`,
    after: `.subtitle {
  color: #565656;   /* 7.1:1 — passes */
  background: #fff;
}`,
  },
  {
    id: 'name',
    title: 'Accessible names',
    wcag: 'WCAG 4.1.2',
    description:
      'Icon-only controls are announced as just "button". Give them a name with aria-label, or with visually hidden text that survives CSS being unavailable.',
    before: `<button>
  <svg class="icon-close"></svg>
</button>`,
    after: `<button aria-label="Close dialog">
  <svg class="icon-close" aria-hidden="true"></svg>
</button>`,
  },
  {
    id: 'label',
    title: 'Form labels',
    wcag: 'WCAG 3.3.2',
    description:
      'A placeholder disappears as soon as typing starts and is not reliably announced. Pair every control with a real label.',
    before: `<input type="email"
       placeholder="Email">`,
    after: `<label for="email">Email</label>
<input id="email" type="email"
       autocomplete="email">`,
  },
  {
    id: 'landmark',
    title: 'Skip links & landmarks',
    wcag: 'WCAG 2.4.1',
    description:
      'Keyboard users should be able to jump past repeated navigation. A skip link plus real landmark elements gives them two ways to do it.',
    before: `<div class="nav">…</div>
<div class="content">…</div>`,
    after: `<a href="#main" class="skip-link">
  Skip to main content
</a>
<nav>…</nav>
<main id="main">…</main>`,
  },
  {
    id: 'focus',
    title: 'Visible focus',
    wcag: 'WCAG 2.4.7',
    description:
      'Removing outlines leaves keyboard users with no idea where they are. Replace the default with something stronger instead of deleting it.',
    before: `:focus {
  outline: none;
}`,
    after: `:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}`,
  },
];

export default function FixPreview() {
  const [selected, setSelected] = useState(0);
  const example = FIX_EXAMPLES[selected];

  return (
    <section className="card overflow-hidden" aria-labelledby="fixes-heading">
      <div className="border-b border-border p-5 sm:p-6">
        <h2 id="fixes-heading" className="text-xl font-bold tracking-tight text-ink">
          Common fixes
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Reference patterns for the failures that show up most often.
        </p>

        <div
          role="tablist"
          aria-label="Fix examples"
          className="mt-4 flex flex-wrap gap-2"
          onKeyDown={(e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            e.preventDefault();
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const next = (selected + delta + FIX_EXAMPLES.length) % FIX_EXAMPLES.length;
            setSelected(next);
            document.getElementById(`fix-tab-${FIX_EXAMPLES[next].id}`)?.focus();
          }}
        >
          {FIX_EXAMPLES.map((item, index) => {
            const active = index === selected;
            return (
              <button
                key={item.id}
                id={`fix-tab-${item.id}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`fix-panel-${item.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelected(index)}
                className={`chip text-xs ${active ? 'chip-active' : ''}`}
              >
                {item.title}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`fix-panel-${example.id}`}
        role="tabpanel"
        aria-labelledby={`fix-tab-${example.id}`}
        tabIndex={0}
        className="p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold text-ink">{example.title}</h3>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
            {example.wcag}
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted text-pretty">
          {example.description}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <CodePane variant="before" code={example.before} />
          <CodePane variant="after" code={example.after} />
        </div>
      </div>
    </section>
  );
}

function CodePane({ variant, code }: { variant: 'before' | 'after'; code: string }) {
  const isBefore = variant === 'before';
  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        isBefore ? 'border-critical/25' : 'border-success/25'
      }`}
    >
      <div
        className={`flex items-center justify-between px-3 py-2 ${
          isBefore ? 'bg-critical/10' : 'bg-success/10'
        }`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isBefore ? 'text-critical' : 'text-success'
          }`}
        >
          {isBefore ? 'Avoid' : 'Prefer'}
        </span>
        {!isBefore && <CopyButton value={code} label="code example" withText />}
      </div>
      <pre className="overflow-x-auto bg-canvas-deep/60 p-4">
        <code className="font-mono text-xs leading-relaxed text-ink-muted">{code}</code>
      </pre>
    </div>
  );
}
