import { UsageyClient } from 'usagey';

const getUsageyClient = (): UsageyClient => {
  const apiKey = process.env.USAGEY_API_KEY;
  
  if (!apiKey) {
    throw new Error('Usagey API key is not defined. Please set USAGEY_API_KEY environment variable.');
  }
  
  return new UsageyClient(apiKey, {
    baseUrl: process.env.USAGEY_API_URL || 'https://api.usagey.com',
  });
};

export async function POST(request: Request) {
  try {
    const { eventType, quantity = 1, metadata } = await request.json();
    
    if (!eventType) {
      return Response.json({ error: 'Event type is required' }, { status: 400 });
    }

    const client = getUsageyClient();
    const result = await client.trackEvent(eventType, quantity, metadata);
    
    return Response.json(result);
  } catch (error) {
    console.error('Error tracking event:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
