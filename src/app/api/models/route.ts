import { NextResponse } from 'next/server';
import { testAllModels, getFreshResponse } from '@/lib/modelService';

export async function GET() {
  try {
    const apiStart = Date.now();
    console.log('🌐 INSTANT API: Fresh model testing request received');
    
    // Test all models instantly with maximum parallelization
    const modelStatuses = await testAllModels();
    
    // Generate fresh response
    const response = getFreshResponse(modelStatuses);
    
    const apiDuration = Date.now() - apiStart;
    console.log(`⚡ INSTANT API COMPLETE: Tested ${response.stats.total} models in ${apiDuration}ms`);
    console.log(`📊 RESULTS: ${response.stats.online} online, ${response.stats.offline} offline (${response.stats.uptime}% uptime)`);
    
    // Return fresh data immediately
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    nextResponse.headers.set('X-Tested-At', new Date().toISOString());
    nextResponse.headers.set('X-Test-Duration', apiDuration.toString());
    
    return nextResponse;
  } catch (error) {
    console.error('❌ INSTANT API ERROR:', error);
    return NextResponse.json({ 
      error: 'Failed to test models',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}