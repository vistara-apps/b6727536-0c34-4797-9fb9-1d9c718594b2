'use client';

import { Loader2, Mic, Calendar, CheckSquare } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'voice' | 'calendar' | 'tasks';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  message,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'voice':
        return <Mic className={`${getSizeClasses()} animate-pulse text-purple-400`} />;
      case 'calendar':
        return <Calendar className={`${getSizeClasses()} animate-pulse text-blue-400`} />;
      case 'tasks':
        return <CheckSquare className={`${getSizeClasses()} animate-pulse text-green-400`} />;
      default:
        return <Loader2 className={`${getSizeClasses()} animate-spin text-purple-400`} />;
    }
  };

  const getDefaultMessage = () => {
    switch (variant) {
      case 'voice':
        return 'Processing voice...';
      case 'calendar':
        return 'Loading calendar...';
      case 'tasks':
        return 'Loading tasks...';
      default:
        return 'Loading...';
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {getIcon()}
      {(message || getDefaultMessage()) && (
        <p className="text-purple-200 text-sm animate-pulse">
          {message || getDefaultMessage()}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-card p-8">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {content}
    </div>
  );
}

// Skeleton loading components
export function TaskSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 bg-purple-400/20 rounded"></div>
        <div className="flex-1">
          <div className="h-4 bg-purple-400/20 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-purple-400/10 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export function EventSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 bg-blue-400/20 rounded"></div>
        <div className="flex-1">
          <div className="h-4 bg-blue-400/20 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-blue-400/10 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-purple-400/20 rounded w-48"></div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-purple-400/20 rounded"></div>
          <div className="w-16 h-8 bg-purple-400/20 rounded"></div>
          <div className="w-8 h-8 bg-purple-400/20 rounded"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded border border-white/10"></div>
        ))}
      </div>
    </div>
  );
}

// Loading states for different sections
export function VoiceInterfaceSkeleton() {
  return (
    <div className="text-center space-y-8 animate-pulse">
      <div className="relative">
        <div className="w-20 h-20 bg-purple-400/20 rounded-full mx-auto"></div>
      </div>
      
      <div className="glass-card p-6 max-w-lg mx-auto">
        <div className="h-4 bg-purple-400/20 rounded w-32 mx-auto mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-purple-400/10 rounded w-full"></div>
          <div className="h-3 bg-purple-400/10 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-purple-400/10 rounded w-5/6 mx-auto"></div>
          <div className="h-3 bg-purple-400/10 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

// Progress indicator for multi-step processes
interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  variant?: 'default' | 'voice';
}

export function ProgressIndicator({ 
  steps, 
  currentStep, 
  variant = 'default' 
}: ProgressIndicatorProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">
          {variant === 'voice' ? 'Processing Voice Command' : 'Progress'}
        </h3>
        <span className="text-purple-200 text-sm">
          {currentStep + 1} of {steps.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              index < currentStep 
                ? 'bg-green-500 text-white' 
                : index === currentStep
                ? 'bg-purple-500 text-white animate-pulse'
                : 'bg-white/10 text-purple-300'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={`text-sm ${
              index <= currentStep ? 'text-white' : 'text-purple-300'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 bg-white/10 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
