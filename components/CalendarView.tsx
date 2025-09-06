'use client';

import { useState, useMemo } from 'react';
import { Event, Task } from '@/lib/types';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckSquare } from 'lucide-react';

interface CalendarViewProps {
  events: Event[];
  tasks: Task[];
  variant?: 'day' | 'week' | 'month';
  onEventClick?: (event: Event) => void;
  onTaskClick?: (task: Task) => void;
}

export function CalendarView({ 
  events, 
  tasks, 
  variant = 'week',
  onEventClick,
  onTaskClick 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { startDate, endDate, dateRange } = useMemo(() => {
    const start = new Date(currentDate);
    let end = new Date(currentDate);
    let range: Date[] = [];

    switch (variant) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        range = [new Date(start)];
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        range = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          return date;
        });
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        
        // Get first day of month and calculate calendar grid
        const firstDay = new Date(start);
        const lastDay = new Date(end);
        const startOfCalendar = new Date(firstDay);
        startOfCalendar.setDate(startOfCalendar.getDate() - firstDay.getDay());
        
        const endOfCalendar = new Date(lastDay);
        endOfCalendar.setDate(endOfCalendar.getDate() + (6 - lastDay.getDay()));
        
        range = [];
        const current = new Date(startOfCalendar);
        while (current <= endOfCalendar) {
          range.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        break;
    }

    return { startDate: start, endDate: end, dateRange: range };
  }, [currentDate, variant]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }, [events, startDate, endDate]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [tasks, startDate, endDate]);

  const getItemsForDate = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });

    const dayTasks = filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= dayStart && taskDate <= dayEnd;
    });

    return { events: dayEvents, tasks: dayTasks };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (variant) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    switch (variant) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const weekStart = dateRange[0];
        const weekEnd = dateRange[6];
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="text-purple-300" size={24} />
          <h3 className="text-xl font-bold text-white">{formatDateHeader()}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {variant === 'month' && (
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-purple-300">
              {day}
            </div>
          ))}
        </div>
      )}

      <div className={`grid gap-2 ${
        variant === 'month' ? 'grid-cols-7' : 
        variant === 'week' ? 'grid-cols-7' : 
        'grid-cols-1'
      }`}>
        {dateRange.map((date, index) => {
          const { events: dayEvents, tasks: dayTasks } = getItemsForDate(date);
          const isCurrentDay = isToday(date);
          const isInCurrentMonth = variant !== 'month' || isCurrentMonth(date);

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-colors ${
                isCurrentDay 
                  ? 'bg-purple-600/20 border-purple-400' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              } ${
                !isInCurrentMonth ? 'opacity-50' : ''
              }`}
            >
              {/* Date Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isCurrentDay ? 'text-purple-200' : 'text-white'
                }`}>
                  {variant === 'month' ? date.getDate() : date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                {(dayEvents.length > 0 || dayTasks.length > 0) && (
                  <div className="flex space-x-1">
                    {dayEvents.length > 0 && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    )}
                    {dayTasks.length > 0 && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>

              {/* Events */}
              {dayEvents.map(event => (
                <div
                  key={event.eventId}
                  onClick={() => onEventClick?.(event)}
                  className="mb-1 p-2 rounded bg-blue-500/20 border border-blue-400/30 cursor-pointer hover:bg-blue-500/30 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <Clock size={12} className="text-blue-300 flex-shrink-0" />
                    <span className="text-xs text-blue-200 truncate">
                      {event.title}
                    </span>
                  </div>
                  <div className="text-xs text-blue-300 mt-1">
                    {new Date(event.startTime).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}

              {/* Tasks */}
              {dayTasks.map(task => (
                <div
                  key={task.taskId}
                  onClick={() => onTaskClick?.(task)}
                  className={`mb-1 p-2 rounded border cursor-pointer transition-colors ${
                    task.isCompleted
                      ? 'bg-green-500/20 border-green-400/30 hover:bg-green-500/30'
                      : 'bg-yellow-500/20 border-yellow-400/30 hover:bg-yellow-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <CheckSquare 
                      size={12} 
                      className={`flex-shrink-0 ${
                        task.isCompleted ? 'text-green-300' : 'text-yellow-300'
                      }`} 
                    />
                    <span className={`text-xs truncate ${
                      task.isCompleted ? 'text-green-200' : 'text-yellow-200'
                    }`}>
                      {task.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-purple-200">{filteredEvents.length} Events</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-purple-200">{filteredTasks.filter(t => t.isCompleted).length} Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span className="text-purple-200">{filteredTasks.filter(t => !t.isCompleted).length} Pending</span>
        </div>
      </div>
    </div>
  );
}
