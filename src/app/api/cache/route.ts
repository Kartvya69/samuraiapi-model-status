import { NextResponse } from 'next/server';
import { getCachedResponse, ensureMonitoringStarted } from '@/lib/modelService';

export async function GET() {
  try {
    // Ensure monitoring is started before serving data
    await ensureMonitoringStarted();
    
    const cachedResponse = getCachedResponse();
    
    // Return only cache info without model data for lightweight requests
    return NextResponse.json({
      cache: cachedResponse.cache,
      stats: cachedResponse.stats
    });
  } catch (error) {
    console.error('Error getting cache info:', error);
    return NextResponse.json({ error: 'Failed to get cache info' }, { status: 500 });
  }
}