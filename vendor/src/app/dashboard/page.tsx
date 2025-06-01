'use client';

import React, { Suspense } from 'react';
import WelcomeSection from './components/WelcomeSection';
import KpiCards from './components/KpiCards';
import ChartSection from './components/ChartSection';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import AiSuggestions from './components/AiSuggestions';
import SystemHealth from './components/SystemHealth';
import NotificationsPanel from './components/NotificationsPanel';

// Loading placeholders
const SectionLoader = ({ height = 'h-32' }: { height?: string }) => (
  <div className={`bg-card animate-pulse rounded-xl ${height}`}></div>
);

const VendorDashboardPage = () => {
  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Section */}
      <Suspense fallback={<SectionLoader height="h-24" />}>
        <WelcomeSection />
      </Suspense>
      
      {/* KPI Cards */}
      <Suspense fallback={<SectionLoader height="h-40" />}>
        <KpiCards />
      </Suspense>
      
      {/* Quick Actions */}
      <Suspense fallback={<SectionLoader />}>
        <QuickActions />
      </Suspense>
      
      {/* Charts */}
      <Suspense fallback={<SectionLoader height="h-80" />}>
        <ChartSection />
      </Suspense>
      
      {/* Two-column layout for bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Recent Activity */}
          <Suspense fallback={<SectionLoader height="h-80" />}>
            <RecentActivity />
          </Suspense>
          
          {/* AI Suggestions */}
          <Suspense fallback={<SectionLoader />}>
            <AiSuggestions />
          </Suspense>
        </div>
        
        <div className="space-y-6">
          {/* Notifications Panel */}
          <Suspense fallback={<SectionLoader />}>
            <NotificationsPanel />
          </Suspense>
          
          {/* System Health (can be stacked in the right column) */}
          <Suspense fallback={<SectionLoader />}>
            <SystemHealth />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;

