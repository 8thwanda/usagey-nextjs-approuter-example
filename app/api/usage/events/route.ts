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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    const options = {
      ...(eventType && { eventType }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(limit && { limit: parseInt(limit, 10) }),
    };

    const client = getUsageyClient();
    const events = await client.getUsageEvents(options);
    
    return Response.json(events);
  } catch (error) {
    console.error('Error getting usage events:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
