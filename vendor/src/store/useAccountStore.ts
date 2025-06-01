import { create } from 'zustand';
import { accountApi, api } from '../utils/api';

// Type definitions for the store
interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  logo?: string;
  banner?: string;
  coverImage?: string;
  contactEmail: string;
  contactPhone?: string;
  businessAddress: any;
  businessType?: string;
  verificationStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImageUrl?: string;
  isVerified: boolean;
}

interface AccountState {
  // State
  vendorProfile: VendorProfile | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getVendorProfile: () => Promise<void>;
  updateVendorProfile: (data: Partial<VendorProfile>) => Promise<void>;
  deleteVendorAccount: () => Promise<boolean>;
  
  // Image uploads
  uploadVendorLogo: (file: File) => Promise<string | null>;
  uploadVendorBanner: (file: File) => Promise<string | null>;
  uploadVendorCover: (file: File) => Promise<string | null>;
  uploadProfileImage: (file: File) => Promise<string | null>;
  
  // User profile
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Utility
  reset: () => void;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  // Initial state
  vendorProfile: null,
  userProfile: null,
  isLoading: false,
  error: null,
  
  // Get vendor profile
  getVendorProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching vendor profile data...');
      const response = await api.get(accountApi.getVendorProfile);
      
      console.log('Vendor profile API response:', JSON.stringify(response, null, 2));
      
      if (response.status === 'success' && response.data) {
        set({ 
          vendorProfile: response.data,
          userProfile: response.data.user || null,
          isLoading: false
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch vendor profile');
      }
    } catch (error: any) {
      console.error('Vendor profile fetch error:', error);
      set({ 
        error: error.message || 'An error occurred while fetching vendor profile',
        isLoading: false
      });
      return null;
    }
  },
  
  // Update vendor profile
  updateVendorProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(accountApi.updateVendorProfile, data);
      
      if (response.status === 'success' && response.data) {
        set({ 
          vendorProfile: response.data,
          isLoading: false
        });
      } else {
        throw new Error(response.message || 'Failed to update vendor profile');
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'An error occurred while updating vendor profile',
        isLoading: false
      });
    }
  },
  
  // Delete vendor account
  deleteVendorAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(accountApi.deleteVendorAccount);
      
      if (response.status === 'success') {
        set({ 
          vendorProfile: null,
          isLoading: false
        });
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete vendor account');
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'An error occurred while deleting vendor account',
        isLoading: false
      });
      return false;
    }
  },
  
  // Upload vendor logo
  uploadVendorLogo: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.uploadFile(accountApi.uploadVendorLogo, formData);
      
      if (response.status === 'success' && response.data) {
        set((state) => ({
          vendorProfile: state.vendorProfile ? {
            ...state.vendorProfile,
            logo: response.data.logoUrl
          } : null,
          isLoading: false
        }));
        return response.data.logoUrl;
      } else {
        throw new Error(response.message || 'Failed to upload logo');
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'An error occurred while uploading logo',
        isLoading: false
      });
      return null;
    }
  },
  
  // Upload vendor banner
  uploadVendorBanner: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('banner', file);
      
      const response = await api.uploadFile(accountApi.uploadVendorBanner, formData);
      
      if (response.status === 'success' && response.data) {
        set((state) => ({
          vendorProfile: state.vendorProfile ? {
            ...state.vendorProfile,
            banner: response.data.bannerUrl
          } : null,
          isLoading: false
        }));
        return response.data.bannerUrl;
      } else {
        throw new Error(response.message || 'Failed to upload banner');
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'An error occurred while uploading banner',
        isLoading: false
      });
      return null;
    }
  },
  
  // Upload vendor cover image
  uploadVendorCover: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('cover', file);
      
      const response = await api.uploadFile(accountApi.uploadVendorCover, formData);
      
      if (response.status === 'success' && response.data) {
        set((state) => ({
          vendorProfile: state.vendorProfile ? {
            ...state.vendorProfile,
            banner: response.data.coverImageUrl,
            coverImage: response.data.coverImageUrl
          } : null,
          isLoading: false
        }));
        return response.data.coverImageUrl;
      } else {
        throw new Error(response.message || 'Failed to upload cover image');
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'An error occurred while uploading cover image',
        isLoading: false
      });
      return null;
    }
  },
  
  // Upload profile image
  uploadProfileImage: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await api.uploadFile(accountApi.uploadProfileImage, formData);
      
      if (response.status === 'success' && response.data) {
        set((state) => ({
          userProfile: state.userProfile ? {
            ...state.userProfile,
            profileImageUrl: response.data.profileImageUrl
          } : null,
          isLoading: false
        }));
        return response.data.profileImageUrl;
      } else {
        throw new Error(response.message || 'Failed to upload profile image');
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'An error occurred while uploading profile image',
        isLoading: false
      });
      return null;
    }
  },
  
  // Update user profile
  updateUserProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(accountApi.updateUserProfile, data);
      
      if (response.status === 'success' && response.data) {
        set((state) => ({ 
          userProfile: {
            ...state.userProfile,
            ...response.data.user
          },
          isLoading: false
        }));
      } else {
        throw new Error(response.message || 'Failed to update user profile');
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'An error occurred while updating user profile',
        isLoading: false
      });
    }
  },
  
  // Reset state
  reset: () => {
    set({
      vendorProfile: null,
      userProfile: null,
      isLoading: false,
      error: null
    });
  }
}));
