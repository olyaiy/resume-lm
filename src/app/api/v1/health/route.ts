import { NextResponse } from 'next/server';

/**
 * GET /api/v1/health
 * Health check endpoint for deployment monitoring
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    service: 'resume-lm-api',
    environment: process.env.NODE_ENV || 'development',
  });
}
