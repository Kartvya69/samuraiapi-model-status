'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock, AlertCircle, BarChart3, Filter, TrendingUp, Activity } from 'lucide-react';
import ModelCard from '@/components/ModelCard';
import SearchBar from '@/components/SearchBar';
import ThemeToggle from '@/components/ThemeToggle';
import { ModelStatus } from '@/lib/modelService';

interface ModelStatuses {
  [key: string]: ModelStatus;
}

interface CachedApiResponse {
  data: ModelStatuses;
  stats: {
    total: number;
    online: number;
    offline: number;
    uptime: string;
  };
}

export default function Home() {
  const [models, setModels] = useState<ModelStatuses>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  const refreshModels = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      const response = await fetch('/api/refresh-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Model list refreshed:', result);
        // Fetch updated models
        fetchModels();
      } else {
        console.error('Failed to refresh models:', result.error);
      }
    } catch (error) {
      console.error('Error refreshing models:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const cachedData: CachedApiResponse = await response.json();
      
      setModels(cachedData.data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
    
    // Optional: Light polling every 60 seconds just to refresh the UI
    // The real monitoring happens in the background every 2 minutes
    const interval = setInterval(fetchModels, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter and search models
  const filteredModels = useMemo(() => {
    const modelEntries = Object.entries(models);
    
    return modelEntries.filter(([modelName, modelData]) => {
      // Filter by search term
      const matchesSearch = modelName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || modelData.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [models, searchTerm, filterStatus]);

  const modelEntries = Object.entries(models);
  const total = modelEntries.length;
  const online = modelEntries.filter(([, model]) => model.status === 'online').length;
  const offline = total - online;
  const uptime = total > 0 ? ((online / total) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse"></div>
            <RefreshCw className="w-8 h-8 absolute top-6 left-6 animate-spin text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6">Loading Model Status</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Fetching available models from API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                  Model Status Monitor
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Real-time monitoring of AI model availability</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              
              <button
                onClick={refreshModels}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Live</span>
              </div>
              
              {lastUpdate && (
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{lastUpdate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Models</p>
                  <p className="text-3xl font-bold">{total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Online</p>
                  <p className="text-3xl font-bold">{online}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Offline</p>
                  <p className="text-3xl font-bold">{offline}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Uptime</p>
                  <p className="text-3xl font-bold">{uptime}%</p>
                </div>
                <Activity className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <SearchBar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm}
                placeholder="Search models by name..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'online' | 'offline')}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        {filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModels.map(([modelName, modelData]) => (
              <ModelCard key={modelName} modelName={modelName} modelData={modelData} />
            ))}
          </div>
        ) : total > 0 ? (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-12 text-center animate-fade-in">
            <div className="text-gray-500 dark:text-gray-400">
              <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">No models match your criteria</h3>
              <p>Try adjusting your search term or filter settings</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-12 text-center animate-fade-in">
            <div className="text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600 animate-bounce-slow" />
              <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">No model data available</h3>
              <p>Waiting for the first status check...</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full border border-white/20 dark:border-gray-700/50">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Background monitoring every 2 minutes • {filteredModels.length} of {total} models shown
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}