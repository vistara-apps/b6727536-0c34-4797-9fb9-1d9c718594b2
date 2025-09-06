import { createClient } from '@supabase/supabase-js';
import { Task, Event, User } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  // User operations
  static async createUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ userId, createdAt: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('userId', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Task operations
  static async createTask(task: Omit<Task, 'taskId' | 'createdAt'>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          taskId: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  static async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('taskId', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }

  // Event operations
  static async createEvent(event: Omit<Event, 'eventId' | 'createdAt'>): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...event,
          eventId: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  static async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('userId', userId)
        .order('startTime', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }
}
