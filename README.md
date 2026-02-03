# Visual Web Accessibility Tester

A modern, frontend-focused web accessibility testing tool built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**. This MVP helps identify and visualize common accessibility issues on any website using Google Lighthouse.

![Visual Web Accessibility Tester](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🔍 **Comprehensive Scanning**: Powered by Google Lighthouse to detect accessibility issues
- 📊 **Visual Reports**: Color-coded severity levels (Critical, Warning, Success)
- 🎨 **Categorized Issues**: Organized by Images, Color Contrast, ARIA, and Other
- 💡 **Actionable Fixes**: Clear suggestions with before/after code examples
- 🔄 **Interactive UI**: Expandable cards, filtering, and responsive design
- ⚡ **Real-time Feedback**: Loading states and error handling
- 📱 **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd web-accessiblity-tester
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## 📦 Project Structure

```
web-accessiblity-tester/
├── app/
│   ├── api/
│   │   └── scan/
│   │       └── route.ts          # Lighthouse scanning API endpoint
│   ├── globals.css               # Global styles with Tailwind
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main page with scan functionality
├── components/
│   ├── UrlInput.tsx              # URL input component with validation
│   ├── ScoreDisplay.tsx          # Accessibility score visualization
│   ├── IssueCard.tsx             # Individual issue card component
│   ├── IssueList.tsx             # Filterable list of issues
│   └── FixPreview.tsx            # Before/after fix examples
├── types/
│   └── accessibility.ts          # TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎯 How to Use

1. **Enter a URL**: Type or paste any website URL into the input field
2. **Click "Scan"**: The tool will analyze the website (takes 10-30 seconds)
3. **View Results**: See the accessibility score and categorized issues
4. **Filter Issues**: Use category and severity filters to focus on specific issues
5. **Expand Details**: Click on any issue card to see:
   - How to fix the issue
   - Affected HTML elements
   - Learn more documentation links
6. **View Fix Examples**: Check the "Fix Examples" section for common patterns
7. **Rescan or Clear**: Use the "Clear Results" button to start over

## 🧩 Key Components

### UrlInput
- Input validation
- Loading states
- Error messages
- Accessible form controls

### ScoreDisplay
- Overall accessibility score (0-100)
- Color-coded status indicator
- Timestamp and URL information

### IssueList
- Category filtering (Images, Contrast, ARIA, Other)
- Severity filtering (Critical, Warning)
- Issue count displays
- Responsive grid layout

### IssueCard
- Expandable/collapsible design
- Severity and category badges
- Fix suggestions
- Affected element snippets
- External documentation links

### FixPreview
- Interactive before/after code examples
- Common accessibility patterns
- Educational resource

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **Accessibility Testing**: Google PageSpeed Insights API (Lighthouse)
- **Deployment**: Vercel-ready (no Chrome required!)

## 📝 API Endpoint

### POST `/api/scan`

Scans a website for accessibility issues using Google PageSpeed Insights API.

**Request Body**:
```json
{
  "url": "https://example.com"
}
```

**Response**:
```json
{
  "url": "https://example.com",
  "timestamp": 1234567890,
  "score": 85,
  "issues": [
    {
      "id": "issue-0",
      "title": "Image elements do not have [alt] attributes",
      "description": "...",
      "severity": "critical",
      "category": "images",
      "impact": "High",
      "elements": ["<img src='...'>"],
      "fix": "Add descriptive alt text to all images...",
      "helpUrl": "https://..."
    }
  ]
}
```

## 🎨 Customization

### Colors
Edit severity colors in [tailwind.config.ts](tailwind.config.ts):
```typescript
colors: {
  critical: "#ef4444",  // Red
  warning: "#f59e0b",   // Yellow
  success: "#10b981",   // Green
}
```

### Categories
Add more categories in [types/accessibility.ts](types/accessibility.ts) and update the mapping in [app/api/scan/route.ts](app/api/scan/route.ts).

### Fix Examples
Add more examples in [components/FixPreview.tsx](components/FixPreview.tsx).

## 🚧 Limitations & Future Enhancements

### Current Limitations
- API-based scanning (uses public Google PageSpeed Insights API)
- Rate-limited by Google (may show demo data if quota exceeded)
- Scans publicly accessible URLs only
- No authentication for protected pages

### Potential Enhancements
- [ ] API key configuration for higher rate limits
- [ ] Export reports as PDF/JSON
- [ ] Historical scan tracking
- [ ] Batch URL scanning
- [ ] Custom accessibility rules
- [ ] Integration with CI/CD pipelines
- [ ] Detailed element highlighting with screenshots
- [ ] Accessibility score trends over time

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/web-accessibility-tester)

**One-Click Deployment:**

1. Click the "Deploy" button above
2. Connect your GitHub account
3. Deploy - that's it! No environment variables needed.

**Manual Deployment:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

The app works perfectly on Vercel because it uses the Google PageSpeed Insights API (HTTP requests only, no Chrome/Chromium needed).

### Deploy to Other Platforms

Works on any Node.js hosting platform:
- **Netlify**: `npm run build && npm start`
- **Railway**: Connect GitHub repo, auto-deploys
- **Render**: Node.js web service
- **Heroku**: Add `Procfile` with `web: npm start`

### Environment Variables (Optional)

For production with higher rate limits, you can add a Google API key:

```env
GOOGLE_PAGESPEED_API_KEY=your_api_key_here
```

Get a free API key at: https://developers.google.com/speed/docs/insights/v5/get-started

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

## 🤝 Contributing

This is an MVP project. Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ♿ and ❤️ for a more accessible web**
