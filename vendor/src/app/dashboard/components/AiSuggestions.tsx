'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  Lightbulb,
  TrendingUp,
  Search,
  DollarSign
} from 'lucide-react';
import { aiSuggestions } from '../data/mockData';

// Get icon for AI suggestion type
const getSuggestionIcon = (type: string) => {
  switch (type) {
    case 'inventory':
      return <Zap className="h-5 w-5" />;
    case 'trending':
      return <TrendingUp className="h-5 w-5" />;
    case 'optimization':
      return <Search className="h-5 w-5" />;
    case 'pricing':
      return <DollarSign className="h-5 w-5" />;
    default:
      return <Lightbulb className="h-5 w-5" />;
  }
};

// Get color classes for AI suggestion type
const getSuggestionColorClasses = (type: string) => {
  switch (type) {
    case 'inventory':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
      };
    case 'trending':
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-400',
      };
    case 'optimization':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
      };
    case 'pricing':
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
      };
    default:
      return {
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        text: 'text-primary',
      };
  }
};

const AiSuggestions = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-medium">AI Suggestions</h2>
        <div className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
          Smart
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiSuggestions.map((suggestion, index) => {
          const colorClasses = getSuggestionColorClasses(suggestion.type);
          
          return (
            <motion.div 
              key={suggestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border ${colorClasses.border} rounded-xl p-4 ${colorClasses.bg}`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-full p-2 ${colorClasses.bg} ${colorClasses.text}`}>
                  {getSuggestionIcon(suggestion.type)}
                </div>
                
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {suggestion.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(suggestion.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  
                  <p className="text-sm">{suggestion.message}</p>
                  
                  <div className="mt-3 flex space-x-2">
                    <button className={`text-xs ${colorClasses.text} font-medium py-1 px-2 rounded-md ${colorClasses.bg} hover:opacity-80`}>
                      Take Action
                    </button>
                    <button className="text-xs text-muted-foreground py-1 px-2 rounded-md hover:bg-secondary/20">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AiSuggestions; 