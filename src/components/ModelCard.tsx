import { CheckCircle, XCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { ModelStatus } from '@/lib/modelService';

interface ModelCardProps {
  modelName: string;
  modelData: ModelStatus;
}

export default function ModelCard({ modelName, modelData }: ModelCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-6 h-6 text-green-500 drop-shadow-sm" />;
      case 'offline':
        return <XCircle className="w-6 h-6 text-red-500 drop-shadow-sm" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500 drop-shadow-sm" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-glow-green';
      case 'offline':
        return 'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 shadow-glow-red';
      default:
        return 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 dark:text-green-400';
      case 'offline':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider";
    switch (status) {
      case 'online':
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700`;
      case 'offline':
        return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700`;
      default:
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700`;
    }
  };

  return (
    <div className={`
      relative overflow-hidden rounded-xl border-2 backdrop-blur-sm
      ${getStatusColor(modelData.status)} 
      bg-white/90 dark:bg-gray-900/90 
      shadow-lg hover:shadow-xl 
      transform hover:scale-[1.02] 
      transition-all duration-300 ease-out
      group animate-fade-in
    `}>
      {/* Status indicator bar */}
      <div className={`
        absolute top-0 left-0 right-0 h-1 
        ${modelData.status === 'online' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
          modelData.status === 'offline' ? 'bg-gradient-to-r from-red-400 to-rose-500' : 
          'bg-gradient-to-r from-yellow-400 to-amber-500'}
      `} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {modelName}
            </h3>
            <div className="mt-1">
              <span className={getStatusBadge(modelData.status)}>
                {modelData.status}
              </span>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            {getStatusIcon(modelData.status)}
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
            </div>
            <span className={`text-sm font-semibold ${getStatusTextColor(modelData.status)}`}>
              {modelData.status.charAt(0).toUpperCase() + modelData.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Check</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {modelData.lastChecked ? new Date(modelData.lastChecked).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Response/Error Messages */}
        {modelData.response && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Response</p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{modelData.response}</p>
              </div>
            </div>
          </div>
        )}

        {modelData.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">Error</p>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1 break-words">{modelData.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}