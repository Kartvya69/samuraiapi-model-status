import axios from 'axios';

const API_BASE_URL = 'https://samuraiapi.in/v1';
const API_KEY = process.env.OPENAI_API_KEY;

export interface ModelStatus {
  model: string;
  status: 'online' | 'offline' | 'error';
  lastChecked: string;
  response?: string;
  error?: string;
}

let modelStatuses: Record<string, ModelStatus> = {};
let availableModels: string[] = [];
let isMonitoringStarted = false;
let monitoringInterval: NodeJS.Timeout | null = null;

export async function fetchAvailableModels(): Promise<string[]> {
  try {
    console.log('🔍 Fetching available models from API...');
    const response = await axios.get(`${API_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data && response.data.data) {
      availableModels = response.data.data.map((model: any) => model.id);
      console.log(`✅ Found ${availableModels.length} available models`);
      return availableModels;
    } else {
      console.error('❌ Unexpected response format from models endpoint');
      throw new Error('Invalid response format');
    }
  } catch (error: any) {
    console.error('❌ Failed to fetch models from API:', error.response?.data || error.message);
    // Fallback to a basic set of common models if API call fails
    availableModels = [
      'gpt-3.5-turbo',
      'gpt-4',
      'claude-3-haiku',
      'claude-3-sonnet',
      'gemini-pro'
    ];
    console.log('⚠️  Using fallback model list:', availableModels);
    return availableModels;
  }
}

export async function testModel(modelName: string): Promise<ModelStatus> {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/completions`, {
      model: modelName,
      messages: [
        {
          role: 'user',
          content: 'Hello, are you working?'
        }
      ],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      model: modelName,
      status: 'online',
      lastChecked: new Date().toISOString(),
      response: response.data.choices?.[0]?.message?.content || 'OK'
    };
  } catch (error: any) {
    return {
      model: modelName,
      status: 'offline',
      lastChecked: new Date().toISOString(),
      error: error.response?.data?.error?.message || error.message
    };
  }
}

export async function checkAllModels(): Promise<Record<string, ModelStatus>> {
  if (availableModels.length === 0) {
    console.log('⚠️  No models available to check');
    return modelStatuses;
  }

  const timestamp = new Date().toISOString();
  console.log(`🔄 [${timestamp}] Checking ${availableModels.length} model statuses...`);
  
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
  
  const onlineCount = Object.values(modelStatuses).filter(s => s.status === 'online').length;
  console.log(`✅ [${new Date().toISOString()}] Model check completed: ${onlineCount}/${availableModels.length} online`);
  
  return modelStatuses;
}

export function getModelStatuses(): Record<string, ModelStatus> {
  return modelStatuses;
}

export function getAvailableModels(): string[] {
  return availableModels;
}

// Start background monitoring immediately when the service loads
export async function startBackgroundMonitoring(): Promise<void> {
  if (isMonitoringStarted) {
    console.log('📊 Background monitoring already started');
    return;
  }
  
  isMonitoringStarted = true;
  console.log('🚀 Starting background model monitoring...');
  
  try {
    // Initial setup and first check
    await fetchAvailableModels();
    await checkAllModels();
    
    // Set up interval for every 2 minutes (120,000 ms)
    monitoringInterval = setInterval(async () => {
      try {
        await checkAllModels();
      } catch (error) {
        console.error('❌ Error during scheduled model check:', error);
      }
    }, 2 * 60 * 1000);
    
    console.log('⏰ Background monitoring scheduled every 2 minutes');
  } catch (error) {
    console.error('❌ Failed to start background monitoring:', error);
    isMonitoringStarted = false;
  }
}

export function stopBackgroundMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    isMonitoringStarted = false;
    console.log('🛑 Background monitoring stopped');
  }
}

export function isMonitoringActive(): boolean {
  return isMonitoringStarted && monitoringInterval !== null;
}

// Legacy compatibility - just ensure monitoring is started
export async function initializeMonitoring(): Promise<void> {
  await startBackgroundMonitoring();
}