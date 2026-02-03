'use client';

import React from 'react';
import type { ScanResult } from '@/types/accessibility';

interface ScoreDisplayProps {
  result: ScanResult;
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-critical';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Accessibility Score
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scanned: {new URL(result.url).hostname}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
            {getScoreLabel(result.score)}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Found <span className="font-semibold">{result.issues.length}</span> accessibility {result.issues.length === 1 ? 'issue' : 'issues'}
        </p>
      </div>
    </div>
  );
}
