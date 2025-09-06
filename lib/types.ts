export interface User {
  userId: string;
  createdAt: string;
}

export interface Task {
  taskId: string;
  userId: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  dueDate?: string;
}

export interface Event {
  eventId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  reminderTime: string;
  createdAt: string;
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
}

export interface AIParseResult {
  type: 'task' | 'event';
  description?: string;
  title?: string;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  reminderTime?: string;
}
