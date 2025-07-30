import OpenAI from 'openai';

const API_BASE_URL = 'https://samuraiapi.in/v1';
const API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI client with custom base URL for SamuraiAPI
const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
});

export interface ModelStatus {
  model: string;
  status: 'online' | 'offline' | 'error';
  lastChecked: string;
  response?: string;
  error?: string;
}

export interface CacheInfo {
  lastUpdate: string;
  nextUpdate: string;
  isStale: boolean;
  cacheAge: number; // in seconds
}

export interface CachedResponse {
  data: Record<string, ModelStatus>;
  cache: CacheInfo;
  stats: {
    total: number;
    online: number;
    offline: number;
    uptime: string;
  };
}

// Cache management
let modelStatuses: Record<string, ModelStatus> = {};
let availableModels: string[] = [];
let isMonitoringStarted = false;
let monitoringInterval: NodeJS.Timeout | null = null;
let preloadInterval: NodeJS.Timeout | null = null;
let lastCacheUpdate: Date = new Date();
let cacheMaxAge = 2 * 60 * 1000; // 2 minutes in milliseconds
let isPreloading = false;

// Detect if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;

// Cache utility functions
function getCacheInfo(): CacheInfo {
  const now = new Date();
  const cacheAge = Math.floor((now.getTime() - lastCacheUpdate.getTime()) / 1000);
  const nextUpdate = new Date(lastCacheUpdate.getTime() + cacheMaxAge);
  const isStale = cacheAge > (cacheMaxAge / 1000);

  return {
    lastUpdate: lastCacheUpdate.toISOString(),
    nextUpdate: nextUpdate.toISOString(),
    isStale,
    cacheAge
  };
}

function updateCache() {
  lastCacheUpdate = new Date();
  console.log(`💾 Cache updated at ${lastCacheUpdate.toISOString()}`);
}

function getStats() {
  const entries = Object.values(modelStatuses);
  const total = entries.length;
  const online = entries.filter(s => s.status === 'online').length;
  const offline = total - online;
  const uptime = total > 0 ? ((online / total) * 100).toFixed(1) : '0';

  return { total, online, offline, uptime };
}

export function getCachedResponse(): CachedResponse {
  return {
    data: modelStatuses,
    cache: getCacheInfo(),
    stats: getStats()
  };
}

export async function fetchAvailableModels(): Promise<string[]> {
  try {
    const modelsList = await openai.models.list();

    if (modelsList && modelsList.data) {
      availableModels = modelsList.data.map((model: any) => model.id);
      return availableModels;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error: any) {
    console.error('Failed to fetch models from API:', error.message || error);
    // Fallback to a basic set of common models if API call fails
    availableModels = [
      'gpt-3.5-turbo',
      'gpt-4',
      'claude-3-haiku',
      'claude-3-sonnet',
      'gemini-pro'
    ];
    return availableModels;
  }
}

// Check if a model name suggests it's a chat model
function isChatModel(modelName: string): boolean {
  const chatIndicators = [
    'gpt', 'claude', 'gemini', 'llama', 'mistral', 'qwen', 'deepseek',
    'chat', 'instruct', 'turbo', 'sonnet', 'haiku', 'opus'
  ];
  
  const nonChatIndicators = [
    'tts', 'whisper', 'embedding', 'ada', 'babbage', 'curie', 'davinci',
    'dall-e', 'midjourney', 'stable-diffusion', 'clip', 'codex'
  ];
  
  const lowerName = modelName.toLowerCase();
  
  // If it explicitly contains non-chat indicators, it's not a chat model
  if (nonChatIndicators.some(indicator => lowerName.includes(indicator))) {
    return false;
  }
  
  // If it contains chat indicators, it's likely a chat model
  if (chatIndicators.some(indicator => lowerName.includes(indicator))) {
    return true;
  }
  
  // Default to assuming it's a chat model for unknown types
  return true;
}

async function testChatModel(modelName: string): Promise<ModelStatus> {
  const completion = await openai.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: 'user',
        content: 'Hello, are you working?'
      }
    ],
    max_tokens: 16, // Increased to 16 to meet minimum requirements for some models
  }, {
    timeout: 60000, // 60 seconds timeout
  });

  return {
    model: modelName,
    status: 'online',
    lastChecked: new Date().toISOString(),
    response: completion.choices?.[0]?.message?.content || 'OK'
  };
}

async function testNonChatModel(modelName: string): Promise<ModelStatus> {
  // For non-chat models, we can try a simple embeddings call or just mark as available
  // Since we can't easily test all model types, we'll mark them as online if they exist
  try {
    // Try to get model details to confirm it exists
    const models = await openai.models.list();
    const modelExists = models.data.some(m => m.id === modelName);
    
    if (modelExists) {
      return {
        model: modelName,
        status: 'online',
        lastChecked: new Date().toISOString(),
        response: 'Model available (non-chat)'
      };
    } else {
      throw new Error('Model not found in API');
    }
  } catch (error: any) {
    throw error;
  }
}

export async function testModel(modelName: string): Promise<ModelStatus> {
  try {
    if (isChatModel(modelName)) {
      const result = await testChatModel(modelName);
      return result;
    } else {
      const result = await testNonChatModel(modelName);
      return result;
    }
  } catch (error: any) {
    let errorMessage = error.message || 'Unknown error';
    
    // Handle OpenAI SDK specific errors
    if (error.status) {
      errorMessage = `HTTP ${error.status}: ${error.message}`;
    }
    
    // If it's a "unknown field 'messages'" error, try testing as non-chat model
    if (errorMessage.includes('unknown field') && isChatModel(modelName)) {
      try {
        const result = await testNonChatModel(modelName);
        return result;
      } catch (retryError: any) {
        errorMessage = retryError.message || 'Unknown error on retry';
      }
    }
    
    return {
      model: modelName,
      status: 'offline',
      lastChecked: new Date().toISOString(),
      error: errorMessage
    };
  }
}

export async function checkAllModels(): Promise<Record<string, ModelStatus>> {
  if (availableModels.length === 0) {
    return modelStatuses;
  }

  const promises = availableModels.map(model => testModel(model));
  const results = await Promise.allSettled(promises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      modelStatuses[availableModels[index]] = result.value;
    } else {
      modelStatuses[availableModels[index]] = {
        model: availableModels[index],
        status: 'error',
        lastChecked: new Date().toISOString(),
        error: (result.reason as Error).message
      };
    }
  });
  
  // Update cache timestamp
  updateCache();
  
  return modelStatuses;
}

export function getModelStatuses(): Record<string, ModelStatus> {
  return modelStatuses;
}

export function getAvailableModels(): string[] {
  return availableModels;
}

// Preload models in background (starts at 60s mark)
async function preloadModels(): Promise<void> {
  if (isPreloading) return;
  
  isPreloading = true;
  try {
    await checkAllModels();
  } catch (error) {
    console.error('❌ Error during model preloading:', error);
  } finally {
    isPreloading = false;
  }
}

// Start background monitoring immediately when the service loads
export async function startBackgroundMonitoring(): Promise<void> {
  if (isMonitoringStarted) {
    return;
  }
  
  // Skip background monitoring in serverless environments
  if (isServerless) {
    console.log('Serverless environment detected, skipping background monitoring');
    return;
  }
  
  isMonitoringStarted = true;
  
  try {
    // Initial setup and first check
    await fetchAvailableModels();
    await checkAllModels();
    
    // Set up main interval for every 2 minutes (120,000 ms)
    monitoringInterval = setInterval(async () => {
      try {
        await checkAllModels();
      } catch (error) {
        console.error('❌ Error during scheduled model check:', error);
      }
    }, 2 * 60 * 1000);
    
    // Set up pre-emptive loading at 60s mark
    preloadInterval = setInterval(async () => {
      try {
        await preloadModels();
      } catch (error) {
        console.error('❌ Error during model preloading:', error);
      }
    }, 2 * 60 * 1000);
    
    // Start the preload cycle 60s after the main cycle
    setTimeout(() => {
      preloadModels();
    }, 60 * 1000);
    
  } catch (error) {
    console.error('❌ Failed to start background monitoring:', error);
    isMonitoringStarted = false;
    throw error;
  }
}

// For serverless environments (like Vercel), we need to check if cache is stale and refresh on-demand
export async function ensureMonitoringStarted(): Promise<void> {
  // On serverless platforms, background intervals don't work
  // Instead, we check on each API call if cache needs refreshing
  const now = new Date();
  const cacheAge = Math.floor((now.getTime() - lastCacheUpdate.getTime()) / 1000);
  const maxAge = cacheMaxAge / 1000; // Convert to seconds
  
  // If cache is empty or stale (older than 2 minutes), refresh it
  if (Object.keys(modelStatuses).length === 0 || cacheAge > maxAge) {
    console.log(`🔄 Cache is ${Object.keys(modelStatuses).length === 0 ? 'empty' : 'stale'}, refreshing...`);
    
    // Fetch models if we don't have any
    if (availableModels.length === 0) {
      await fetchAvailableModels();
    }
    
    // Check all models
    await checkAllModels();
  }
  
  // In non-serverless environments, try to start background monitoring
  if (!isServerless && !isMonitoringStarted) {
    try {
      await startBackgroundMonitoring();
    } catch (error) {
      console.log('Background monitoring failed to start');
    }
  }
}

export function stopBackgroundMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  if (preloadInterval) {
    clearInterval(preloadInterval);
    preloadInterval = null;
  }
  isMonitoringStarted = false;
}

export function isMonitoringActive(): boolean {
  return isMonitoringStarted && monitoringInterval !== null;
}

// Legacy compatibility - just ensure monitoring is started
export async function initializeMonitoring(): Promise<void> {
  await startBackgroundMonitoring();
}