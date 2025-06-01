'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { announcements } from '../data/mockData';

const WelcomeSection = () => {
  const { user } = useAuthStore();
  const userName = user?.name || user?.vendor?.storeName || 'Vendor';
  
  // Get last login time - in a real app this would come from the API
  const lastLoginTime = new Date();
  lastLoginTime.setHours(lastLoginTime.getHours() - 4); // Mock 4 hours ago
  
  const formattedLastLogin = formatDistanceToNow(lastLoginTime, { addSuffix: true });
  
  // Get the most important announcement
  const importantAnnouncement = announcements.find(ann => ann.important);
  
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm mb-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground mt-1">
            Last login {formattedLastLogin}
          </p>
        </div>
        <div className="hidden sm:block">
          <div className="flex space-x-2">
            {/* This could be expanded to show the vendor's avatar */}
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      
      {importantAnnouncement && (
        <div className="mt-4 bg-secondary/20 rounded-lg p-3 flex items-start gap-3">
          <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-card-foreground">{importantAnnouncement.title}</h3>
            <p className="text-sm text-muted-foreground">{importantAnnouncement.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeSection; 