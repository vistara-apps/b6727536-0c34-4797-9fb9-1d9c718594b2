'use client';

import { ReactNode } from 'react';
import { Mic, Calendar, CheckSquare, Settings2 } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  activeTab?: 'voice' | 'tasks' | 'calendar';
  onTabChange?: (tab: 'voice' | 'tasks' | 'calendar') => void;
}

export function AppShell({ children, activeTab = 'voice', onTabChange }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Floating Stars Background */}
      <div className="floating-stars">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
          VoiceFlow AI
        </h1>
        <p className="text-purple-200 text-sm">
          Speak your tasks, master your day
        </p>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container max-w-6xl mx-auto px-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-black bg-opacity-30 backdrop-blur-lg border-t border-white border-opacity-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-3">
            <button
              onClick={() => onTabChange?.('voice')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'voice'
                  ? 'bg-purple-500 bg-opacity-30 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Mic size={20} />
              <span className="text-xs">Voice</span>
            </button>

            <button
              onClick={() => onTabChange?.('tasks')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'bg-purple-500 bg-opacity-30 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <CheckSquare size={20} />
              <span className="text-xs">Tasks</span>
            </button>

            <button
              onClick={() => onTabChange?.('calendar')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'calendar'
                  ? 'bg-purple-500 bg-opacity-30 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Calendar size={20} />
              <span className="text-xs">Calendar</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
