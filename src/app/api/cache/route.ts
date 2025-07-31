import { NextResponse } from 'next/server';
import { getAvailableModelsList } from '@/lib/modelService';

export async function GET() {
  try {
    const models = getAvailableModelsList();
    
    // Return basic info about available models
    return NextResponse.json({
      modelCount: models.length,
      message: 'No cache - fresh testing on every request',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting model info:', error);
    return NextResponse.json({ error: 'Failed to get model info' }, { status: 500 });
  }
}