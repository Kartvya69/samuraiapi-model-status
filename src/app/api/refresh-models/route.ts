import { NextResponse } from 'next/server';
import { fetchAvailableModels, getAvailableModels, checkAllModels } from '@/lib/modelService';
import '@/lib/bootstrap'; // This ensures monitoring starts when the server boots

export async function POST() {
  try {
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