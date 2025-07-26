import { NextRequest, NextResponse } from 'next/server';

// This is a mock API endpoint to simulate usage statistics
// In a real app, you would use the actual Usagey API

export async function GET(request: NextRequest) {
  try {
    // Mock usage statistics
    return NextResponse.json({
      usage: {
        currentUsage: 485,
        limit: 1000,
        percentage: 48.5,
        plan: 'Starter'
      }
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}