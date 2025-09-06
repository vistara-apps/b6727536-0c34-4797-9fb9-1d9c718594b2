'use client';

import { Event } from '@/lib/types';
import { Calendar, Clock, Bell, Trash2 } from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

interface EventListProps {
  events: Event[];
  onDeleteEvent: (eventId: string) => void;
}

export function EventList({ events, onDeleteEvent }: EventListProps) {
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE \'at\' h:mm a');
    } else {
      return format(date, 'MMM d \'at\' h:mm a');
    }
  };

  const getEventStatus = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    
    if (start < now) {
      return { status: 'past', color: 'text-gray-400' };
    } else if (start.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: 'upcoming', color: 'text-yellow-300' };
    } else {
      return { status: 'future', color: 'text-purple-200' };
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass-card p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-500 bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-purple-200" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No events scheduled</h3>
          <p className="text-purple-200 text-sm">
            Use voice commands to schedule your first event
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const { status, color } = getEventStatus(event.startTime);
        
        return (
          <div
            key={event.eventId}
            className={`task-item ${status === 'past' ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-500 bg-opacity-30 rounded-full flex items-center justify-center">
                <Calendar size={12} className="text-purple-200" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium mb-1">
                  {event.title}
                </h3>
                
                <div className="space-y-1">
                  <div className={`flex items-center space-x-1 text-xs ${color}`}>
                    <Clock size={12} />
                    <span>{formatEventDate(event.startTime)}</span>
                  </div>
                  
                  {event.endTime && (
                    <div className="flex items-center space-x-1 text-xs text-purple-200">
                      <span>Until {format(new Date(event.endTime), 'h:mm a')}</span>
                    </div>
                  )}
                  
                  {event.reminderTime && (
                    <div className="flex items-center space-x-1 text-xs text-blue-300">
                      <Bell size={12} />
                      <span>Reminder: {formatEventDate(event.reminderTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeleteEvent(event.eventId)}
                className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
