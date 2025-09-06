'use client';

import { useState, useEffect } from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Reminder } from '@/lib/reminder-system';

interface NotificationBannerProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function NotificationBanner({
  variant = 'info',
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-500/20 border-green-400/30',
          text: 'text-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-300',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20 border-yellow-400/30',
          text: 'text-yellow-200',
          icon: AlertCircle,
          iconColor: 'text-yellow-300',
        };
      case 'error':
        return {
          bg: 'bg-red-500/20 border-red-400/30',
          text: 'text-red-200',
          icon: AlertCircle,
          iconColor: 'text-red-300',
        };
      default:
        return {
          bg: 'bg-blue-500/20 border-blue-400/30',
          text: 'text-blue-200',
          icon: Info,
          iconColor: 'text-blue-300',
        };
    }
  };

  const styles = getVariantStyles();
  const Icon = styles.icon;

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`p-4 rounded-lg border backdrop-blur-sm ${styles.bg}`}>
        <div className="flex items-start space-x-3">
          <Icon size={20} className={`flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`font-medium ${styles.text} mb-1`}>
                {title}
              </h4>
            )}
            <p className={`text-sm ${styles.text}`}>
              {message}
            </p>
          </div>

          <button
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors ${styles.iconColor}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Container component for managing multiple notifications
interface NotificationContainerProps {
  children?: React.ReactNode;
}

export function NotificationContainer({ children }: NotificationContainerProps) {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    reminder: Reminder;
  }>>([]);

  useEffect(() => {
    const handleReminder = (event: CustomEvent<Reminder>) => {
      const reminder = event.detail;
      const id = `${reminder.id}-${Date.now()}`;
      
      setNotifications(prev => [...prev, { id, reminder }]);
    };

    window.addEventListener('voiceflow-reminder', handleReminder as EventListener);
    
    return () => {
      window.removeEventListener('voiceflow-reminder', handleReminder as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(({ id, reminder }) => (
          <NotificationBanner
            key={id}
            variant="info"
            title={reminder.title}
            message={reminder.message}
            onClose={() => removeNotification(id)}
            autoClose={true}
            autoCloseDelay={8000}
          />
        ))}
      </div>
    </>
  );
}

// Hook for programmatic notifications
export function useNotifications() {
  const showNotification = (notification: Omit<NotificationBannerProps, 'onClose'>) => {
    // Create a temporary element to render the notification
    const container = document.createElement('div');
    document.body.appendChild(container);

    const cleanup = () => {
      document.body.removeChild(container);
    };

    // This would typically use a portal or context, but for simplicity:
    // You can dispatch a custom event or use a notification context
    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: { ...notification, onClose: cleanup }
    }));
  };

  return { showNotification };
}
