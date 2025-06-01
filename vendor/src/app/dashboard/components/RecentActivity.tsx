'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ShoppingBag, Package, MessageSquare, 
  Check, Truck, CircleAlert 
} from 'lucide-react';
import { recentOrders, productUpdates, customerMessages } from '../data/mockData';

type ActivityTab = 'orders' | 'products' | 'messages';

const RecentActivity = () => {
  const [activeTab, setActiveTab] = useState<ActivityTab>('orders');

  // Format date for display
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Get status icon for orders
  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <CircleAlert className="h-4 w-4 text-amber-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <CircleAlert className="h-4 w-4 text-neutral-500" />;
    }
  };

  // Get icon for product update type
  const getProductEventIcon = (event: string) => {
    switch (event) {
      case 'low_stock':
        return <CircleAlert className="h-4 w-4 text-amber-500" />;
      case 'new_review':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'price_change':
        return <Package className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4 text-neutral-500" />;
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="border-b border-card/10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'orders' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Recent Orders
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'products' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
          >
            <Package className="h-4 w-4" />
            Product Updates
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'messages' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center p-2 hover:bg-secondary/10 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{order.id}</div>
                    <div className="flex items-center">
                      {getOrderStatusIcon(order.status)}
                      <span className="ml-1.5 text-xs capitalize">{order.status}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>{order.customer} • {order.items} items</span>
                    <span className="font-medium">{order.total}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(order.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-3">
            {productUpdates.map((update) => (
              <div key={update.id} className="flex items-start p-2 hover:bg-secondary/10 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{update.name}</div>
                    <div className="flex items-center">
                      {getProductEventIcon(update.event)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {update.details}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(update.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-3">
            {customerMessages.map((message) => (
              <div key={message.id} className="flex items-start p-2 hover:bg-secondary/10 rounded-lg">
                <div className={`h-10 w-10 rounded-full ${message.read ? 'bg-secondary/20' : 'bg-primary/20'} flex items-center justify-center mr-3`}>
                  <MessageSquare className={`h-5 w-5 ${message.read ? 'text-muted-foreground' : 'text-primary'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className={`font-medium ${!message.read ? 'text-primary' : ''}`}>
                      {message.customer}
                    </div>
                    {!message.read && (
                      <div className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                        New
                      </div>
                    )}
                  </div>
                  <div className={`text-sm ${!message.read ? 'font-medium' : 'text-muted-foreground'}`}>
                    {message.subject}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(message.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity; 