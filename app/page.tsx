'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { VoiceInterface } from '@/components/VoiceInterface';
import { TaskList } from '@/components/TaskList';
import { EventList } from '@/components/EventList';
import { CalendarView } from '@/components/CalendarView';
import { NotificationContainer } from '@/components/NotificationBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner, TaskSkeleton, EventSkeleton } from '@/components/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { reminderSystem } from '@/lib/reminder-system';
import { Task, Event } from '@/lib/types';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'voice' | 'tasks' | 'calendar'>('voice');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  
  const { setFrameReady } = useMiniKit();
  const { address, isConnected } = useAccount();

  // Initialize MiniKit
  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  // Request notification permission on mount
  useEffect(() => {
    reminderSystem.requestNotificationPermission();
  }, []);

  // Load user data when connected
  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    }
  }, [isConnected, address]);

  // Set up reminders when data changes
  useEffect(() => {
    if (tasks.length > 0 || events.length > 0) {
      reminderSystem.scheduleTaskReminders(tasks);
      reminderSystem.scheduleEventReminders(events);
    }
  }, [tasks, events]);

  const loadUserData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load tasks and events using API client
      const [userTasks, userEvents] = await Promise.all([
        apiClient.getTasks(address),
        apiClient.getEvents(address)
      ]);

      setTasks(userTasks);
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = async () => {
    if (address) {
      try {
        const updatedTasks = await apiClient.getTasks(address);
        setTasks(updatedTasks);
      } catch (error) {
        console.error('Error refreshing tasks:', error);
      }
    }
  };

  const handleEventCreated = async () => {
    if (address) {
      try {
        const updatedEvents = await apiClient.getEvents(address);
        setEvents(updatedEvents);
      } catch (error) {
        console.error('Error refreshing events:', error);
      }
    }
  };

  const handleToggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      await apiClient.updateTask(taskId, { isCompleted });
      if (address) {
        const updatedTasks = await apiClient.getTasks(address);
        setTasks(updatedTasks);
        
        // Cancel reminders for completed tasks
        if (isCompleted) {
          reminderSystem.cancelItemReminders(taskId, 'task');
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.deleteTask(taskId);
      reminderSystem.cancelItemReminders(taskId, 'task');
      
      if (address) {
        const updatedTasks = await apiClient.getTasks(address);
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await apiClient.deleteEvent(eventId);
      reminderSystem.cancelItemReminders(eventId, 'event');
      
      if (address) {
        const updatedEvents = await apiClient.getEvents(address);
        setEvents(updatedEvents);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  if (!isConnected) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            <div className="glass-card p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to VoiceFlow AI
              </h2>
              <p className="text-purple-200 mb-6">
                Connect your wallet to start managing tasks with voice commands
              </p>
              
              <Wallet>
                <ConnectWallet>
                  <Name />
                </ConnectWallet>
              </Wallet>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <ErrorBoundary>
      <NotificationContainer>
        <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
          <div className="py-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg text-center">
                <p className="text-red-200">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {activeTab === 'voice' && (
              <VoiceInterface
                userId={address!}
                onTaskCreated={handleTaskCreated}
                onEventCreated={handleEventCreated}
              />
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Your Tasks</h2>
                  <p className="text-purple-200 text-sm">
                    {tasks.filter(t => !t.isCompleted).length} active, {tasks.filter(t => t.isCompleted).length} completed
                  </p>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <TaskSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <TaskList
                    tasks={tasks}
                    onToggleComplete={handleToggleTaskComplete}
                    onDeleteTask={handleDeleteTask}
                  />
                )}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">Your Calendar</h2>
                    <p className="text-purple-200 text-sm">
                      {events.length} events scheduled
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCalendarView('day')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        calendarView === 'day'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                      }`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => setCalendarView('week')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        calendarView === 'week'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setCalendarView('month')}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        calendarView === 'month'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <LoadingSpinner variant="calendar" message="Loading calendar..." />
                ) : (
                  <CalendarView
                    events={events}
                    tasks={tasks}
                    variant={calendarView}
                    onEventClick={(event) => {
                      // Could open event details modal
                      console.log('Event clicked:', event);
                    }}
                    onTaskClick={(task) => {
                      // Could open task details modal
                      console.log('Task clicked:', task);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </AppShell>
      </NotificationContainer>
    </ErrorBoundary>
  );
}
