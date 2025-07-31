import axios from 'axios';

// ULTRA-FAST axios instance - maximum performance optimizations
const api = axios.create({
  baseURL: 'https://samuraiapi.in/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'Connection': 'keep-alive', // Reuse connections
    'Accept-Encoding': 'gzip, compress', // Compress responses
  },
  timeout: 60000, // 60 seconds for reasoning models
  maxRedirects: 0, // Avoid redirects for speed
  validateStatus: (status) => status < 500, // Accept all non-server errors
  maxContentLength: Infinity, // No limit on response size
  maxBodyLength: Infinity, // No limit on request size
});

// Types
export interface ModelStatus {
  model: string;
  status: 'online' | 'offline' | 'error';
  lastChecked: string;
  response?: string;
  error?: string;
}

export interface ApiResponse {
  data: Record<string, ModelStatus>;
  stats: {
    total: number;
    online: number;
    offline: number;
    uptime: string;
  };
}

// Global model list
let availableModels: string[] = [];

// Fetch available models from API
export async function fetchAvailableModels(): Promise<string[]> {
  try {
    console.log('🚀 AXIOS: Fetching available models from SamuraiAPI...');
    const startTime = Date.now();
    
    const response = await api.get('/models');
    const duration = Date.now() - startTime;
    
    if (response.data && response.data.data) {
      availableModels = response.data.data.map((model: any) => model.id);
      console.log(`⚡ AXIOS: Found ${availableModels.length} models in ${duration}ms`);
      return availableModels;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error: any) {
    console.error('❌ AXIOS: Failed to fetch models:', error.response?.data || error.message);
    // Fallback to common models
    availableModels = [
      'gpt-3.5-turbo',
      'gpt-4',
      'claude-3-haiku',
      'claude-3-sonnet',
      'gemini-pro'
    ];
    console.log('⚠️ Using fallback model list');
    return availableModels;
  }
}

// Check if a model is a chat model based on name patterns
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

// Test chat model with axios - ultra fast
async function testChatModel(modelName: string): Promise<ModelStatus> {
  const testStart = Date.now();
  
  const response = await api.post('/chat/completions', {
    model: modelName,
    messages: [
      {
        role: 'user',
        content: 'Hello, are you working?'
      }
    ],
    max_tokens: 16,
  });

  const testDuration = Date.now() - testStart;
  const responseText = response.data.choices?.[0]?.message?.content || 'OK';

  return {
    model: modelName,
    status: 'online',
    lastChecked: new Date().toISOString(),
    response: responseText
  };
}

// Test non-chat model with axios
async function testNonChatModel(modelName: string): Promise<ModelStatus> {
  try {
    // For non-chat models, check if they exist in the models list
    const response = await api.get('/models');
    const modelExists = response.data.data.some((m: any) => m.id === modelName);
    
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

// Test individual model with axios - optimized for speed
export async function testModel(modelName: string): Promise<ModelStatus> {
  try {
    if (isChatModel(modelName)) {
      return await testChatModel(modelName);
    } else {
      return await testNonChatModel(modelName);
    }
  } catch (error: any) {
    let errorMessage = error.message || 'Unknown error';
    
    // Handle axios HTTP errors
    if (error.response) {
      errorMessage = `HTTP ${error.response.status}: ${error.response.data?.error?.message || error.response.statusText}`;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout';
    }
    
    // If it's a "unknown field 'messages'" error, try testing as non-chat model
    if (errorMessage.includes('unknown field') && isChatModel(modelName)) {
      try {
        return await testNonChatModel(modelName);
      } catch (retryError: any) {
        errorMessage = retryError.response?.data?.error?.message || retryError.message || 'Unknown error on retry';
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

// Generate stats from model statuses
function getStats(modelStatuses: Record<string, ModelStatus>) {
  const entries = Object.values(modelStatuses);
  const total = entries.length;
  const online = entries.filter(s => s.status === 'online').length;
  const offline = total - online;
  const uptime = total > 0 ? ((online / total) * 100).toFixed(1) : '0';

  return { total, online, offline, uptime };
}

// Test all models with ultra-fast axios parallelization
export async function testAllModels(): Promise<Record<string, ModelStatus>> {
  // Fetch models if not already fetched
  if (availableModels.length === 0) {
    console.log('🚀 AXIOS: Fetching model list...');
    await fetchAvailableModels();
  }

  if (availableModels.length === 0) {
    console.log('⚠️ No models available to test');
    return {};
  }

  const totalStartTime = Date.now();
  console.log(`🚀 AXIOS POWER: Starting ultra-fast parallel testing of ${availableModels.length} models...`);

  // MAXIMUM parallelization - axios can handle much more than OpenAI SDK
  const BATCH_SIZE = 50; // Even larger batches
  const MAX_CONCURRENT_BATCHES = 50; // Maximum concurrent batches
  
  const modelStatuses: Record<string, ModelStatus> = {};
  
  // Split models into batches
  const batches: string[][] = [];
  for (let i = 0; i < availableModels.length; i += BATCH_SIZE) {
    batches.push(availableModels.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`⚡ AXIOS: Split into ${batches.length} batches of up to ${BATCH_SIZE} models each`);
  
  // Process all batches in maximum parallel (axios can handle more concurrent requests)
  const allBatchPromises = batches.map(async (batch, batchIndex) => {
    const batchStart = Date.now();
    console.log(`🔥 AXIOS Batch ${batchIndex + 1}: Testing ${batch.length} models`);
    
    const promises = batch.map(model => testModel(model));
    const results = await Promise.allSettled(promises);
    
    let successful = 0;
    let failed = 0;
    
    results.forEach((result, index) => {
      const modelName = batch[index];
      if (result.status === 'fulfilled') {
        modelStatuses[modelName] = result.value;
        if (result.value.status === 'online') successful++;
        else failed++;
      } else {
        modelStatuses[modelName] = {
          model: modelName,
          status: 'error',
          lastChecked: new Date().toISOString(),
          error: (result.reason as Error).message
        };
        failed++;
      }
    });
    
    const batchDuration = Date.now() - batchStart;
    console.log(`✅ AXIOS Batch ${batchIndex + 1}: ${batchDuration}ms - ${successful} online, ${failed} failed`);
  });
  
  // Execute ALL batches simultaneously for maximum speed
  console.log(`⚡ AXIOS: Executing ALL ${batches.length} batches simultaneously...`);
  await Promise.all(allBatchPromises);
  
  const totalDuration = Date.now() - totalStartTime;
  const stats = getStats(modelStatuses);
  console.log(`🏁 AXIOS COMPLETE: ${availableModels.length} models tested in ${totalDuration}ms (${(totalDuration/1000).toFixed(1)}s)`);
  console.log(`📊 AXIOS RESULTS: ${stats.online} online, ${stats.offline} offline, ${stats.uptime}% uptime`);
  
  return modelStatuses;
}

// Generate fresh API response
export function getFreshResponse(modelStatuses: Record<string, ModelStatus>): ApiResponse {
  return {
    data: modelStatuses,
    stats: getStats(modelStatuses)
  };
}

// Get available models list
export function getAvailableModelsList(): string[] {
  return availableModels;
}