/**
 * Track a usage event
 */
export async function trackEvent(eventType: string, quantity: number = 1, metadata?: Record<string, any>) {
  try {
    const response = await fetch('/api/usage/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventType, quantity, metadata }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to track event');
    }

    return response.json();
  } catch (error) {
    console.error('Error tracking event:', error);
    throw error;
  }
}

/**
 * Get usage statistics
 */
export async function getUsageStats() {
  try {
    const response = await fetch('/api/usage/stats');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get usage stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting usage stats:', error);
    throw error;
  }
}

/**
 * Get recent usage events
 */
export async function getUsageEvents(options?: {
  eventType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  try {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`/api/usage/events?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get usage events');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting usage events:', error);
    throw error;
  }
}
