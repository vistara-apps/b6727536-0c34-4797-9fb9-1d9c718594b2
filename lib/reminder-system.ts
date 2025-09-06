import { Task, Event } from './types';

export interface Reminder {
  id: string;
  type: 'task' | 'event';
  title: string;
  message: string;
  scheduledTime: Date;
  isActive: boolean;
  itemId: string;
}

class ReminderSystem {
  private reminders: Map<string, Reminder> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  // Schedule reminders for tasks
  scheduleTaskReminders(tasks: Task[]): void {
    tasks.forEach(task => {
      if (task.dueDate && !task.isCompleted) {
        this.scheduleTaskReminder(task);
      }
    });
  }

  // Schedule reminders for events
  scheduleEventReminders(events: Event[]): void {
    events.forEach(event => {
      this.scheduleEventReminder(event);
    });
  }

  private scheduleTaskReminder(task: Task): void {
    if (!task.dueDate) return;

    const dueDate = new Date(task.dueDate);
    const now = new Date();

    // Schedule reminder 1 hour before due date
    const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000);
    
    if (reminderTime > now) {
      const reminderId = `task-${task.taskId}`;
      const reminder: Reminder = {
        id: reminderId,
        type: 'task',
        title: 'Task Due Soon',
        message: `Don't forget: ${task.description}`,
        scheduledTime: reminderTime,
        isActive: true,
        itemId: task.taskId,
      };

      this.reminders.set(reminderId, reminder);
      this.scheduleNotification(reminder);
    }

    // Schedule overdue reminder
    if (dueDate > now) {
      const overdueReminderId = `task-overdue-${task.taskId}`;
      const overdueReminder: Reminder = {
        id: overdueReminderId,
        type: 'task',
        title: 'Task Overdue',
        message: `Overdue task: ${task.description}`,
        scheduledTime: dueDate,
        isActive: true,
        itemId: task.taskId,
      };

      this.reminders.set(overdueReminderId, overdueReminder);
      this.scheduleNotification(overdueReminder);
    }
  }

  private scheduleEventReminder(event: Event): void {
    const reminderTime = new Date(event.reminderTime);
    const now = new Date();

    if (reminderTime > now) {
      const reminderId = `event-${event.eventId}`;
      const reminder: Reminder = {
        id: reminderId,
        type: 'event',
        title: 'Upcoming Event',
        message: `${event.title} starts at ${new Date(event.startTime).toLocaleTimeString()}`,
        scheduledTime: reminderTime,
        isActive: true,
        itemId: event.eventId,
      };

      this.reminders.set(reminderId, reminder);
      this.scheduleNotification(reminder);
    }
  }

  private scheduleNotification(reminder: Reminder): void {
    const now = new Date();
    const delay = reminder.scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.showNotification(reminder);
      }, delay);

      this.timeouts.set(reminder.id, timeout);
    }
  }

  private showNotification(reminder: Reminder): void {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: reminder.id,
      });
    }

    // Also dispatch custom event for in-app notifications
    window.dispatchEvent(new CustomEvent('voiceflow-reminder', {
      detail: reminder
    }));

    // Clean up
    this.reminders.delete(reminder.id);
    this.timeouts.delete(reminder.id);
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Cancel reminder
  cancelReminder(reminderId: string): void {
    const timeout = this.timeouts.get(reminderId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(reminderId);
    }
    this.reminders.delete(reminderId);
  }

  // Cancel all reminders for a specific item
  cancelItemReminders(itemId: string, type: 'task' | 'event'): void {
    const remindersToCancel = Array.from(this.reminders.values())
      .filter(reminder => reminder.itemId === itemId && reminder.type === type);

    remindersToCancel.forEach(reminder => {
      this.cancelReminder(reminder.id);
    });
  }

  // Get active reminders
  getActiveReminders(): Reminder[] {
    return Array.from(this.reminders.values()).filter(r => r.isActive);
  }

  // Get upcoming reminders (next 24 hours)
  getUpcomingReminders(): Reminder[] {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.getActiveReminders().filter(reminder => 
      reminder.scheduledTime >= now && reminder.scheduledTime <= tomorrow
    ).sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  // Clear all reminders
  clearAllReminders(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.reminders.clear();
  }
}

export const reminderSystem = new ReminderSystem();
