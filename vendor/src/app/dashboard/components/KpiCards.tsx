'use client';

import React from 'react';
import { 
  TrendingUp, ShoppingCart, Package, 
  Users, Star, ArrowUp, ArrowDown 
} from 'lucide-react';
import { kpiData } from '../data/mockData';

// Map string icon names to actual components
const iconMap: Record<string, React.ReactNode> = {
  'TrendingUp': <TrendingUp className="h-5 w-5" />,
  'ShoppingCart': <ShoppingCart className="h-5 w-5" />,
  'Package': <Package className="h-5 w-5" />,
  'Users': <Users className="h-5 w-5" />,
  'Star': <Star className="h-5 w-5" />
};

const KpiCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpiData.map((kpi) => (
        <div 
          key={kpi.id}
          className="bg-card p-4 rounded-xl shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-start">
            <div className="rounded-lg bg-primary/10 p-2">
              {iconMap[kpi.icon] || <TrendingUp className="h-5 w-5 text-primary" />}
            </div>
            
            {/* Change indicator */}
            <div className={`flex items-center text-xs font-medium
              ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
            >
              {kpi.trend === 'up' ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(kpi.change)}%
            </div>
          </div>
          
          <div className="mt-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </h3>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-card-foreground">
                {kpi.value}
              </p>
              {kpi.period && (
                <p className="ml-2 text-xs text-muted-foreground">
                  {kpi.period}
                </p>
              )}
            </div>
          </div>
          
          {/* Optional: Add a small sparkline chart here */}
        </div>
      ))}
    </div>
  );
};

export default KpiCards; 