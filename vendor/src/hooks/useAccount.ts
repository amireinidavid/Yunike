import { useEffect, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import useAuthStore from '../store/useAuthStore';

/**
 * Hook for accessing and managing account data
 * Automatically fetches vendor profile data on mount
 */
export const useAccount = () => {
  // Get store values and actions
  const {
    vendorProfile,
    userProfile,
    isLoading,
    error,
    getVendorProfile,
    updateVendorProfile,
    deleteVendorAccount,
    uploadVendorLogo,
    uploadVendorBanner,
    uploadVendorCover,
    uploadProfileImage,
    updateUserProfile,
  } = useAccountStore();
  
  // Get authentication state
  const { isAuthenticated, accessToken, initializeAuth } = useAuthStore();
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);

  // Fetch vendor profile data on mount with auth handling
  useEffect(() => {
    const loadProfile = async () => {
      // Skip if already attempted or already loading
      if (initialLoadAttempted || isLoading) return;
      
      // Mark initial load attempted
      setInitialLoadAttempted(true);
      
      try {
        // Check if we're authenticated
        if (!isAuthenticated || !accessToken) {
          console.log('Not authenticated, attempting to restore session...');
          const restored = await initializeAuth();
          if (!restored) {
            console.log('Could not restore session for profile fetch');
            return;
          }
        }
        
        // Attempt to fetch profile
        console.log('Fetching vendor profile data...');
        await getVendorProfile();
      } catch (err) {
        console.error('Error in useAccount hook:', err);
      }
    };
    
    loadProfile();
  }, [getVendorProfile, isAuthenticated, accessToken, initializeAuth, initialLoadAttempted, isLoading]);

  // File upload helpers with type validation
  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      console.log('Uploading logo:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      const result = await uploadVendorLogo(file);
      console.log('Logo upload result:', result);
      return result;
    } catch (error) {
      console.error('Logo upload error:', error);
      throw error;
    }
  };

  const uploadBanner = async (file: File): Promise<string | null> => {
    try {
      console.log('Uploading banner:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      const result = await uploadVendorBanner(file);
      console.log('Banner upload result:', result);
      return result;
    } catch (error) {
      console.error('Banner upload error:', error);
      throw error;
    }
  };

  const uploadCover = async (file: File): Promise<string | null> => {
    try {
      console.log('Uploading cover:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      const result = await uploadVendorCover(file);
      console.log('Cover upload result:', result);
      return result;
    } catch (error) {
      console.error('Cover upload error:', error);
      throw error;
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    try {
      console.log('Uploading profile picture:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      const result = await uploadProfileImage(file);
      console.log('Profile picture upload result:', result);
      return result;
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw error;
    }
  };

  return {
    // State
    vendorProfile,
    userProfile,
    isLoading,
    error,
    
    // Basic actions
    getVendorProfile,
    updateVendorProfile,
    deleteVendorAccount,
    updateUserProfile,
    
    // Enhanced file upload methods
    uploadLogo,
    uploadBanner,
    uploadCover,
    uploadProfilePicture
  };
}; 