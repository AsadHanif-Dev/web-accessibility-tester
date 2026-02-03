'use client';

import React, { useState } from 'react';
import type { AccessibilityIssue } from '@/types/accessibility';
import IssueCard from './IssueCard';

interface IssueListProps {
  issues: AccessibilityIssue[];
}

type CategoryType = 'all' | 'images' | 'contrast' | 'aria' | 'other';
type SeverityType = 'all' | 'critical' | 'warning' | 'success';

export default function IssueList({ issues }: IssueListProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityType>('all');

  const filteredIssues = issues.filter((issue) => {
    const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter;
    const severityMatch = severityFilter === 'all' || issue.severity === severityFilter;
    return categoryMatch && severityMatch;
  });

  const categoryCount = (category: string) => {
    return issues.filter((issue) => issue.category === category).length;
  };

  const severityCount = (severity: string) => {
    return issues.filter((issue) => issue.severity === severity).length;
  };

  if (issues.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
        <span className="text-6xl mb-4 block">✅</span>
        <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
          No Accessibility Issues Found!
        </h3>
        <p className="text-green-700 dark:text-green-400">
          This website appears to meet basic accessibility standards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Accessibility Issues
        </h2>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All ({issues.length})
              </button>
              <button
                onClick={() => setCategoryFilter('images')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  categoryFilter === 'images'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🖼️ Images ({categoryCount('images')})
              </button>
              <button
                onClick={() => setCategoryFilter('contrast')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  categoryFilter === 'contrast'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🎨 Contrast ({categoryCount('contrast')})
              </button>
              <button
                onClick={() => setCategoryFilter('aria')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  categoryFilter === 'aria'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                ♿ ARIA ({categoryCount('aria')})
              </button>
              <button
                onClick={() => setCategoryFilter('other')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  categoryFilter === 'other'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                ⚠️ Other ({categoryCount('other')})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Severity
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSeverityFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  severityFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All ({issues.length})
              </button>
              <button
                onClick={() => setSeverityFilter('critical')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  severityFilter === 'critical'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🔴 Critical ({severityCount('critical')})
              </button>
              <button
                onClick={() => setSeverityFilter('warning')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  severityFilter === 'warning'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🟡 Warning ({severityCount('warning')})
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showing {filteredIssues.length} of {issues.length} issues
        </p>

        {/* Issue cards */}
        <div>
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No issues match the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
