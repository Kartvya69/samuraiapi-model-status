import { NextResponse } from 'next/server';
import { testAllModels, getFreshResponse } from '@/lib/modelService';

export async function POST() {
  try {
    console.log('🔄 REFRESH API: Manual refresh requested');
    
    // Test all models fresh
    const modelStatuses = await testAllModels();
    const response = getFreshResponse(modelStatuses);
    
    return NextResponse.json({
      success: true,
      data: response.data,
      stats: response.stats,
      message: 'Fresh model testing completed successfully'
    });
  } catch (error: any) {
    console.error('❌ REFRESH API ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}