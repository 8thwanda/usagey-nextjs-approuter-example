"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isAPIKeySet, setIsAPIKeySet] = useState(false);
  
  // Check if API key is set
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_USAGEY_API_KEY;
    setIsAPIKeySet(!!apiKey && apiKey !== 'your_api_key_here');
  }, []);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Usagey + Next.js App Router Example
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Demonstration of integrating Usagey for usage-based pricing in a Next.js application with App Router
        </p>
        
        {!isAPIKeySet && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-2xl mx-auto">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  API Key Not Configured
                </p>
                <p className="mt-2 text-sm text-yellow-700">
                  Please set your Usagey API key in the <code className="bg-yellow-100 px-1 py-0.5 rounded">.env.local</code> file 
                  to enable full functionality of this example.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Usage Tracking Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Track Usage</h2>
          <p className="text-gray-600 mb-6">
            Send usage events to Usagey to track how your customers are using your application.
          </p>
          <Link href="/usage-tracking" className="btn btn-primary inline-block">
            View Demo
          </Link>
        </div>

        {/* Usage Dashboard Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Usage Dashboard</h2>
          <p className="text-gray-600 mb-6">
            View your usage data with charts and visualizations to understand consumption patterns.
          </p>
          <Link href="/usage-dashboard" className="btn btn-primary inline-block">
            View Demo
          </Link>
        </div>

        {/* Pricing Plans Card */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Pricing Plans</h2>
          <p className="text-gray-600 mb-6">
            Implement flexible pricing tiers and see how they affect billing based on usage.
          </p>
          <Link href="/pricing-demo" className="btn btn-primary inline-block">
            View Demo
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">How To Use This Example</h2>
        <div className="space-y-4">
          <p className="text-gray-700">
            This example demonstrates how to integrate the Usagey SDK into a Next.js application with App Router for tracking usage
            and implementing usage-based pricing.
          </p>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Getting Started:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Copy <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local.example</code> to <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> and add your Usagey API key</li>
              <li>Run <code className="bg-gray-100 px-1 py-0.5 rounded">npm install</code> to install dependencies</li>
              <li>Run <code className="bg-gray-100 px-1 py-0.5 rounded">npm run dev</code> to start the development server</li>
              <li>Explore each demo page to see the Usagey functionality in action</li>
            </ol>
          </div>

          <p className="text-gray-700">
            Check out the source code to see how each feature is implemented. The main functionality is in the 
            <code className="bg-gray-100 px-1 py-0.5 rounded ml-1">lib/usagey-client.ts</code> file and the individual page components.
          </p>
          
          <p className="text-gray-700">
            For more information, visit the <a href="https://www.npmjs.com/package/usagey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Usagey NPM package</a> or 
            read the <a href="https://usagey.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">official documentation</a>.
          </p>
        </div>
      </div>
    </div>
  );
}