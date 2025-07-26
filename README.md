# Usagey Next.js App Router Example

This is an example application demonstrating how to integrate [Usagey](https://www.npmjs.com/package/usagey) with a Next.js project using the App Router architecture.

## What is Usagey?

Usagey is a complete toolkit for implementing usage-based pricing in your applications. It provides:

- Real-time usage tracking
- Flexible pricing models (per-unit, tiered, hybrid)
- Automated billing
- Analytics and reporting

## Features Demonstrated

This example application demonstrates:

1. **Usage Tracking**: How to track usage events in your application
2. **Usage Dashboard**: How to view and analyze usage data
3. **Pricing Models**: How to implement different pricing models
4. **Billing Simulation**: How billing is calculated based on usage

## Getting Started

### Prerequisites

- Node.js 18.17.0 or newer
- npm or yarn

### Installation

1. Clone this repository

```bash
git clone https://github.com/8thwanda/usagey-nextjs-approuter-example.git
cd usagey-nextjs-approuter-example
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Set up your environment variables

```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` to add your Usagey API key

```bash
# Server-side API key (not exposed to the client)
USAGEY_API_KEY=your_api_key_here
USAGEY_API_URL=https://api.usagey.com  # Optional
```

5. Start the development server

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
.
├── app/                # Next.js app directory
│   ├── api/           # API routes
│   │   └── usage/     # Usagey API endpoints
│   │       ├── track/   # Event tracking endpoint
│   │       ├── stats/   # Usage statistics endpoint
│   │       └── events/  # Usage events endpoint
│   ├── usage-tracking/ # Usage tracking demo page
│   ├── usage-dashboard/# Dashboard demo page
│   ├── pricing-demo/   # Pricing models demo page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/                # Library code
│   └── usagey-client.ts  # API client for Usagey endpoints
├── public/             # Static assets
├── .env.local.example  # Example environment variables
└── README.md           # This file
```

## Key Files

- `app/api/usage/*.ts` - Server-side API routes that interact with Usagey SDK
- `lib/usagey-client.ts` - Client-side API wrapper for making requests to our API endpoints
- `app/usage-tracking/page.tsx` - Example of tracking usage events
- `app/usage-dashboard/page.tsx` - Example of displaying usage data
- `app/pricing-demo/page.tsx` - Example of implementing pricing models

## Code Examples

### Server-Side API Routes

```typescript
// app/api/usage/track/route.ts
import { UsageyClient } from 'usagey';

const getUsageyClient = (): UsageyClient => {
  const apiKey = process.env.USAGEY_API_KEY;
  
  return new UsageyClient(apiKey, {
    baseUrl: process.env.USAGEY_API_URL || 'https://api.usagey.com',
  });
};

export async function POST(request: Request) {
  const { eventType, quantity, metadata } = await request.json();
  const client = getUsageyClient();
  const result = await client.trackEvent(eventType, quantity, metadata);
  return Response.json(result);
}
```

### Client-Side API Integration

```typescript
// Tracking a usage event
import { trackEvent } from '@/lib/usagey-client';

await trackEvent(
  'api_call',  // Event type
  1,           // Quantity
  {            // Optional metadata
    endpoint: '/users',
    method: 'GET'
  }
);
```

### Get Usage Statistics

```typescript
// Getting usage statistics
import { getUsageStats } from '@/lib/usagey-client';

const stats = await getUsageStats();
// Returns: { currentUsage, limit, percentage, plan }
```

## Important Notes for App Router

When using Usagey with Next.js App Router, keep these considerations in mind:

1. **Security**: The Usagey API key is  securely stored on server-side using `USAGEY_API_KEY` instead of `NEXT_PUBLIC_USAGEY_API_KEY`.

2. **API Routes**: All Usagey operations are handled through API routes in `app/api/usage/*`, keeping sensitive operations server-side.

3. **Dynamic Imports for Recharts**: When using Recharts for visualization, use dynamic imports with `{ ssr: false }` to prevent SSR issues.

4. **Form Handling**: The application handles all form submissions through the new API routes, ensuring secure communication with the Usagey service.

## Resources

- [Usagey NPM Package](https://www.npmjs.com/package/usagey)
- [Usagey Documentation](https://usagey.com/docs)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)

## License

MIT
