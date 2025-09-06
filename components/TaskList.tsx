'use client';

import { Task } from '@/lib/types';
import { Check, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string, isCompleted: boolean) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, onToggleComplete, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass-card p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-500 bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-purple-200" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
          <p className="text-purple-200 text-sm">
            Use the voice recorder to create your first task
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.taskId}
          className={`task-item ${task.isCompleted ? 'opacity-60' : ''}`}
        >
          <div className="flex items-start space-x-3">
            <button
              onClick={() => onToggleComplete(task.taskId, !task.isCompleted)}
              className={`
                flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${task.isCompleted 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-purple-300 hover:border-purple-400'
                }
              `}
            >
              {task.isCompleted && <Check size={14} className="text-white" />}
            </button>

            <div className="flex-1 min-w-0">
              <p className={`
                text-white font-medium
                ${task.isCompleted ? 'line-through text-gray-300' : ''}
              `}>
                {task.description}
              </p>
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-purple-200">
                <span className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>
                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </span>
                </span>
                
                {task.dueDate && (
                  <span className="text-yellow-300">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onDeleteTask(task.taskId)}
              className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
