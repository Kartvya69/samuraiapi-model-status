import { startBackgroundMonitoring } from './modelService';

// Flag to ensure bootstrap only runs once
let isBootstrapped = false;

export async function initializeApp() {
  if (isBootstrapped) {
    console.log('🔄 App already bootstrapped');
    return;
  }

  console.log('🚀 Initializing Model Status Monitor...');
  
  try {
    isBootstrapped = true;
    
    // Start background monitoring immediately
    await startBackgroundMonitoring();
    
    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    isBootstrapped = false;
    throw error;
  }
}

// Auto-initialize when this module is imported (server-side)
if (typeof window === 'undefined') {
  // For serverless environments, don't auto-initialize
  // The initialization will happen on first API call instead
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
  
  if (!isServerless) {
    // Only run on traditional server environments
    setTimeout(() => {
      initializeApp().catch(console.error);
    }, 1000);
  }
}