import { NextResponse } from 'next/server';
import { fetchAvailableModels, getAvailableModels, checkAllModels, ensureMonitoringStarted } from '@/lib/modelService';

export async function POST() {
  try {
    // Ensure monitoring is started
    await ensureMonitoringStarted();
    
    await fetchAvailableModels();
    await checkAllModels();
    const models = getAvailableModels();
    
    return NextResponse.json({
      success: true,
      models,
      count: models.length,
      message: 'Model list refreshed successfully'
    });
  } catch (error: any) {
    console.error('Error refreshing models:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}