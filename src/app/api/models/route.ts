import { NextResponse } from 'next/server';
import { getModelStatuses } from '@/lib/modelService';
import '@/lib/bootstrap'; // This ensures monitoring starts when the server boots

export async function GET() {
  try {
    const statuses = getModelStatuses();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error getting model statuses:', error);
    return NextResponse.json({ error: 'Failed to get model statuses' }, { status: 500 });
  }
}