'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Tag, 
  Truck, 
  Mail,
  ArrowRight 
} from 'lucide-react';

// Quick action button component
const ActionButton = ({ 
  icon, 
  title, 
  description, 
  href,
  color = 'primary'
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  href: string;
  color?: 'primary' | 'purple' | 'blue' | 'amber';
}) => {
  // Get color classes based on the color prop
  const getColorClasses = () => {
    switch (color) {
      case 'purple':
        return {
          bg: 'bg-purple-500/10 hover:bg-purple-500/20',
          border: 'border-purple-500/20',
          text: 'text-purple-400',
        };
      case 'blue':
        return {
          bg: 'bg-blue-500/10 hover:bg-blue-500/20',
          border: 'border-blue-500/20',
          text: 'text-blue-400',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 hover:bg-amber-500/20',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
        };
      default:
        return {
          bg: 'bg-primary/10 hover:bg-primary/20',
          border: 'border-primary/20',
          text: 'text-primary',
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <Link 
      href={href} 
      className={`block rounded-xl p-4 ${colorClasses.bg} border ${colorClasses.border} transition-colors`}
    >
      <div className="flex justify-between items-start">
        <div className={`rounded-full p-2 ${colorClasses.bg} ${colorClasses.text} mb-3`}>
          {icon}
        </div>
        <ArrowRight className={`h-5 w-5 ${colorClasses.text} opacity-60`} />
      </div>
      
      <h3 className="font-medium text-card-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
};

const QuickActions = () => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ActionButton 
            icon={<PlusCircle className="h-5 w-5" />}
            title="Add New Product"
            description="Create a new listing in your store"
            href="/products/new"
            color="primary"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ActionButton 
            icon={<Tag className="h-5 w-5" />}
            title="Create Discount"
            description="Set up promotions and coupons"
            href="/marketing/discounts/new"
            color="purple"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ActionButton 
            icon={<Truck className="h-5 w-5" />}
            title="Ship Orders"
            description="Process and fulfill pending orders"
            href="/orders/pending"
            color="blue"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ActionButton 
            icon={<Mail className="h-5 w-5" />}
            title="Customer Messages"
            description="Respond to customer inquiries"
            href="/messages"
            color="amber"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuickActions; 