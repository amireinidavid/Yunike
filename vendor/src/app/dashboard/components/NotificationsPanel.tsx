'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  X
} from 'lucide-react';
import { notifications } from '../data/mockData';

const NotificationsPanel = () => {
  // Format date for display
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Get background color class based on notification type
  const getNotificationColorClass = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-secondary/10 border-secondary/20';
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4 flex justify-between items-center">
        <span>Notifications</span>
        {notifications.length > 0 && (
          <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
            {notifications.length} New
          </span>
        )}
      </h2>

      {notifications.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center shadow-sm">
          <p className="text-muted-foreground">No new notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`rounded-xl border p-4 relative ${getNotificationColorClass(notification.type)}`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(notification.date)}
                  </p>
                </div>
                <button className="h-6 w-6 rounded-full hover:bg-secondary/20 flex items-center justify-center">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {notifications.length > 0 && (
        <div className="text-center mt-4">
          <button className="text-sm text-primary hover:underline">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel; 