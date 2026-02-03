'use client';

import React, { useState } from 'react';
import type { AccessibilityIssue } from '@/types/accessibility';

interface IssueCardProps {
  issue: AccessibilityIssue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-300';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-500 text-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'images':
        return '🖼️';
      case 'contrast':
        return '🎨';
      case 'aria':
        return '♿';
      default:
        return '⚠️';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'images':
        return 'Images';
      case 'contrast':
        return 'Color Contrast';
      case 'aria':
        return 'ARIA & Labels';
      default:
        return 'Other';
    }
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 mb-4 transition-all ${getSeverityColors(issue.severity)}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        aria-expanded={isExpanded}
        aria-controls={`issue-details-${issue.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" role="img" aria-label={getCategoryLabel(issue.category)}>
                {getCategoryIcon(issue.category)}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                {getCategoryLabel(issue.category)}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-white/50 dark:bg-black/20">
                {issue.impact} Impact
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{issue.title}</h3>
            <p className="text-sm opacity-90">{issue.description}</p>
          </div>
          <div className="flex-shrink-0">
            <svg
              className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div id={`issue-details-${issue.id}`} className="mt-4 pt-4 border-t border-current/20">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span>💡</span> How to Fix
              </h4>
              <p className="text-sm bg-white/50 dark:bg-black/20 p-3 rounded">
                {issue.fix}
              </p>
            </div>

            {issue.elements && issue.elements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>🔍</span> Affected Elements ({issue.elements.length})
                </h4>
                <div className="space-y-2">
                  {issue.elements.map((element, index) => (
                    <code
                      key={index}
                      className="block text-xs bg-white/50 dark:bg-black/20 p-2 rounded overflow-x-auto"
                    >
                      {element}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {issue.helpUrl && (
              <div>
                <a
                  href={issue.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                >
                  <span>📚</span> Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
