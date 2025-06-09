import { api, axiosInstance } from './api';

// Extend the API interface to add the patch method
interface ApiExtended {
  patch: (url: string, data: Record<string, any>, token?: string | null) => Promise<any>;
}

// Add the patch method to the api object
(api as any).patch = async (url: string, data: Record<string, any> = {}, token: string | null = null): Promise<any> => {
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
};

// Export the extended API
export const apiExtended = api as typeof api & ApiExtended; 