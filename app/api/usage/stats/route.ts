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

export async function GET() {
  try {
    const client = getUsageyClient();
    const stats = await client.getUsageStats();
    
    return Response.json(stats);
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
