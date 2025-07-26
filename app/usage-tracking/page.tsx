"use client";

import { useState } from 'react';
import { trackEvent } from '@/lib/usagey-client';
import { toast } from 'sonner';

export default function UsageTracking() {
  const [eventType, setEventType] = useState('api_call');
  const [quantity, setQuantity] = useState(1);
  const [customEventType, setCustomEventType] = useState('');
  const [endpoint, setEndpoint] = useState('/users');
  const [method, setMethod] = useState('GET');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Predefined event types
  const eventTypes = [
    'api_call',
    'data_processing',
    'storage',
    'compute',
    'custom'
  ];

  // Handle tracking event
  const handleTrackEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    const finalEventType = eventType === 'custom' ? customEventType : eventType;
    
    try {
      const result = await trackEvent(
        finalEventType, 
        quantity, 
        { endpoint, method }
      );
      
      setResult(result);
      toast.success('Event tracked successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Usage Tracking Demo</h1>
        <p className="text-gray-600">
          This demo shows how to track usage events with Usagey. Fill out the form below to send a usage event.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Track Usage Event</h2>
          
          <form onSubmit={handleTrackEvent} className="space-y-4">
            <div>
              <label htmlFor="eventType" className="label">Event Type</label>
              <select 
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="input"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {eventType === 'custom' && (
              <div>
                <label htmlFor="customEventType" className="label">Custom Event Type</label>
                <input
                  id="customEventType"
                  type="text"
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  placeholder="e.g., file_upload"
                  required={eventType === 'custom'}
                  className="input"
                />
              </div>
            )}

            <div>
              <label htmlFor="quantity" className="label">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                required
                className="input"
              />
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-medium mb-2">Metadata (Optional)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="endpoint" className="label">Endpoint</label>
                  <input
                    id="endpoint"
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/users"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="method" className="label">Method</label>
                  <select 
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="input"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading || (eventType === 'custom' && !customEventType)}
            >
              {isLoading ? 'Tracking...' : 'Track Usage Event'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          
          {isLoading && (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {!isLoading && error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-500">{error}</p>
            </div>
          )}
          
          {!isLoading && !error && !result && (
            <div className="py-20 text-center text-gray-400">
              <p>Submit the form to see the result</p>
            </div>
          )}
          
          {!isLoading && result && (
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-green-700 font-medium">Event tracked successfully!</p>
              </div>
              
              <h3 className="font-medium text-lg">Response:</h3>
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>

              <div className="mt-4">
                <h3 className="font-medium text-lg mb-2">Tracking Details:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="font-medium">Event Type:</span> 
                    <span className="ml-2">{eventType === 'custom' ? customEventType : eventType}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="font-medium">Quantity:</span>
                    <span className="ml-2">{quantity}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="font-medium">Endpoint:</span> 
                    <span className="ml-2">{endpoint}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="font-medium">Method:</span> 
                    <span className="ml-2">{method}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <p>This demo uses the Usagey SDK to track usage events. The implementation follows these steps:</p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Import the <code className="bg-gray-100 px-1 py-0.5 rounded">trackEvent</code> function from our client library</li>
            <li>Collect event details through a form (event type, quantity, metadata)</li>
            <li>Call <code className="bg-gray-100 px-1 py-0.5 rounded">trackEvent()</code> with the provided parameters</li>
            <li>Display the API response, which includes confirmation and usage statistics</li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-md mt-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Code Example</h3>
            <pre className="bg-white p-4 rounded-md overflow-x-auto text-sm">
{`import { trackEvent } from '@/lib/usagey-client';

// Track a usage event
const result = await trackEvent(
  'api_call',   // Event type
  1,            // Quantity
  {             // Metadata (optional)
    endpoint: '/users',
    method: 'GET' 
  }
);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}