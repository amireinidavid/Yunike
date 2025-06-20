const API_URL = 'http://localhost:5001/api';
import axios from 'axios';

// Create axios instance with defaults
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Authentication API routes
export const authApi = {
  // Authentication - Registration
  register: `/auth/register`,
  verifyRegistrationOTP: `/auth/register/verify-otp`,
  resendRegistrationOTP: `/auth/register/resend-otp`,
  
  // Authentication - Login
  login: `/auth/login`,
  verifyLoginOTP: `/auth/login/verify-otp`, 
  resendLoginOTP: `/auth/login/resend-otp`,
  adminLogin: `/auth/admin/login`,
  
  // Session management
  logout: `/auth/logout`,
  refreshToken: `/auth/refresh-token`,
  
  // Email verification
  verifyEmail: `/auth/verify-email`,
  resendVerification: `/auth/resend-verification`,
  
  // Password management
  forgotPassword: `/auth/forgot-password`,
  resetPassword: `/auth/reset-password`,
  changePassword: `/auth/change-password`,
  
  // User profile
  getProfile: `/auth/profile`,
  updateProfile: `/auth/profile`,
  
  // OAuth
  googleAuth: `/auth/google`,
  
  // Session management
  getSessions: `/auth/sessions`,
  revokeSession: (sessionId: string): string => `/auth/sessions/${sessionId}`,
  revokeAllSessions: `/auth/sessions`,
  
  // Vendor registration
  createVendorProfile: `/auth/vendor/create-profile`,
  
  // CSRF protection
  getCsrfToken: `/auth/csrf-token`
};

// Account API routes
export const accountApi = {
  // Vendor profile routes
  getVendorProfile: `/account/vendor/profile`,
  updateVendorProfile: `/account/vendor/profile`,
  deleteVendorAccount: `/account/vendor/account`,
  
  // Image upload routes
  uploadVendorLogo: `/account/vendor/logo`,
  uploadVendorBanner: `/account/vendor/banner`,
  uploadVendorCover: `/account/vendor/cover`,
  uploadProfileImage: `/account/profile/image`,
  
  // User profile routes
  updateUserProfile: `/account/profile`
};

// Stripe Connect API routes
export const stripeApi = {
  // Create a Connect account for a vendor
  createConnectAccount: (vendorId: string) => `/stripe/connect/accounts/${vendorId}`,
  
  // Generate an account onboarding link
  getOnboardingLink: (vendorId: string) => `/stripe/connect/account-links/${vendorId}`,
  
  // Get vendor's Stripe account status
  getAccountStatus: (vendorId: string) => `/stripe/connect/accounts/${vendorId}`,
  
  // Update vendor's payout schedule
  updatePayoutSchedule: (vendorId: string) => `/stripe/connect/payout-schedule/${vendorId}`,
  
  // Create direct vendor connect link with Stripe hosted onboarding
  createDirectLink: (vendorId: string) => `/stripe/connect/direct-link/${vendorId}`,
  
  // Disconnect a vendor's Stripe Connect account
  disconnectAccount: (vendorId: string) => `/stripe/connect/accounts/${vendorId}`,
};

// Product API routes
export const productApi = {
  // Public routes for fetching products
  getAllProducts: `/products`,
  getFeaturedProducts: `/products/featured`,
  getProductById: (id: string): string => `/products/${id}`,
  getProductBySlug: (slug: string): string => `/products/slug/${slug}`,
  getRelatedProducts: (productId: string): string => `/products/${productId}/related`,
  getVendorProducts: (vendorId: string): string => `/products/vendor/${vendorId}`,
  getVendorProductsBySlug: (slug: string): string => `/products/vendor/slug/${slug}`,
  searchProducts: `/products/search`,
  
  // Protected vendor routes for managing products
  createProduct: `/products`,
  updateProduct: (id: string): string => `/products/edit/${id}`,
  deleteProduct: (id: string): string => `/products/delete/${id}`,
  updateInventory: (productId: string): string => `/products/${productId}/inventory`,
  getVendorDashboardProduct: (id: string): string => `/products/get/${id}`
};

// Basic API helper functions
export const api = {
  // HTTP methods
  get: async (url: string, token: string | null = null): Promise<any> => {
    try {
      // Get the freshest token available - either passed in or from localStorage
      let accessToken = token;
      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log(`🔐 Using fresh token from localStorage for GET ${url}`);
        }
      }
      
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      
      console.log(`Making GET request to ${url} with auth:`, !!accessToken);
      const response = await axiosInstance.get(url, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`API Error (GET ${url}):`, error);
      if (error.response) {
        // Server responded with an error
        return error.response.data;
      }
      return { error: error.message || 'Network error occurred' };
    }
  },
  
  post: async (url: string, data: Record<string, any> = {}, token: string | null = null): Promise<any> => {
    try {
      // Get the freshest token available - either passed in or from localStorage
      let accessToken = token;
      if (!accessToken && url !== authApi.refreshToken) {
        accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log(`🔐 Using fresh token from localStorage for POST ${url}`);
        }
      }
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('🔐 [api.ts] Sending Authorization header:', accessToken.slice(0, 12) + '...');
      } else {
        console.warn('⚠️ [api.ts] No access token found for POST', url);
      }
      console.log(`Making POST request to ${url} with auth:`, !!accessToken);
      const response = await axiosInstance.post(url, data, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`API Error (POST ${url}):`, error);
      if (error.response) {
        // Server responded with an error
        return error.response.data;
      }
      return { error: error.message || 'Network error occurred' };
    }
  },
  
  put: async (url: string, data: Record<string, any> = {}, token: string | null = null): Promise<any> => {
    try {
      // Get the freshest token available - either passed in or from localStorage
      let accessToken = token;
      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log(`🔐 Using fresh token from localStorage for PUT ${url}`);
        }
      }
      
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      
      console.log(`Making PUT request to ${url} with auth:`, !!accessToken);
      const response = await axiosInstance.put(url, data, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`API Error (PUT ${url}):`, error);
      if (error.response) {
        // Server responded with an error
        return error.response.data;
      }
      return { error: error.message || 'Network error occurred' };
    }
  },
  
  delete: async (url: string, token: string | null = null): Promise<any> => {
    try {
      // Get the freshest token available - either passed in or from localStorage
      let accessToken = token;
      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log(`🔐 Using fresh token from localStorage for DELETE ${url}`);
        }
      }
      
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      
      console.log(`Making DELETE request to ${url} with auth:`, !!accessToken);
      const response = await axiosInstance.delete(url, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`API Error (DELETE ${url}):`, error);
      if (error.response) {
        // Server responded with an error
        return error.response.data;
      }
      return { error: error.message || 'Network error occurred' };
    }
  },
  
  patch: async (url: string, data: Record<string, any> = {}, token: string | null = null): Promise<any> => {
    try {
      // Get the freshest token available - either passed in or from localStorage
      let accessToken = token;
      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log(`🔐 Using fresh token from localStorage for PATCH ${url}`);
        }
      }
      
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      
      console.log(`Making PATCH request to ${url} with auth:`, !!accessToken);
      const response = await axiosInstance.patch(url, data, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`API Error (PATCH ${url}):`, error);
      if (error.response) {
        // Server responded with an error
        return error.response.data;
      }
      return { error: error.message || 'Network error occurred' };
    }
  },
  
  // Get access token from cookies or localStorage
  getAccessToken: (): string | null => {
    // First try localStorage (most reliable across environments)
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('accessToken');
      if (localToken) {
        console.log('🔐 Using auth token from localStorage');
        return localToken;
      }
    }
    
    // Then try cookies as fallback
    if (typeof document !== 'undefined') {
      // Parse cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key.trim()] = value;
        return acc;
      }, {} as Record<string, string>);
      
      const cookieToken = cookies['accessToken'];
      if (cookieToken) {
        console.log('🔐 Using auth token from cookies');
        return cookieToken;
      }
    }
    
    console.log('⚠️ No auth token found in storage');
    return null;
  },
  
  // Check if refresh token exists in cookies
  hasRefreshToken: (): boolean => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=').map(part => part.trim());
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      return !!cookies['refreshToken'];
    }
    return false;
  },
  
  // Refresh the access token using refresh token
  refreshAccessToken: async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh access token...');
      
      // We shouldn't use the axios instance directly to avoid interceptor loops
      // Instead, we'll make a direct POST request to the refresh token endpoint
      const response = await fetch(`${API_URL}${authApi.refreshToken}`, {
        method: 'POST',
        credentials: 'include', // Important for including cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.accessToken) {
        console.log('Access token refreshed successfully via api util');
        
        // Access the auth store directly to update the token
        const authStore = (await import('../store/useAuthStore')).default;
        authStore.setState({ 
          accessToken: data.accessToken,
          isAuthenticated: true
        });
        
        // If user data is included, update that too
        if (data.user) {
          authStore.setState({ user: data.user });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      return false;
    }
  },
  
  // Upload files (FormData) - useful for image uploads
  uploadFile: async (url: string, formData: FormData, token: string | null = null): Promise<any> => {
    try {
      // Debug formData contents
      console.log(`Preparing to upload file to ${url}`);
      const formDataEntries: string[] = [];
      for (const entry of formData.entries()) {
        if (entry[1] instanceof File) {
          const file = entry[1] as File;
          formDataEntries.push(`${entry[0]}: File(${file.name}, ${file.type}, ${file.size} bytes)`);
        } else {
          formDataEntries.push(`${entry[0]}: ${entry[1]}`);
        }
      }
      console.log('FormData contents:', formDataEntries);
      
      // Use provided token or get from cookies/storage
      let accessToken = token || api.getAccessToken();
      
      // If no access token but refresh token exists, try to refresh
      if (!accessToken && api.hasRefreshToken()) {
        await api.refreshAccessToken();
        accessToken = api.getAccessToken();
      }
      
      const headers: Record<string, string> = {
        // Don't set Content-Type for FormData, let the browser set it with boundary
      };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      
      console.log(`Making upload request to ${url} with auth:`, !!accessToken);
      const response = await axiosInstance.post(url, formData, { 
        headers,
        // Add these options to make sure FormData is properly processed
        transformRequest: [(data) => data]
      });
      
      console.log(`Upload response status: ${response.status}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`API Error (Upload ${url}):`, error);
      if (error.response) {
        // Server responded with an error
        console.error('Server response:', error.response.data);
        return error.response.data;
      }
      return { error: error.message || 'Network error occurred' };
    }
  },
  
  // Add this to the api object
  manualRefreshToken: async (): Promise<boolean> => {
    console.log('🔄 Manual API token refresh requested');
    
    // Check for refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('❌ No refresh token available for manual refresh');
      return false;
    }
    
    try {
      // Make a direct fetch call to avoid interceptor issues
      const response = await fetch(`${API_URL}${authApi.refreshToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('❌ Manual refresh failed:', response.status);
        return false;
      }
      
      const data = await response.json();
      
      if (data && data.accessToken) {
        console.log('✅ Manual token refresh successful');
        
        // Save to localStorage
        localStorage.setItem('accessToken', data.accessToken);
        
        // Update auth store if available
        try {
          const authStore = (await import('../store/useAuthStore')).default;
          authStore.setState({ 
            accessToken: data.accessToken,
            isAuthenticated: true,
            ...(data.user ? { user: data.user } : {})
          });
          console.log('✅ Auth store updated with new token');
        } catch (error) {
          console.error('Failed to update auth store, but token saved to localStorage');
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Manual token refresh error:', error);
      return false;
    }
  },
};

// Setup API interceptors
export function setupApiInterceptors() {
  console.log('🔧 Setting up API interceptors...');
  
  // Variable to track if token refresh is in progress
  let isRefreshing = false;
  
  // Queue of requests waiting for token refresh
  let refreshQueue: Array<(token: string | null) => void> = [];
  
  // Helper to process queued requests with new token
  const processQueue = (newToken: string | null) => {
    console.log(`🔄 Processing queued requests (${refreshQueue.length}), token:`, !!newToken);
      refreshQueue.forEach(callback => callback(newToken));
    refreshQueue = [];
  };
  
  // Update the request interceptor to check localStorage for tokens
  axiosInstance.interceptors.request.use(
    config => {
      // Always check localStorage first for the freshest token
      const localToken = localStorage.getItem('accessToken');
      if (localToken) {
        console.log('🔐 Request interceptor: Using token from localStorage');
        config.headers.Authorization = `Bearer ${localToken}`;
      } else {
        // Fall back to auth store if needed
      const token = api.getAccessToken();
      if (token) {
          console.log('🔐 Request interceptor: Using token from api.getAccessToken');
        config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    error => Promise.reject(error)
  );
  
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Handle 401 Unauthorized errors (token expired)
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        // Debug info about the 401 error
        console.log('🔐 API 401 error intercepted:', originalRequest.url);
        
        // Avoid infinite loops
        if (originalRequest.url.includes('/auth/refresh-token')) {
          console.log('❌ Refresh token request failed, user needs to log in');
          
          // Clear tokens from localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Reset auth state and clear queue
          const authStore = (await import('../store/useAuthStore')).default;
          authStore.getState().clearState();
          processQueue(null);
          
          return Promise.reject(error);
        }
        
        // Set retry flag to prevent duplicate refresh attempts
        originalRequest._retry = true;
        
        // If refresh is already in progress, queue this request
        if (isRefreshing) {
          console.log('🔄 Token refresh in progress, queueing request...');
          
          return new Promise((resolve, reject) => {
            refreshQueue.push(newToken => {
              if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(axiosInstance(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }
        
        // Start refresh process
        isRefreshing = true;
        console.log('🔄 Token expired, attempting to refresh...');
        
        try {
          // Use direct fetch to avoid interceptor loops
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          // Make direct fetch call to the refresh endpoint
          const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include'
          });
          
          if (!refreshResponse.ok) {
            throw new Error(`Refresh failed with status: ${refreshResponse.status}`);
          }
          
          const data = await refreshResponse.json();
          
          if (data && data.accessToken) {
            // Save new token to localStorage
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            
            // Update auth store
            const authStore = (await import('../store/useAuthStore')).default;
            authStore.getState().setTokenAndUser(data.accessToken, data.user || null);
            
            console.log('✅ Token refreshed, updating requests and continuing');
            
              // Update original request with new token
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              
              // Process any queued requests with the new token
            processQueue(data.accessToken);
              
              // Continue with original request
            isRefreshing = false;
              return axiosInstance(originalRequest);
          } else {
            throw new Error('Refresh response did not contain access token');
          }
        } catch (refreshError) {
          console.error('❌ Error refreshing token:', refreshError);
          
          // Clear tokens from localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Reset auth state and clear queue
          const authStore = (await import('../store/useAuthStore')).default;
          authStore.getState().clearState();
          processQueue(null);
          isRefreshing = false;
          
          return Promise.reject(error);
        }
      }
      
      // For other errors, log and reject
      if (error.response) {
        // Log API errors for debugging
        console.error(`API Error: ${error.response.status}`, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('API Error: No response received', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('API Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
}

export default api;
