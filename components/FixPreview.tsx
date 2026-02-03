'use client';

import React, { useState } from 'react';

interface FixExample {
  title: string;
  before: string;
  after: string;
  description: string;
}

const fixExamples: FixExample[] = [
  {
    title: 'Image Alt Text',
    before: '<img src="logo.png">',
    after: '<img src="logo.png" alt="Company Logo">',
    description: 'Add descriptive alt text to images so screen readers can describe them to users.',
  },
  {
    title: 'Color Contrast',
    before: '<p style="color: #ccc; background: #fff">Text</p>',
    after: '<p style="color: #333; background: #fff">Text</p>',
    description: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text) against its background.',
  },
  {
    title: 'ARIA Labels',
    before: '<button><span class="icon"></span></button>',
    after: '<button aria-label="Close dialog"><span class="icon"></span></button>',
    description: 'Add aria-label to buttons without text content so screen readers can announce their purpose.',
  },
  {
    title: 'Form Labels',
    before: '<input type="email" placeholder="Email">',
    after: '<label for="email">Email</label>\n<input id="email" type="email">',
    description: 'Associate form inputs with labels so users understand what information is required.',
  },
];

export default function FixPreview() {
  const [selectedExample, setSelectedExample] = useState(0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        💡 Fix Examples
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        See how to fix common accessibility issues with before and after examples.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {fixExamples.map((example, index) => (
          <button
            key={index}
            onClick={() => setSelectedExample(index)}
            className={`p-3 rounded-lg text-left transition-all ${
              selectedExample === index
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="font-medium text-sm">{example.title}</div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {fixExamples[selectedExample].title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {fixExamples[selectedExample].description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-600 dark:text-red-400 text-xl">❌</span>
              <h4 className="font-semibold text-gray-900 dark:text-white">Before</h4>
            </div>
            <pre className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-red-900 dark:text-red-300">
                {fixExamples[selectedExample].before}
              </code>
            </pre>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
              <h4 className="font-semibold text-gray-900 dark:text-white">After</h4>
            </div>
            <pre className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-green-900 dark:text-green-300">
                {fixExamples[selectedExample].after}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
