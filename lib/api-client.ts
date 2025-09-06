import { Task, Event, AIParseResult } from './types';

class APIClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    const { tasks } = await this.request<{ tasks: Task[] }>(`/api/tasks?userId=${userId}`);
    return tasks;
  }

  async createTask(taskData: {
    userId: string;
    description: string;
    dueDate?: string;
  }): Promise<Task> {
    const { task } = await this.request<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return task;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { task } = await this.request<{ task: Task }>('/api/tasks', {
      method: 'PUT',
      body: JSON.stringify({ taskId, updates }),
    });
    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.request(`/api/tasks?taskId=${taskId}`, {
      method: 'DELETE',
    });
  }

  // Event operations
  async getEvents(userId: string): Promise<Event[]> {
    const { events } = await this.request<{ events: Event[] }>(`/api/events?userId=${userId}`);
    return events;
  }

  async createEvent(eventData: {
    userId: string;
    title: string;
    startTime: string;
    endTime: string;
    reminderTime?: string;
  }): Promise<Event> {
    const { event } = await this.request<{ event: Event }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return event;
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    const { event } = await this.request<{ event: Event }>('/api/events', {
      method: 'PUT',
      body: JSON.stringify({ eventId, updates }),
    });
    return event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.request(`/api/events?eventId=${eventId}`, {
      method: 'DELETE',
    });
  }

  // Voice operations
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const response = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const { transcript } = await response.json();
    return transcript;
  }

  async parseVoiceCommand(transcript: string): Promise<AIParseResult> {
    const { parseResult } = await this.request<{ parseResult: AIParseResult }>('/api/voice/parse', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
    return parseResult;
  }
}

export const apiClient = new APIClient();
