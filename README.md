# Visual Web Accessibility Tester

A web accessibility testing tool built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**. Scan any public URL against the WCAG rules Lighthouse checks, ranked by how much damage each failure does, with the affected selectors and a concrete fix for every finding.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAsadHanif-Dev%2Fweb-accessibility-tester&env=GOOGLE_PAGESPEED_API_KEY&envDescription=Optional%20PageSpeed%20Insights%20key%20for%20higher%20rate%20limits&envLink=https%3A%2F%2Fdevelopers.google.com%2Fspeed%2Fdocs%2Finsights%2Fv5%2Fget-started)

## ✨ Features

- 🔍 **Real Lighthouse audits** — runs the accessibility category of Lighthouse through the Google PageSpeed Insights API, for desktop or mobile
- 📊 **Impact-ranked results** — issues are sorted by the audit weight Lighthouse assigns them and graded Critical / Serious / Moderate / Minor
- 🧭 **Six issue areas** — Images & media, Colour contrast, Names & ARIA, Forms, Structure, Other
- 💡 **Actionable fixes** — every finding carries the affected selectors, the DOM snippet, a concrete remediation, and a link to the rule documentation
- 🔎 **Search & filter** — free-text search across titles, descriptions and selectors, plus severity and area filters with live counts
- 📥 **Export** — download the report as JSON or Markdown, or copy the Markdown straight to the clipboard
- 🕒 **Scan history** — the last six scans are kept in `localStorage` and re-runnable in one click
- 🌘 **Light & dark themes** — follows the system setting, overridable, with no flash on load
- ♿ **Accessible by construction** — skip link, visible focus rings, live regions, real disclosure semantics, keyboard-navigable tabs, and `prefers-reduced-motion` support

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn**

### Installation

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

An API key is optional — without one you share Google's anonymous quota, and the app falls back to clearly-labelled demo data when that quota is exhausted. To use your own:

```bash
cp .env.example .env.local
# then set GOOGLE_PAGESPEED_API_KEY
```

## 📦 Project Structure

```
web-accessiblity-tester/
├── app/
│   ├── api/scan/route.ts        # PageSpeed Insights proxy + audit normalisation
│   ├── globals.css              # Design tokens (light/dark) and component classes
│   ├── layout.tsx               # Fonts, metadata, no-flash theme script, skip link
│   └── page.tsx                 # Scan orchestration, history, page composition
├── components/
│   ├── UrlInput.tsx             # URL field, device toggle, example shortcuts
│   ├── ScoreDisplay.tsx         # Score gauge, severity breakdown, export actions
│   ├── IssueList.tsx            # Search, severity and area filters
│   ├── IssueCard.tsx            # Expandable finding with elements and fix
│   ├── FixPreview.tsx           # Before/after reference patterns
│   ├── ScanSkeleton.tsx         # Loading skeleton with progress copy
│   ├── RecentScans.tsx          # localStorage-backed scan history
│   ├── ThemeToggle.tsx          # Light/dark switch
│   └── ui/                      # Icon set and CopyButton primitive
├── lib/
│   ├── issue-meta.ts            # Severity/category metadata and score bands
│   └── report.ts                # Markdown rendering and file download
├── types/accessibility.ts       # Shared TypeScript interfaces
└── tailwind.config.ts           # Token-driven Tailwind theme
```

## 🎯 How to Use

1. **Enter a URL** — the scheme is optional (`example.com` works); press <kbd>/</kbd> anywhere to focus the field
2. **Pick a device profile** — desktop or mobile, which changes how Lighthouse renders the page
3. **Run the scan** — typically 10–30 seconds
4. **Read the score** — the gauge shows 0–100, with the severity breakdown and pass counts beneath it
5. **Filter and search** — narrow by severity or area, or search titles, descriptions and selectors
6. **Expand an issue** — for the fix, the affected elements (copyable), the audit id, and the rule documentation
7. **Export** — copy or download the report as Markdown or JSON
8. **Re-run** — pick any recent scan to run it again

## 🧩 Key Components

| Component | Responsibility |
| --- | --- |
| `UrlInput` | URL normalisation and validation, desktop/mobile toggle, example shortcuts, `/` focus shortcut |
| `ScoreDisplay` | Animated score gauge, severity breakdown bar, pass/manual/not-applicable counts, export actions |
| `IssueList` | Free-text search, severity and area filters with live counts, filter reset |
| `IssueCard` | Disclosure with the fix, copyable selectors and snippets, audit id, documentation link |
| `FixPreview` | Six before/after reference patterns as a keyboard-navigable tablist |
| `ScanSkeleton` | Shimmer skeleton and a polite live region describing scan progress |
| `RecentScans` | The last six scans from `localStorage`, each re-runnable |
| `ThemeToggle` | Light/dark switch persisted to `localStorage` |

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4 over CSS custom-property design tokens
- **Accessibility testing**: Google PageSpeed Insights API (Lighthouse)
- **Deployment**: Vercel-ready — HTTP only, no Chrome binary required

## 📝 API Endpoint

### POST `/api/scan`

**Request body**:

```json
{
  "url": "https://example.com",
  "strategy": "desktop"
}
```

`strategy` is optional, defaults to `desktop`; the only other value is `mobile`.

**Response**:

```json
{
  "url": "https://example.com/",
  "finalUrl": "https://example.com/",
  "strategy": "desktop",
  "timestamp": 1234567890,
  "score": 85,
  "summary": { "passed": 24, "notApplicable": 19, "manual": 10 },
  "issues": [
    {
      "id": "image-alt-3",
      "auditId": "image-alt",
      "title": "Image elements do not have [alt] attributes",
      "description": "…",
      "severity": "critical",
      "category": "images",
      "weight": 10,
      "elements": [{ "selector": "header > img", "snippet": "<img src='/logo.png'>" }],
      "fix": "Give every <img> an alt attribute…",
      "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/image-alt"
    }
  ]
}
```

**Severity** is derived from the Lighthouse audit weight: `>= 7` critical, `>= 3` serious, `> 0` moderate, otherwise minor.

If PageSpeed Insights is unreachable or rate-limited, the route still responds `200`, with demo data plus a `warning` string and `isMockData: true` so the UI can label it clearly.

## 🎨 Customization

### Theme

Colours are CSS custom properties defined once in [app/globals.css](app/globals.css) — `:root` for light, `.dark` for the overrides — and exposed to Tailwind as semantic names (`bg-surface`, `text-ink-muted`, `text-critical`) in [tailwind.config.ts](tailwind.config.ts). Change a token and both themes follow.

### Categories, fixes and severity

Audit-to-area mapping, remediation copy, and severity thresholds live in [app/api/scan/route.ts](app/api/scan/route.ts); their display labels live in [lib/issue-meta.ts](lib/issue-meta.ts).

### Fix examples

Add entries to `FIX_EXAMPLES` in [components/FixPreview.tsx](components/FixPreview.tsx).

## 🚧 Limitations & Future Enhancements

### Current limitations

- Automated tools catch roughly a third of accessibility barriers — pair this with keyboard and screen reader testing
- Scans publicly reachable URLs only; no authentication for protected pages
- Google's anonymous quota is shared and easily exhausted; supply an API key for reliable live scans

### Potential enhancements

- [x] API key configuration for higher rate limits
- [x] Export reports as JSON/Markdown
- [x] Historical scan tracking
- [ ] Batch URL scanning
- [ ] Score trends over time
- [ ] Element highlighting with screenshots
- [ ] CI/CD integration

## 🚀 Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

The app makes plain HTTP requests to the PageSpeed Insights API, so no Chrome/Chromium is needed on the host.

### Other platforms

Works on any Node.js host:

- **Netlify**: `npm run build && npm start`
- **Railway**: connect the GitHub repo, auto-deploys
- **Render**: Node.js web service
- **Heroku**: add a `Procfile` with `web: npm start`

### Environment variables

```env
GOOGLE_PAGESPEED_API_KEY=your_api_key_here
```

Optional, but recommended in production. Get a free key at <https://developers.google.com/speed/docs/insights/v5/get-started>.

## 📚 Resources

- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [W3C evaluation guide](https://www.w3.org/WAI/test-evaluate/)
- [Google Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

## 📄 License

MIT License — free to use for learning or commercial purposes.

---

**Made with ♿ and ❤️ for a more accessible web**
