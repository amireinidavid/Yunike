'use client';

import React from 'react';
import { 
  HardDrive, 
  Package, 
  Wifi, 
  CheckCircle2, 
  Store,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { systemHealth, storeStatus } from '../data/mockData';

// Progress bar component
const ProgressBar = ({ 
  value, 
  max, 
  label,
  unit,
  icon,
  warningThreshold = 80 // percentage at which color changes to warning
}: { 
  value: number; 
  max: number; 
  label: string;
  unit: string;
  icon: React.ReactNode;
  warningThreshold?: number;
}) => {
  const percentage = (value / max) * 100;
  const isWarning = percentage >= warningThreshold;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 text-sm">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-sm font-medium">
          {value} / {max} {unit}
        </div>
      </div>
      <div className="h-2 bg-secondary/20 rounded overflow-hidden">
        <div 
          className={`h-full rounded ${isWarning ? 'bg-amber-500' : 'bg-primary'}`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
};

const SystemHealth = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Plan Limits */}
      <div className="bg-card rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span>System Limits</span>
          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
            {systemHealth.plan}
          </span>
        </h2>
        
        <div className="mb-6">
          <ProgressBar 
            value={systemHealth.storage.used} 
            max={systemHealth.storage.total} 
            label="Storage"
            unit={systemHealth.storage.unit}
            icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}
            warningThreshold={85}
          />
          
          <ProgressBar 
            value={systemHealth.products.active} 
            max={systemHealth.products.limit} 
            label="Products"
            unit=""
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
            warningThreshold={90}
          />
          
          <ProgressBar 
            value={systemHealth.bandwidth.used} 
            max={systemHealth.bandwidth.total} 
            label="Bandwidth"
            unit={systemHealth.bandwidth.unit}
            icon={<Wifi className="h-4 w-4 text-muted-foreground" />}
            warningThreshold={80}
          />
        </div>
        
        <div className="border-t border-secondary/10 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Next billing</span>
            </div>
            <div className="text-sm font-medium">
              {systemHealth.renewalDate} · {systemHealth.billingAmount}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button className="w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
      
      {/* Store Status */}
      <div className="bg-card rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-medium mb-4">Store Status</h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${storeStatus.online ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-medium">Store is currently </span>
                <span className={`font-medium ml-1 ${storeStatus.online ? 'text-green-500' : 'text-red-500'}`}>
                  {storeStatus.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {storeStatus.online 
                  ? 'Your store is visible to customers' 
                  : 'Your store is hidden from customers'}
              </p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg border border-secondary/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>Active Products</span>
              </div>
              <span className="font-medium">{storeStatus.activeProducts}</span>
            </div>
          </div>
          
          {storeStatus.productsNeedingAttention > 0 && (
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-400">Products needing attention</span>
                </div>
                <span className="font-medium text-amber-400">
                  {storeStatus.productsNeedingAttention}
                </span>
              </div>
            </div>
          )}
          
          <div className="p-3 rounded-lg border border-secondary/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Approval Status</span>
              </div>
              <span className="capitalize font-medium text-green-500">
                {storeStatus.approvalStatus}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button className="w-full py-2 px-4 bg-secondary/20 hover:bg-secondary/30 text-card-foreground rounded-lg text-sm font-medium transition-colors">
            {storeStatus.online ? 'Take Store Offline' : 'Set Store Online'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth; 