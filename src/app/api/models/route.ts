import { NextResponse } from 'next/server';
import { getCachedResponse, ensureMonitoringStarted } from '@/lib/modelService';

export async function GET() {
  try {
    // Ensure monitoring is started before serving data
    await ensureMonitoringStarted();
    
    const cachedResponse = getCachedResponse();
    
    // Add cache headers for better client-side caching
    const response = NextResponse.json(cachedResponse);
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    response.headers.set('X-Cache-Age', cachedResponse.cache.cacheAge.toString());
    response.headers.set('X-Next-Update', cachedResponse.cache.nextUpdate);
    
    console.log(`📡 Served cached data (age: ${cachedResponse.cache.cacheAge}s, stale: ${cachedResponse.cache.isStale})`);
    
    return response;
  } catch (error) {
    console.error('Error getting model statuses:', error);
    return NextResponse.json({ error: 'Failed to get model statuses' }, { status: 500 });
  }
}