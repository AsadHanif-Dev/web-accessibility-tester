'use client';

import { useState } from 'react';
import UrlInput from '@/components/UrlInput';
import ScoreDisplay from '@/components/ScoreDisplay';
import IssueList from '@/components/IssueList';
import FixPreview from '@/components/FixPreview';
import type { ScanResult } from '@/types/accessibility';

interface ScanResultWithWarning extends ScanResult {
  warning?: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultWithWarning | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to scan URL';
        const errorDetails = data.details ? ` (${data.details})` : '';
        throw new Error(errorMessage + errorDetails);
      }

      setScanResult(data);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'An error occurred while scanning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ♿ Visual Web Accessibility Tester
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Scan any website to identify accessibility issues and get actionable recommendations
            to make the web more inclusive for everyone.
          </p>
        </div>

        {/* URL Input */}
        <div className="mb-8">
          <UrlInput onScan={handleScan} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <svg
                className="animate-spin h-12 w-12 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Scanning website for accessibility issues...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This may take up to 30 seconds
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                  Scan Failed
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <button
                  onClick={handleClear}
                  className="mt-3 text-sm font-medium text-red-800 dark:text-red-300 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {scanResult && !isLoading && (
          <div className="space-y-8">
            {/* Demo Data Warning */}
            {scanResult.warning && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                      Demo Mode
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">{scanResult.warning}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                      Note: The API may be rate-limited. Try again in a few moments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success indicator for real data */}
            {!scanResult.warning && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                      Live Scan Complete
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Results powered by Google PageSpeed Insights (Lighthouse)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Clear button */}
            <div className="flex justify-end">
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Clear Results
              </button>
            </div>

            {/* Score */}
            <ScoreDisplay result={scanResult} />

            {/* Fix Examples */}
            {scanResult.issues.length > 0 && <FixPreview />}

            {/* Issue List */}
            <IssueList issues={scanResult.issues} />
          </div>
        )}

        {/* Info cards when no scan is active */}
        {!isLoading && !scanResult && !error && (
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-Time Scanning
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uses Google PageSpeed Insights API (powered by Lighthouse) to analyze accessibility issues in real-time.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Actionable Fixes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get clear, practical suggestions for fixing each issue with code examples and
                best practices.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Visual Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View categorized issues with severity levels, affected elements, and detailed
                descriptions.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
