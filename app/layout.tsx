import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "A11y Scan — Web Accessibility Tester",
  description:
    "Scan any public URL for WCAG accessibility failures and get prioritised, actionable fixes for every issue found.",
  openGraph: {
    title: "A11y Scan — Web Accessibility Tester",
    description:
      "Scan any public URL for WCAG accessibility failures and get prioritised, actionable fixes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090f" },
  ],
};

/**
 * Applies the stored (or system) theme before first paint so the page never
 * flashes the wrong palette.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('a11y-theme');
    var dark = stored ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50
                     focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm
                     focus:font-semibold focus:text-accent-ink"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
