'use client';

import { useEffect } from 'react';
import { initializeAuth } from '@/utils/authInitializer';

// This component is kept for backward compatibility
// It's now just a wrapper around our new auth system
export default function AuthInitializer() {
  useEffect(() => {
    // Log deprecation warning
    console.warn('AuthInitializer is deprecated. Please use the AuthProvider instead.');
    
    // Still initialize auth for backward compatibility
    const init = async () => {
      await initializeAuth();
    };
    
    init();
  }, []);

  return null; // This component doesn't render anything
} 