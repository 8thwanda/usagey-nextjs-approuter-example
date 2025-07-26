"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getUsageStats, getUsageEvents } from '@/lib/usagey-client';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Type definitions
interface UsageStats {
  currentUsage: number;
  limit: number;
  percentage: number;
  plan: string;
}

interface UsageEvent {
  id?: string;
  eventType: string;
  quantity: number;
  timestamp: string;
  metadata: Record<string, any>;
}

interface ChartData {
  name?: string;
  date?: string;
  value: number;
}

// Constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'] as const;

const DEFAULT_USAGE_STATS: UsageStats = {
  currentUsage: 0,
  limit: 1000,
  percentage: 0,
  plan: 'Free'
};

export default function UsageDashboard() {
  // State with proper typing
  const [usageStats, setUsageStats] = useState<UsageStats>(DEFAULT_USAGE_STATS);
  const [recentEvents, setRecentEvents] = useState<UsageEvent[]>([]);
  const [eventsByType, setEventsByType] = useState<ChartData[]>([]);
  const [dailyUsage, setDailyUsage] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (mounted) {
      fetchDashboardData();
    }
  }, [mounted]);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch usage stats and events in parallel
      const [statsResponse, eventsResponse] = await Promise.all([
        getUsageStats(),
        getUsageEvents({ limit: 10 })
      ]);
      
      // Set usage stats with fallback
      setUsageStats(statsResponse?.usage || DEFAULT_USAGE_STATS);
      
      if (eventsResponse?.data && Array.isArray(eventsResponse.data)) {
        setRecentEvents(eventsResponse.data);
        processEventData(eventsResponse.data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch usage data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Process event data for charts
  const processEventData = (events: UsageEvent[]): void => {
    // Group by event type for pie chart
    const typeMap = new Map<string, number>();
    
    events.forEach(event => {
      const count = typeMap.get(event.eventType) || 0;
      typeMap.set(event.eventType, count + event.quantity);
    });
    
    const eventTypeData: ChartData[] = Array.from(typeMap.entries()).map(([eventType, value]) => ({
      name: eventType,
      value
    }));
    
    setEventsByType(eventTypeData);
    
    // Group by day for bar chart (last 7 days)
    const dailyMap = new Map<string, number>();
    
    // Initialize last 7 days with 0 values
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      dailyMap.set(dateStr, 0);
    }
    
    // Populate with actual event data
    events.forEach(event => {
      const eventDate = new Date(event.timestamp);
      if (!isNaN(eventDate.getTime())) {
        const dateStr = format(eventDate, 'yyyy-MM-dd');
        if (dailyMap.has(dateStr)) {
          const count = dailyMap.get(dateStr) || 0;
          dailyMap.set(dateStr, count + event.quantity);
        }
      }
    });
    
    const dailyData: ChartData[] = Array.from(dailyMap.entries()).map(([date, value]) => ({
      date: format(new Date(date), 'MMM dd'),
      value
    }));
    
    setDailyUsage(dailyData);
  };

  // Generate mock data for demonstration
  const getMockData = () => {
    const mockStats: UsageStats = {
      currentUsage: 485,
      limit: 1000,
      percentage: 48.5,
      plan: 'Starter'
    };
    
    const mockEventTypes: ChartData[] = [
      { name: 'api_call', value: 312 },
      { name: 'data_processing', value: 86 },
      { name: 'storage', value: 42 },
      { name: 'compute', value: 45 }
    ];
    
    const mockDailyUsage: ChartData[] = [
      { date: 'Jul 19', value: 65 },
      { date: 'Jul 20', value: 78 },
      { date: 'Jul 21', value: 62 },
      { date: 'Jul 22', value: 80 },
      { date: 'Jul 23', value: 95 },
      { date: 'Jul 24', value: 58 },
      { date: 'Jul 25', value: 47 }
    ];

    const mockEvents: UsageEvent[] = [
      { 
        id: '1',
        eventType: 'api_call', 
        quantity: 1, 
        timestamp: '2025-07-25T15:30:00.000Z', 
        metadata: { endpoint: '/users', method: 'GET', responseTime: '120ms' } 
      },
      { 
        id: '2',
        eventType: 'data_processing', 
        quantity: 5, 
        timestamp: '2025-07-25T15:25:00.000Z', 
        metadata: { size: '2.5MB', processingTime: '45s' } 
      },
      { 
        id: '3',
        eventType: 'storage', 
        quantity: 10, 
        timestamp: '2025-07-25T14:15:00.000Z', 
        metadata: { fileCount: 3, totalSize: '15.2MB' } 
      },
      { 
        id: '4',
        eventType: 'api_call', 
        quantity: 1, 
        timestamp: '2025-07-25T13:30:00.000Z', 
        metadata: { endpoint: '/products', method: 'POST', payload: '1.2KB' } 
      },
      { 
        id: '5',
        eventType: 'compute', 
        quantity: 3, 
        timestamp: '2025-07-25T12:45:00.000Z', 
        metadata: { duration: '5m12s', cpuUsage: '45%' } 
      },
    ];
    
    return { mockStats, mockEventTypes, mockDailyUsage, mockEvents };
  };
  
  // Determine if we should show mock data
  const shouldShowMockData = !usageStats.currentUsage && recentEvents.length === 0 && !isLoading;
  const { mockStats, mockEventTypes, mockDailyUsage, mockEvents } = shouldShowMockData ? getMockData() : {
    mockStats: null,
    mockEventTypes: [],
    mockDailyUsage: [],
    mockEvents: []
  };

  // Get display data based on whether we're showing mock or real data
  const displayStats = shouldShowMockData ? mockStats! : usageStats;
  const displayEventTypes = shouldShowMockData ? mockEventTypes : eventsByType;
  const displayDailyUsage = shouldShowMockData ? mockDailyUsage : dailyUsage;
  const displayEvents = shouldShowMockData ? mockEvents : recentEvents;

  // Don't render charts until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Usage Dashboard</h1>
        <p className="text-gray-600">
          {shouldShowMockData 
            ? 'Example dashboard with mock data to demonstrate Usagey analytics capabilities.'
            : 'Real-time view of your usage metrics tracked with Usagey.'}
        </p>
        
        {shouldShowMockData && (
          <div className="mt-2 text-sm text-gray-500">
            Note: This is sample data. Track real events from the Usage Tracking page to see your actual data.
          </div>
        )}
      </header>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20" role="status" aria-label="Loading">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <span className="sr-only">Loading dashboard data...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Usage Overview Card */}
          <section className="bg-white rounded-lg shadow-sm border p-6" aria-labelledby="usage-overview">
            <h2 id="usage-overview" className="text-xl font-semibold mb-4">Usage Overview</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    {displayStats.currentUsage.toLocaleString()} / {displayStats.limit.toLocaleString()} units
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {displayStats.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${Math.min(displayStats.percentage, 100)}%` }}
                    role="progressbar"
                    aria-valuenow={displayStats.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Usage: ${displayStats.percentage.toFixed(1)}%`}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900">
                  {displayStats.plan}
                </span>
                <span className="text-sm text-gray-500">Current Plan</span>
              </div>
            </div>
          </section>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Usage Chart */}
            <section className="bg-white rounded-lg shadow-sm border p-6" aria-labelledby="daily-usage">
              <h2 id="daily-usage" className="text-xl font-semibold mb-4">Daily Usage</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayDailyUsage}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Usage Units']}
                      labelFormatter={(label: string) => `Date: ${label}`}
                    />
                    <Bar 
                      dataKey="value" 
                      name="Usage Units" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Event Type Distribution */}
            <section className="bg-white rounded-lg shadow-sm border p-6" aria-labelledby="event-distribution">
              <h2 id="event-distribution" className="text-xl font-semibold mb-4">Event Type Distribution</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayEventTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {displayEventTypes.map((entry, index) => (
                        <Cell 
                          key={`cell-${entry.name}-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Recent Events Table */}
          <section className="bg-white rounded-lg shadow-sm border p-6" aria-labelledby="recent-events">
            <h2 id="recent-events" className="text-xl font-semibold mb-4">Recent Events</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metadata
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayEvents.length > 0 ? (
                    displayEvents.map((event, index) => (
                      <tr key={event.id || `event-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {event.eventType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <time dateTime={event.timestamp}>
                            {new Date(event.timestamp).toLocaleString()}
                          </time>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <details className="group">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs">
                              View metadata
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-lg font-medium text-gray-900 mb-1">No usage events yet</p>
                          <p className="text-gray-500">Try sending some events from the Usage Tracking page to see your data here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}