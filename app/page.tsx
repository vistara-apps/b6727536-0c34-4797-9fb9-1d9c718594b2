'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { VoiceInterface } from '@/components/VoiceInterface';
import { TaskList } from '@/components/TaskList';
import { EventList } from '@/components/EventList';
import { SupabaseService } from '@/lib/supabase';
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
  
  const { setFrameReady } = useMiniKit();
  const { address, isConnected } = useAccount();

  // Initialize MiniKit
  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  // Load user data when connected
  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    }
  }, [isConnected, address]);

  const loadUserData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // Ensure user exists
      let user = await SupabaseService.getUser(address);
      if (!user) {
        user = await SupabaseService.createUser(address);
      }

      // Load tasks and events
      const [userTasks, userEvents] = await Promise.all([
        SupabaseService.getUserTasks(address),
        SupabaseService.getUserEvents(address)
      ]);

      setTasks(userTasks);
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = () => {
    if (address) {
      SupabaseService.getUserTasks(address).then(setTasks);
    }
  };

  const handleEventCreated = () => {
    if (address) {
      SupabaseService.getUserEvents(address).then(setEvents);
    }
  };

  const handleToggleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    await SupabaseService.updateTask(taskId, { isCompleted });
    if (address) {
      const updatedTasks = await SupabaseService.getUserTasks(address);
      setTasks(updatedTasks);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Note: You'd need to implement deleteTask in SupabaseService
    // For now, we'll just refresh the list
    if (address) {
      const updatedTasks = await SupabaseService.getUserTasks(address);
      setTasks(updatedTasks);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    // Note: You'd need to implement deleteEvent in SupabaseService
    // For now, we'll just refresh the list
    if (address) {
      const updatedEvents = await SupabaseService.getUserEvents(address);
      setEvents(updatedEvents);
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
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="py-8">
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
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-purple-200 mt-4">Loading tasks...</p>
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
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Your Calendar</h2>
              <p className="text-purple-200 text-sm">
                {events.length} events scheduled
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-purple-200 mt-4">Loading events...</p>
              </div>
            ) : (
              <EventList
                events={events}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
