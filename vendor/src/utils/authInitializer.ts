import { setupApiInterceptors } from './api';
import useAuthStore from '../store/useAuthStore';
// Import the API patches to ensure the extended methods are available
import './apiPatches';

/**
 * Initialize the authentication system
 * This function should be called early in your app initialization
 * Now enhanced to work across all routes in the application
 * 
 * @returns {Promise<boolean>} True if successfully authenticated
 */
export async function initializeAuth() {
  console.log('🔐 Initializing authentication system globally...');
  
  // Set up API interceptors to handle token refresh
  setupApiInterceptors();
  
  // Initialize auth state from tokens
  const authStore = useAuthStore.getState();
  
  try {
    // Check for tokens in localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.log('🔐 Auth tokens in storage:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken 
    });
    
    // First check if we already have a valid token
    if (authStore.accessToken) {
      console.log('✅ Auth initialization: Found existing access token in store');
      return true;
    }
    
    // Otherwise try to restore from storage or refresh token
    console.log('🔄 Trying to initialize auth state from storage...');
  const authInitialized = await authStore.initializeAuth();
  
    // If that fails but we have a refresh token, try refreshing
    if (!authInitialized && refreshToken) {
      console.log('🔄 Auth initialization: Attempting explicit token refresh');
      const refreshed = await authStore.refreshToken();
      if (refreshed) {
        console.log('✅ Auth initialization: Successfully refreshed token');
        return true;
      } else {
        console.log('❌ Auth initialization: Token refresh failed');
      }
    }
    
    console.log('🔐 Auth initialization completed, authenticated:', authInitialized);
  return authInitialized;
  } catch (error) {
    console.error('❌ Auth initialization failed:', error);
    return false;
  }
}

/**
 * Check if the user is currently authenticated
 * Synchronous version for quick checks
 * 
 * @returns {boolean} Whether the user is authenticated
 */
export function isAuthenticated() {
  const authStore = useAuthStore.getState();
  const authenticated = authStore.isAuthenticated && !!authStore.accessToken;
  console.log('🔐 Auth check:', authenticated);
  return authenticated;
}

/**
 * Attempt to refresh the access token if needed
 * 
 * @returns {Promise<boolean>} Whether the refresh was successful
 */
export async function refreshTokenIfNeeded() {
  const authStore = useAuthStore.getState();
  
  // If we have an access token, we're good
  if (authStore.accessToken) {
    console.log('✅ Token check: Access token exists, no refresh needed');
    return true;
  }
  
  // Check if we have a refresh token
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.log('❌ Token check: No refresh token available');
    return false;
  }
  
  // Otherwise try to refresh
  console.log('🔄 Attempting to refresh token for route access');
  try {
    const refreshed = await refreshAccessTokenManually();
    console.log('🔄 Token refresh result:', refreshed);
    return refreshed;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return false;
  }
}

/**
 * Direct method for any component to refresh the access token
 * This is a helper that can be imported and used anywhere
 */
export async function refreshAccessTokenManually() {
  console.log('🔄 Direct access token refresh requested');

  // Always attempt refresh; browser will send cookie if present
  try {
    const API_URL = 'http://localhost:5001/api';
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // No body: backend expects refresh token in cookie
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('❌ Manual refresh failed:', response.status);
      return false;
    }

    const data = await response.json();

    if (data && data.accessToken) {
      console.log('✅ Manual token refresh successful');
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      const authStore = useAuthStore.getState();
      authStore.setTokenAndUser(data.accessToken, data.user || null);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Manual token refresh error:', error);
    return false;
  }
} 